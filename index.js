var fs = require('fs');
var Promise = require("bluebird");
var express = require('express');
var app = express();

const FILE_STORAGE_PATH = "novels/"

app.use((req, res, next) => {
	try {
		next();
	}
	catch(e) {
		console.error(e);
  		res.status(500).send(e);
	}
});

var bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '100mb'}));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true,
  limit: '100mb'
})); 

app.use(express.static("public"));
app.use('/', express.static('public/index.html'));

//will receive data of format below:
// [{name:xxxx, other properties}, {name: xxxx, other properties}]
app.post("/upload", function(req, res) {
	var files = req.body;
	var fileSavingPromises = files.map(file => new Promise((resolve, reject) => {
		fs.writeFile(FILE_STORAGE_PATH + ".json", JSON.stringify(file), err => {
			if (err) reject(err);
			else resolve();
		})
	}));
	Promise.all(fileSavingPromises).then(() => res.send("Uploaded!"))
})

app.listen(3000, function () {
  console.log('Novel reader started!');
});