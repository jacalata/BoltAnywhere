
var lastDownloadedRecord = "download.json"
var downloadRequired = false; // err towards less bandwidth usage
fs = require('fs');
fs.readFile(lastDownloadedRecord, function(err, data){
	if (err) {
		console.log(err);  //don't download
	}
		console.log(data);
		var downloadDetails = JSON.parse(data);
		console.log(downloadDetails.key)
});

var Download = require('download');
 
new Download({mode: '755'})
	.get('https://boltproject.gitlab.io/BoltScraper/schedules.json')
	.dest('data')
	.run();

var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/data'));
app.use(express.static(__dirname + '/web'));

app.get('/', function(request, response) {
	response.sendFile('web/index.html');
});

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});