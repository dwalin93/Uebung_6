"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

/* database connection */
mongoose.connect('mongodb://localhost:27017' + '/ex06DB');
var database = mongoose.connection;

var app = express();
app.use(bodyParser.urlencoded({extended: true})); // Enable processing of post content

database.on('error', console.error.bind(console, 'connection error:'));
database.once('open', function (callback) {
    console.log('connection to database established on port 27017');
});


/* database schema */
var featureSchema = mongoose.Schema({
    name: String,
    date: Date,
    data: {}
});

    /* http routing */
// code which is executed on every request
    app.use(function (req, res, next) {
        console.log(req.method + ' ' + req.url + ' was requested by ' + req.connection.remoteAddress);

        res.setHeader('Access-Control-Allow-Origin', "http://"+req.headers.host+':8000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); //Allow cors
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        next();
    });

app.use("/", express.static(__dirname + "/WebApp"));

app.get('/', function (req, res) {
  console.log("At /");
  console.log("__dirname :" + __dirname);
    res.sendFile(__dirname + '/WebApp/index.html');
});

// returns json of all stored features
    app.get('/getFeatures', function (req, res) {
        Feature.find(function (error, features) {
            if (error) return console.error(error);
            res.send(features);
        });
    });

// takes a json document via POST, which will be added to the database
// name is passed via URL
// url format: /addFeature?name=
    app.post('/addFeature*', function (req, res) {
        console.log(JSON.stringify(req.body));

        var feature = new Feature({
            name: req.url.substring(17, req.url.length), // extract name from url
            dateInserted: new Date(),
            data: req.body
        });
        feature.save(function (error) {
            var message = error ? 'failed to save feature: ' + error
                : 'feature saved: ' + feature.name;
            console.log(message + ' from ' + req.connection.remoteAddress);
            res.send(message);
        });
    });

// launch server
    app.listen(3000, function () {
        console.log('http server now running on port ' + 3000);
    });
