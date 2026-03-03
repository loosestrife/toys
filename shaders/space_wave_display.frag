precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_fb;
uniform sampler2D u_wave;
uniform sampler2D u_gravity;
uniform sampler2D u_nebula;
uniform vec2 u_viewOffset;
uniform float u_viewScale;

void main() {
  vec4 f = texture2D(u_fb,v_texCoord);
  vec2 moved = v_texCoord + u_viewOffset;
  vec2 scaled = moved * u_viewScale;
  vec4 w = texture2D(u_wave,scaled);
  float grav = texture2D(u_gravity, scaled).r;
  vec3 nebulaColor = texture2D(u_nebula, scaled).rgb;
  gl_FragColor = vec4(f.rgb + vec3(0.0*grav*grav, 0.0, w.b - 0.5) + nebulaColor, 1.0);
  //gl_FragColor = dot(f,f) < 1.5 ? w : f;
}