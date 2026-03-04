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

  vec4 wave_data = texture2D(u_wave, scaled);
  float gradient_magnitude = wave_data.r;
  vec4 nebula = texture2D(u_nebula, scaled);

  vec3 background = f.rgb;
  float opacity = clamp(nebula.a, 0.0, 1.0);
  vec3 blended_background = background * (1.0 - opacity) + nebula.rgb;
  gl_FragColor = vec4(blended_background + vec3(0.0, 0.0, gradient_magnitude), 1.0);
  //gl_FragColor = dot(f,f) < 1.5 ? w : f;
}