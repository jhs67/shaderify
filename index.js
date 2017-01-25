
var fs = require('fs');
var path = require('path');
var through = require('through');

exports = module.exports = shaderify;

function shaderify(arg) {
	// Webpack loader.
	if (this && typeof this.async === 'function') {
		return webpackShaderLoader.call(this, arg);
	}

	// Browserify loader.
	var opts = arg || {};
	if (opts.extensions === undefined) opts.extensions = ['shader'];
	return function shader_transform(file) {
		if (opts.extensions.indexOf(file.split('.').pop()) == -1) return through();

		var buffer = '', vert, frag, throughput;
		return through(write, end);

		function write(c) {
			buffer += c.toString();
		}

		function end() {
			var shader;
			try {
				shader = JSON.parse(buffer);
			}
			catch(e) {
				this.queue(buffer);
				this.queue(null);
				return;
			}
			throughput = this;
			load(shader.vertex, function(err, b) { vert = b; finish(err); });
			load(shader.fragment, function(err, b) { frag = b; finish(err); });
		}

		function load(f, n) {
			if (Array.isArray(f))
				return n(null, f.join('\n'));
			if (typeof f !== 'string')
				return n(new Error("invalid shader: " + f));
			if (f.indexOf('{') !== -1)
				return n(null, f);
			fs.readFile(path.resolve(path.dirname(file), f), 'utf8', n);
		}

		function finish(err) {
			if (err && throughput) {
				throughput.emit('error', err);
				throughput = null;
				return;
			}
			if (throughput === null || vert === undefined || frag === undefined)
				return;

			throughput.queue("var shaderify = require('shaderify');\n");
			throughput.queue("var vert = '" + vert.replace(/'/g, "\\'").replace(/\n/g, "\\n") + "';\n");
			throughput.queue("var frag = '" + frag.replace(/'/g, "\\'").replace(/\n/g, "\\n") + "';\n");
			throughput.queue("module.exports = function(gl) { return shaderify.compile(gl, vert, frag); }\n");
			throughput.queue(null);
		}
	};
}

function escapeString(src) {
	return 	"'" + src.replace(/'/g, "\\'").replace(/\n/g, "\\n") + "'";
}

function normalize(path) {
	if (path[0] === '.' && path[1] === '/')
		return path;
	if (path[0] === '.' && path[1] === '.' && path[1] === '/')
		return path;
	if (path[0] === '/')
		return path;
	return './' + path;
}

function loadShaderProgram(src) {
	if (Array.isArray(src))
		return escapeString(src.join('\n'));
	if (typeof src !== 'string')
		return n(new Error("invalid shaderify program value: " + src));
	if (src.indexOf('{') !== -1)
		return escapeString(src);
	return "require('raw-loader!" + normalize(src) + "')";
}

function webpackShaderLoader(source) {
	this.cacheable();

	var shader = JSON.parse(source);
	var vert = loadShaderProgram(shader.vertex);
	var frag = loadShaderProgram(shader.fragment);

	return "var shaderify = require('shaderify');\n" +
		"var vert = " + vert + ";\n" +
		"var frag = " + frag + ";\n" +
		"module.exports = function(gl) { return shaderify.compile(gl, vert, frag); }\n";
}
