
attribute vec4 position;
uniform mat4 project;

void main(void) {
	gl_Position = project * position;
}
