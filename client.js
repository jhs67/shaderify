
// Compile a vertex or fragment shader
function createShader(src, type, gl) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	var info = gl.getShaderInfoLog(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		throw new Error("Shader compiler error\n" + info);

	return { status: info || "", shader: shader };
}

// Compile and link the vertex and fragment shader
function createShaderProgram(vsrc, fsrc, gl) {
	var v = createShader(vsrc, gl.VERTEX_SHADER, gl);
	var f = createShader(fsrc, gl.FRAGMENT_SHADER, gl);

	var p = gl.createProgram();
	gl.attachShader(p, v.shader);
	gl.attachShader(p, f.shader);
	gl.linkProgram(p);

	var info = gl.getProgramInfoLog(p);
	if (!gl.getProgramParameter(p, gl.LINK_STATUS))
		throw new Error("Shader linker error\n" + info);

	return { status: v.status + f.status + info, program: p };
}

// Class to mediate access to shader attributes
function ShaderAttribute(gl, l) {
	this.gl = gl;
	this.location = l;
}

ShaderAttribute.prototype.enable = function() {
	this.gl.enableVertexAttribArray(this.location);
};

ShaderAttribute.prototype.disable = function() {
	this.gl.disableVertexAttribArray(this.location);
};

ShaderAttribute.prototype.pointer = function(size, type, normalize, stride, offset) {
	this.gl.vertexAttribPointer(this.location, size, type, normalize ? this.gl.TRUE : this.gl.FALSE, stride, offset);
};

// Support for setters of shader uniforms.
var UniformTypes = {
	0x1404 /* GL_INT */				: { matrix: false, setter: 'uniform1i', set: 'uniform1i' },
	0x1406 /* GL_FLOAT */			: { matrix: false, setter: 'uniform1f', set: 'uniform1f' },
	0x8B50 /* GL_FLOAT_VEC2 */		: { matrix: false, setter: 'uniform2fv', set: 'uniform2f' },
	0x8B51 /* GL_FLOAT_VEC3 */		: { matrix: false, setter: 'uniform3fv', set: 'uniform3f' },
	0x8B52 /* GL_FLOAT_VEC4 */		: { matrix: false, setter: 'uniform4fv', set: 'uniform4f' },
	0x8B53 /* GL_INT_VEC2 */		: { matrix: false, setter: 'uniform2iv', set: 'uniform2i' },
	0x8B54 /* GL_INT_VEC3 */		: { matrix: false, setter: 'uniform3iv', set: 'uniform3i' },
	0x8B55 /* GL_INT_VEC4 */		: { matrix: false, setter: 'uniform4iv', set: 'uniform4i' },
	0x8B5A /* GL_FLOAT_MAT2 */		: { matrix: true, setter: 'uniformMatrix2fv', set: 'uniformMatrix2f' },
	0x8B5B /* GL_FLOAT_MAT3 */		: { matrix: true, setter: 'uniformMatrix3fv', set: 'uniformMatrix3f' },
	0x8B5C /* GL_FLOAT_MAT4 */		: { matrix: true, setter: 'uniformMatrix4fv', set: 'uniformMatrix4f' },
	0x8B5E /* GL_SAMPLER_2D */		: { matrix: false, setter: 'uniform1i', set: 'uniform1i' },
	0x8B60 /* GL_SAMPLER_CUBE */	: { matrix: false, setter: 'uniform1i', set: 'uniform1i' },
};

function uniformGetter(l) {
	return function() { return this.gl.getUniform(this.program, l); };
}

function uniformSetter(s, l) {
	return function(v) {
		this.gl[s](l, v);
	};
}

function uniformMatrixSetter(s, l) {
	return function(v) {
		this.gl[s](l, false, v);
	};
}

function uniformSet(s, l) {
	return function() {
		this.gl[s].apply(this.gl, arguments);
	};
}

// Class to mediate access to a shader program, it's uniforms, and it's attributes
exports.ShaderProgram = ShaderProgram;
function ShaderProgram(p, gl) {
	this.program = p;
	this.gl = gl;

	// Set up getters, setters, and 'set' functions for each uniform
	var c = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
	for (var i = 0; i < c; ++i) {
		var u = gl.getActiveUniform(p, i);
		var l = gl.getUniformLocation(p, u.name);
		var t = UniformTypes[u.type];
		if (!t) throw new Error("Unsupported uniform type: 0x" + u.type.toString(16) + " for uniform " + u.name);
		Object.defineProperty(this, u.name, {
			get: uniformGetter(l),
			set: t.matrix ? uniformMatrixSetter(t.setter, l) : uniformSetter(t.setter, l)
		});
		this['set' + u.name[0].toUpperCase() + u.name.substring(1)] = uniformSet(t.set);
	}

	// Setup attribute accessors
	c = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
	for (i = 0; i < c; ++i) {
		var a = gl.getActiveAttrib(p, i);
		var b = gl.getAttribLocation(p, a.name);
		this[a.name] = new ShaderAttribute(this.gl, b);
	}
}

ShaderProgram.prototype.use = function() {
	return this.gl.useProgram(this.program);
};

// Compile a vertex and fragment shader into a ShaderProgram
exports.compile = compile;
function compile(gl, vsrc, fsrc) {
	var p = createShaderProgram(vsrc, fsrc, gl);
	if (p.status) console.log(p.status);
	return new ShaderProgram(p.program, gl);
}
