// 可以选择三种参数test,dev,prod
profiles = "dev"

test = {}
dev = {}
prod = {}

// 测试配置
test.urlHref = "http://192.168.3.96:20002"
test.imgurlHref = "http://192.168.3.96/pap/"
test.webPort = 20001


// 开发配置
dev.urlHref = "http://192.168.3.93:20002"
dev.imgurlHref = "http://192.168.3.93/pap/"
dev.webPort = 3000


// 线上配置
prod.urlHref = "http://imgpap.pxene.com:20002"
prod.imgurlHref = "http://imgpap.pxene.com/"
prod.webPort = 8080
