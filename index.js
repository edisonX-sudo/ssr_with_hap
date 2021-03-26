'use strict';
//https://www.npmjs.com/package/haproxy
//https://www.npmjs.com/package/axios
//https://www.npmjs.com/package/ssr-uri-help?activeTab=readme

let axios = require("axios").default;
const ssrUriHelp = require('ssr-uri-help');
var HAProxy = require('haproxy');

let subSsrUrlInEnv = process.env["SUB_SSR_URL"];
let subSsrFilterWordsInEnv = process.env["SUB_SSR_FILTER_WORDS"];
const subscribeSsrUrl = subSsrUrlInEnv ? subSsrUrlInEnv : "https://adamz.digital/link/UOSzIIg9ckFX4JMT?sub=1";
const subSsrFilterWords = subSsrFilterWordsInEnv ? subSsrFilterWordsInEnv : "过期时间,剩余流量,QQ群,官网,网站新域名,http,回墙";
const subSsrFilterWordsInnArr = subSsrFilterWords.split(",");

(async function () {
    let respOfSubSsrUrlInBase64 = await axios.get(subscribeSsrUrl);
    let subSsrUrlsAsBuffer = Buffer.from(respOfSubSsrUrlInBase64.data, "base64");
    let subSsrUrls = subSsrUrlsAsBuffer.toString("ascii");
    let subSsrUrlsAsArr = subSsrUrls.split("\n");
    // console.log(subSsrUrlsAsArr)
    // console.log(subSsrFilterWordsInnArr)
    subSsrUrlsAsArr
        .filter((i) => i)
        .map((i) => ssrUriHelp.ssrDecode(i))
        .filter((i)=> {
            for (const ele in subSsrFilterWordsInnArr) {
                // console.log(i.remarks,subSsrFilterWordsInnArr[ele],i.remarks.indexOf(subSsrFilterWordsInnArr[ele]) !== -1)
                if(i.remarks.indexOf(subSsrFilterWordsInnArr[ele]) !== -1){
                    return false;
                }
            }
            return true;
        })
        .forEach((i) => {
            console.log(i)
        })
})()

