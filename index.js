const ssrUriHelp = require('ssr-uri-help');
const path = require('path')
const fs = require('fs');
let axios = require("axios").default;
let HAProxyConfig = require('haproxy-config');

let subSsrUrlInEnv = process.env["SUB_SSR_URL"];
let subSsrFilterWordsInEnv = process.env["SUB_SSR_FILTER_WORDS"];
let configPathInEnv = process.env["SUB_SSR_CONFIG_PATH"];

const subscribeSsrUrl = subSsrUrlInEnv ? subSsrUrlInEnv : "noop";
const subSsrFilterWords = subSsrFilterWordsInEnv ? subSsrFilterWordsInEnv : "过期时间,剩余流量,QQ群,官网,网站新域名,http,回墙";
const subSsrFilterWordsInnArr = subSsrFilterWords.split(",");
const configPath = configPathInEnv ? configPathInEnv : path.resolve("./res/haproxy.cfg");
console.log("subscribeSsrUrl", subscribeSsrUrl)
console.log("subSsrFilterWords", subSsrFilterWords)
console.log("subSsrFilterWordsInnArr", subSsrFilterWordsInnArr)
console.log("configPath", configPath)
HAProxyConfig.prototype.addSectionFix = function (type, name) {
    let section = this.addSection(type, name);
    if (section._type === 'listen') {
        this.frontends.push(section);
    }
    return section;
};

let haproxyConfig = new HAProxyConfig(configPath);

(async function () {
    let respOfSubSsrUrlInBase64 = await axios.get(subscribeSsrUrl);
    let subSsrUrlsAsBuffer = Buffer.from(respOfSubSsrUrlInBase64.data, "base64");
    let subSsrUrls = subSsrUrlsAsBuffer.toString("ascii");
    let subSsrUrlsAsArr = subSsrUrls.split("\n");
    //console.log(subSsrUrlsAsArr)
    //console.log(subSsrFilterWordsInnArr)
    let filteredSsrUelAsArr = subSsrUrlsAsArr
        .filter((i) => i)
        .map((i) => ssrUriHelp.ssrDecode(i))
        .filter((i) => {
            for (const ele in subSsrFilterWordsInnArr) {
                // console.log(i.remarks,subSsrFilterWordsInnArr[ele],i.remarks.indexOf(subSsrFilterWordsInnArr[ele]) !== -1)
                if (i.remarks.indexOf(subSsrFilterWordsInnArr[ele]) !== -1) {
                    return false;
                }
            }
            return true;
        });
    // console.log(filteredSsrUelAsArr)

    haproxyConfig.loadConfig(function (err) {
        if (!!err) {
            console.log(err);
            return;
        }
        console.log("loadConfig")
    });

    let globalSec = haproxyConfig.addSection("global");
    globalSec.addConfig("log", "127.0.0.1 local0 info")
    globalSec.addConfig("chroot", "/var/lib/haproxy")
    globalSec.addConfig("pidfile", "/var/run/haproxy.pid")
    globalSec.addConfig("maxconn", "1020")
    globalSec.addConfig("user", "haproxy")
    globalSec.addConfig("group", "haproxy")
    globalSec.addConfig("daemon")
    globalSec.addConfig("stats socket", "/var/lib/haproxy/stats.sock mode 600 level admin")
    globalSec.addConfig("stats timeout", "2m")
    let defaultsSec = haproxyConfig.addSection("defaults");
    defaultsSec.addConfig("mode", "tcp")
    defaultsSec.addConfig("log", "global")
    defaultsSec.addConfig("option dontlognull")
    defaultsSec.addConfig("option redispatch")
    defaultsSec.addConfig("timeout http-request", "10s")
    defaultsSec.addConfig("retries", "3")
    defaultsSec.addConfig("timeout queue", "45s")
    defaultsSec.addConfig("timeout connect", "10s")
    defaultsSec.addConfig("timeout client", "1m")
    defaultsSec.addConfig("timeout server", "1m")
    defaultsSec.addConfig("timeout http-keep-alive", "10s")
    defaultsSec.addConfig("timeout check", "10s")
    defaultsSec.addConfig("maxconn", "1020")

    let listenSec = haproxyConfig.addSectionFix("listen", "stats");
    listenSec.addConfig("mode", "http")
    listenSec.addConfig("bind", "0.0.0.0:8089")
    listenSec.addConfig("stats", "enable")
    listenSec.addConfig("stats uri", "/admin?stats")
    listenSec.addConfig("stats realm", "Haproxy\\ Statistics")
    listenSec.addConfig("stats auth", "admin:admin")
    listenSec.addConfig("stats admin", "if TRUE")

    let backEndName = "ss-out";
    let frontendSec = haproxyConfig.addSection("frontend", "ss-in");
    frontendSec.addConfig("bind", "0.0.0.0:12222");
    frontendSec.addConfig("default_backend", backEndName);

    let backendSec = haproxyConfig.addSection("backend", backEndName);

    filteredSsrUelAsArr.forEach((i, inx) => {
        let serverVal = `server${inx} ${i.server}:${i.port} check maxconn 20480`;
        // let serverVal = `server-${i.remarks.replaceAll(/[^-|^（|^）|^\d|^\[a-zA-Z\]|^\[\u4e00-\u9fa5\]]/g,"")} ${i.server}:${i.port} check maxconn 20480`;
        console.log(serverVal)
        backendSec.addConfig("server", serverVal);
    })

    if (filteredSsrUelAsArr && filteredSsrUelAsArr.length !== 0)
        haproxyConfig.saveConfig(function (err) {
            if (!!err) {
                console.log(err);
                return;
            }
            console.log("saveConfig")
        })
    else
        console.log("pass saveConfig")
})()

