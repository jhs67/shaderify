
window.onload = init;

function init() {
	// Try to create a WebGL context
	var canvas = document.getElementById('scene');
	var gl = canvas.getContext('webgl') || canvas.getContext("experimental-webgl");
	if (!gl) return alert("no webgl support");

	// Initialize the rendering
	gl.clearColor(0.40, 0.40, 0.40, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.disable(gl.DEPTH_TEST);
	gl.disable(gl.BLEND);

	// Some verticies to draw.
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	var verts = new Float32Array([-0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5]);
	gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

	// Create the shader
	var flat = require('./flat.shader')(gl);

	// Initialize the shader
	flat.use();
	flat.color = new Float32Array([1, 0, 1, 1]);
	flat.project = new Float32Array([1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1]);
	flat.position.enable();
	flat.position.pointer(2, gl.FLOAT, false, 8, 0);

	// Draw the arrays
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	// Clean up
	flat.position.disable();
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
