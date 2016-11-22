var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var moment = require('moment');
var format = require('format');

var methodOverride = require('method-override');
var _ = require('lodash');

var config = require('./config');

// Create the application.
var app = express();

// Add Middleware necessary for REST API's
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

var api= require('./app/routes/api')(app,express);
app.use('/api',api);


app.get('*', function(req,res){
    res.sendFile(__dirname + '/public/app/views/index.html');
})


mongoose.connect(config.database, function(err){
    if(err){
        console.log(err);
    }else{
        console.log("Connected to db");
    }
});


app.get('*', function(req,res){
    res.sendFile(__dirname + '/public/views/index.html');
})


app.listen(config.port, function(err){
    if(err){
        console.log(err);
    }else{
        console.log("Listening")
    }
})