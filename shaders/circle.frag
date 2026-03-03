#extension GL_OES_standard_derivatives : enable
precision mediump float;

varying vec2 v_texCoord;
uniform vec4 u_color;

void main() {
  vec2 uv = v_texCoord * 2.0 - 1.0;
  float dist = length(uv);
  float delta = fwidth(dist);
  float alpha = smoothstep(1.0, 1.0 - 1.5*delta, dist);
  gl_FragColor = vec4(u_color.rgb, u_color.a * alpha);
}