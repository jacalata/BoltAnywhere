var express = require('express')
var app = express();

var arguments = require('minimist')(process.argv.slice(2));
if ("p" in arguments) { portNum = arguments.p}
else if ("port" in arguments) { portNum = arguments.port}
else {portNum = 5000 }

if ("f" in arguments) {folder = arguments.f}
else if ("folder" in arguments) {folder = arguments.folder }
else {folder = "public" }
served_folder = __dirname + "/" + folder

app.set('port', portNum)
console.log("launching for " + served_folder + " on port " + portNum)
app.use(express.static(served_folder))

app.listen(app.get('port'), function() {
  console.log("Node app for " + served_folder + " is running at localhost:" + app.get('port'))
})
