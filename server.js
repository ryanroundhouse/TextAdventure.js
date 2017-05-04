// === Server Flags ===
var debugMode = false;

// === Initilize Express ===
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('cloud-env');
var app = express();

// === Import Necessary Functionality ==
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/terminal'));
app.use(session({secret: '1234567890QWERTY', resave: false, saveUninitialized: true}));

// === Start Server ===
var port = config.get('PORT', 8000)
var bind_address = config.get('IP', '127.0.0.1')
var server = app.listen(port, bind_address, function () {
  console.log( "Listening on " + bind_address + ", server_port " + port)
});

// === Create Console ===
var con = require('./console/console.js');

// // === Open Browser ===
var open = require('open');
//open('http://' + bind_address + ':' + port);
//open('http://rg-text-adventure-rg-textadventure.1d35.starter-us-east-1.openshiftapps.com:3000');

// === Respond to AJAX calls ===
app.post('/console', function(req,res){
	debug(req.body.input);
	res.json({response: con.input(req.body.input, req.session.id)});
});

// === Helper Functions ===
function debug(debugText){
	if(debugMode){
		console.log(debugText);
	}
}