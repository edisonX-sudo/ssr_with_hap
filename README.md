# ssr_with_hap

---

功能:

根据ssr订阅地址内容转化成对应的haproxy配置文件,客户端通过访问haproxy来访问haproxy的后部节点,借助于haproxy的负载功能,即便单一节点失效,也能让使用者总体上保持良好上网体验

环境变量参数:

- SUB_SSR_URL:SSR订阅地址
- SUB_SSR_FILTER_WORDS:根据名称,过滤掉不用的节点,逗号分割(例:过期时间,剩余流量,QQ群,官网,网站新域名,http,回墙)

包含:

主程序index.js和对应Dockerfile文件(build内)

PS:

建议配合docker使用,ssr_with_hap配合docker的haproxy通过共享卷来共享配置文件,通过计划任务启动ssr_with_hap来更新haproxy的配置文件
