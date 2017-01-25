
var browserify = require('browserify-middleware');
var shaderify = require('shaderify');
var express = require('express');
var app = express();

app.use('/example.js', browserify('./example.js', { transform: shaderify() }));
app.get('/', function(req, res) { res.sendFile("index.html", { root: __dirname }); });
app.listen(3001);
console.log("listening on http://localhost:3001/");
