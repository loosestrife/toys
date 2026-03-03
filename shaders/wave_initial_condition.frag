precision mediump float;

varying vec2 v_texCoord;
// u_color is no longer used, as this shader now calculates all channels.
uniform float u_amp;

void main(){
  float x = v_texCoord.x*2.0-1.0;
  float y = v_texCoord.y*2.0-1.0;
  float r2 = x*x + y*y;

  // This is the ring-shaped displacement profile.
  // The factor of 5.436 (2*e) is to normalize the peak of r2*exp(-2*r2) to 1.0.
  float displacement = u_amp * 5.436 * r2 * exp(-2.0 * r2);

  // Only draw where the displacement is significant to avoid overwriting the whole texture.
  if (abs(displacement) < 0.001) {
    discard;
  }

  // This is proportional to the negative radial derivative of the displacement.
  // For a wave f(r-ct), the initial velocity u_t is proportional to -u_r.
  // (r²exp(-2r²))' = (2r-4r³)exp(-2r²)
  float r = sqrt(r2);
  float vel_scale = 1.5; // This is a tuning parameter for the wave speed.
  float velocity = vel_scale * u_amp * 5.436 * 2.0 * r * (1.0 - 2.0*r2) * exp(-2.0*r2);

  // The wave simulation uses values centered at 0.5.
  // b channel is displacement, g channel is velocity.
  gl_FragColor = vec4(0.5, velocity + 0.5, displacement + 0.5, 1.0);
}
