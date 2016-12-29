# shaderify

Browser module and browserify plug-in for compiling WebGL shaders.


## Usage

Server side (webpack):

```js
	module: {
		loaders: [
			{ test: /\.shader$/, loader: "shaderify" },
		]
	}
```

Server side (browserify):
```js
var browserify = require('browserify-middleware');
var shaderify = require('shaderify');
var express = require('express');
var app = express();

app.use('/example.js', browserify('./example.js', { transform: shaderify() }));
//...
```

Client Side:
```js
var gl = ...;
gl.bindBuffer(...);

// Create the shader
var flat = require('./flat.shader')(gl);

// Initialize the shader
flat.use();
flat.color = new Float32Array([1, 0, 1, 1]);
flat.project = new Float32Array([1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1]);
flat.position.enable();
flat.position.pointer(2, gl.FLOAT, false, 8, 0);

// Draw the array
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
```

Check out the example folder for a complete working implementation.

## Server Side API

On the server shaderify is a [browserify](http://browserify.org/) transform plug-in for compiling shader programs into your browserify bundles.

It will also work as a [webpack](https://webpack.github.io/) loader. It works just like the browserify plug-in.
Set up the loader in your webpack.config.js:
```js
	module: {
		loaders: [
			{ test: /\.shader$/, loader: "shaderify" },
		]
	}
```
or specify the loader inline
```js
var flat = require('shaderify!./flat.shader')(gl);
```

### .shader file

Browserify expects each `require` directive to specify a single file, but WebGL shaders are made up of a vertex and a fragment shader program. To specify both components of the shader program you create a JSON file with this format:
```js
{
  vertex: 'myshader.vert'
  fragment: 'myshader.frag'
}
```
Each member can be a string containing the path to a file to load. If the string contains the character '{' it is interpreted directly as a shader program. An array of lines may be specified, in which case they are `.join('\n')`'ed to make the program.

When a .shader file is `require`'d in a browserify or webpack module it is converted into a function taking a WebGL context returning a [ShaderProgram](#shaderprogram).


## Client Side API

### ShaderProgram

A wrapper around a WebGL shader program with accessors for the shader uniforms and attributes. The interface was inspired by [shayda](https://github.com/jaz303/shayda).

__new shaderify.ShaderProgram(program, gl)__

Create a new wrapper from a linked  WebGL program and a context. Accessors for the uniforms and attributes of the shader are automatically created.

__Uniforms__

The ShaderProgram constructor will create setters and getters for each uniform in the program. If the shader program contains a declaration `uniform lowp vec4 color`, then you set the value with `shader.color = new Float32Array([1, 0, 0, 1]);` or with `shader.setColor(1, 0, 0, 1)`.

__Attributes__

Each attribute in the shader program will create an attribute object. A shader program containing `attribute vec4 position` would create these methods:
```js
shader.position.enable();
shader.position.disable();
shader.position.pointer(size, type, normalize, stride, offset);
```

### Compiling

The shaderify server side plug-in will usually take care of this for you, but if you have vertex and fragment shader as strings they can be compiled to a ShaderProgram directly.
```js
var program = shaderify.compile(gl, vert_src, frag_src);
```

## License

  MIT
