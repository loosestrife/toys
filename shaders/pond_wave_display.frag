precision mediump float;

varying vec2 v_texCoord;
uniform vec4 u_background;
uniform sampler2D u_fb;
uniform sampler2D u_wave;

void main() {
  vec4 f = texture2D(u_fb,v_texCoord);
  vec4 w = texture2D(u_wave,v_texCoord);
  float display_val = w.r; // grad_mag on water, wetness on sand
  float wave_height = w.b - 0.5;

#ifdef LOW_PRECISION
  if(display_val < 0.015) display_val = 0.0;
#endif

  bool is_water_pixel = distance(f.rgb, u_background.rgb) < 0.01;

  if(is_water_pixel) {
    gl_FragColor = vec4(
      f.r,
      f.g,
      f.b-pow(atan(display_val)*2.0/3.141592653589793,1.0/3.5),
      1.0
    );
  } else { // Is a sand pixel
    // Wet sand effect
    vec3 wet_sand_color = f.rgb * (1.0 - display_val * 0.5);

    // Sloshing/overrun effect: draw water color if wave height is positive
    float slosh_factor = smoothstep(0.0, 0.02, wave_height);
    vec3 final_color = mix(wet_sand_color, u_background.rgb, slosh_factor);
    gl_FragColor = vec4(final_color, 1.0);
  }
}
