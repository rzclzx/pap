
var express = require("express");
var app = express();
require("./dist/client/resource/request.js");
var port = eval(profiles + ".webPort");
app.listen(port);
app.use(express.static(__dirname));

