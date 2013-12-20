
var browserify = require('browserify-middleware');
var shaderify = require('shaderify');
var express = require('express');
var app = express();

app.use('/example.js', browserify('./example.js', { transform: shaderify() }));
app.get('/', function(req, res) { res.sendfile("index.html"); });
app.listen(3001);
