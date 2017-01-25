
var path = require('path');

module.exports = {

	entry: [
		path.join(__dirname, 'example.js'),
	],

	output: {
		path: path.join(__dirname, 'dist'),
		filename: "bundle.js",
	},

	module: {
		loaders: [
			{ test: /\.shader$/, loader: 'shaderify' },
		]
	}
};
