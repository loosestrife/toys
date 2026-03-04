#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D u_u;
uniform float u_pxc;
uniform float u_sand;
varying vec2 v_texCoord;

void main() {
  float x = v_texCoord.x;
  float y = v_texCoord.y;
  float p = 1.0/u_pxc;

  vec4 u0 = texture2D(u_u, v_texCoord);

  // Center and Cardinals (4th order)
  float C  = u0.b - 0.5;
  float L1 = texture2D(u_u, vec2(x-p, y)).b - 0.5;
  float L2 = texture2D(u_u, vec2(x-2.0*p, y)).b - 0.5;
  float R1 = texture2D(u_u, vec2(x+p, y)).b - 0.5;
  float R2 = texture2D(u_u, vec2(x+2.0*p, y)).b - 0.5;
  float U1 = texture2D(u_u, vec2(x, y+p)).b - 0.5;
  float U2 = texture2D(u_u, vec2(x, y+2.0*p)).b - 0.5;
  float D1 = texture2D(u_u, vec2(x, y-p)).b - 0.5;
  float D2 = texture2D(u_u, vec2(x, y-2.0*p)).b - 0.5;

  // Diagonals (Stability/Smoothing)
  float TR = texture2D(u_u, vec2(x+p, y+p)).b - 0.5;
  float TL = texture2D(u_u, vec2(x-p, y+p)).b - 0.5;
  float BR = texture2D(u_u, vec2(x+p, y-p)).b - 0.5;
  float BL = texture2D(u_u, vec2(x-p, y-p)).b - 0.5;

// --- 1. PRECISE LAPLACIAN (Sum = 0) ---
  // We ensure the center weight (30+30) perfectly balances the neighbors (16+16-1-1)
  float uxx = (-L2 + 16.0*L1 - 30.0*C + 16.0*R1 - R2) / 12.0;
  float uyy = (-D2 + 16.0*D1 - 30.0*C + 16.0*U1 - U2) / 12.0;
  float lapDiag = (TL + TR + BL + BR - 4.0*C) / 4.0;

  float lap = mix(uxx + uyy, lapDiag, 0.2);

  // --- 2. THE DC LEVEL FIX (Restoring Force) ---
  // This "Spring to Equilibrium" prevents the pond level from drifting.
  // It acts like a very weak gravity pulling the water back to the 0.5 mark.
  float restoringForce = -C * 0.0005; 

  float g0 = u0.g - 0.5;
  float b0 = u0.b - 0.5;
  float wetness = u0.r;
  
  // Calculate Sand Mask
  vec2 distFromCenter = abs(v_texCoord - 0.5) * 2.0;
  float maxDist = max(distFromCenter.x, distFromCenter.y);
  float waterLimit = 1.0 - (2.0 * u_sand);
  float mask = 1.0 - smoothstep(waterLimit, 1.0, maxDist);

  float dt = 0.45;
  float k  = mix(0.4, 1.2, mask); // Speed boost (lower in sand for reflection)
  float damping = mix(0.97, 0.99, mask); // Damping (less absorption in sand allows sloshing)
  
  // --- 3. INTEGRATION WITH MOMENTUM CONSERVATION ---
  // We apply the Laplacian AND the restoring force to the velocity
  float accel = (lap * k) + restoringForce;
  
  // Velocity damping (0.99) kills high-frequency momentum
  float g_next = (g0 + accel * dt) * damping;
  
  // Position update
  float b_next = b0 + g_next * dt;

  // Wetness calculation: decay and add wave height
  wetness *= 0.98; // Dry a bit faster
  wetness += abs(b_next) * 4.0; // Get wet faster
  wetness = clamp(wetness, 0.0, 1.0);

  // --- 4. GRADIENT CALCULATION for display ---
  // Using a 4th-order central difference for a more accurate gradient,
  // which uses the wider support you asked for.
  // f'(x) ≈ (f(x-2h) - 8f(x-h) + 8f(x+h) - f(x+2h)) / 12h
  float grad_x = (L2 - 8.0*L1 + 8.0*R1 - R2) / 12.0;
  float grad_y = (D2 - 8.0*D1 + 8.0*U1 - U2) / 12.0;
  float grad_mag = length(vec2(grad_x, grad_y));

  // --- 5. COMBINED DISPLAY VALUE ---
  // As requested, use red channel for either wetness (sand) or gradient (water)
  float display_value = mix(wetness, grad_mag, mask);

  gl_FragColor = vec4(display_value, g_next + 0.5, b_next + 0.5, 1.0);
}
