uniform vec3 uColor;
uniform float uAlpha;

void main() {
  gl_FragColor = vec4(vec3(uColor), uAlpha);
}