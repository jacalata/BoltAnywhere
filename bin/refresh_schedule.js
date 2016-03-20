
var Download = require('download');
var fs = require('fs');
var hashFiles = require('hash-files');


var recordFile = "lastDownloadedRecord.json"
var record = {}
fs.readFile(recordFile, 'utf8', function (err, data) {
  if (err) {
	return console.log(err); 
  }
  try {record = JSON.parse(data)} catch (SyntaxError) {console.log(SyntaxError)}
  console.log(record);
});
//todo: don't download if fresh? would be better to check file hashes than download time

 
new Download({mode: '755'})
	.get('https://boltproject.gitlab.io/BoltScraper/schedules.json')
	.dest('data')
	.run(function(err, files) {
		console.log(files.length);
		if (err) {
			return console.log("error downloading schedules.json", err);
		}
		var downloadTime = {"downloadTime": new Date()};
		fs.writeFile(recordFile, JSON.stringify(downloadTime), function(err) {
			if(err) {
				return console.log("Error logging schedule download", err);
			}
			console.log("Schedule download logged");
		}); 

	});