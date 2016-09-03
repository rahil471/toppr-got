var express = require('express'); 
var app = express();
var bodyParser = require('body-parser'); 
var fs = require('fs');
var db = require('./models/db.js');

if(GLOBAL.SQLpool === undefined){
	GLOBAL.SQLpool = db.createPool(); //create a global sql pool connection
}

app.use(bodyParser.json());  

app.use(require('./controllers'));

app.get('/',function(req,res){
	res.sendFile(__dirname + "/index.html");
});

app.listen('3000', function(){
	console.log('listening to 3000');
});