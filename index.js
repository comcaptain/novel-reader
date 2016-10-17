var fs = require('fs');
var glob = require("glob")
var Promise = require("bluebird");
var express = require('express');
var app = express();

const PUBLIC_DIR = "public/";
const FILE_STORAGE_PATH = PUBLIC_DIR + "novels/"

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

app.use(express.static(PUBLIC_DIR));
app.use('/', express.static(PUBLIC_DIR + 'index.html'));
app.use('/novel', express.static(PUBLIC_DIR + 'novel.html'));

//will receive data of format below:
// [{name:xxxx, other properties}, {name: xxxx, other properties}]
app.post("/upload", function(req, res) {
	var files = req.body;
	var fileSavingPromises = files.map(file => new Promise((resolve, reject) => {
		fs.writeFile(FILE_STORAGE_PATH + file.name + ".json", JSON.stringify(file), err => {
			if (err) reject(err);
			else resolve();
		})
	}));
	Promise.all(fileSavingPromises).then(() => res.send("Uploaded!"))
})

app.get("/novelList", (req, res) => {
	glob(FILE_STORAGE_PATH + "*.json", {}, (error, fileNames) => {
		res.send(fileNames.map(n => n.replace(PUBLIC_DIR, "")));
	})
})

app.listen(2000, function () {
  console.log('Novel reader started!');
});