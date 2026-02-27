precision highp float;

varying vec2 v_texCoord;
uniform sampler2D u_u;
uniform float u_tick;
uniform float u_pxc;

// [x ]' = [0  1][x ]
// [x']  = [k -d][x']
// spurious vibrations
// u_tt = u_xx + u_yy
// -u(t+1)+2u-u(t-1) = lap(u)
// u(t+1) = lap(u)-2u+u(t-1);

void main() {
  float x = v_texCoord.x;
  float y = v_texCoord.y;
  float p = 1.0/u_pxc;

  vec3 u0 = texture2D(u_u, v_texCoord).rgb;

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
  
  float dt = 0.45;
  float k  = 1.2; // Speed boost
  
  // --- 3. INTEGRATION WITH MOMENTUM CONSERVATION ---
  // We apply the Laplacian AND the restoring force to the velocity
  float accel = (lap * k) + restoringForce;
  
  // Velocity damping (0.99) kills high-frequency momentum
  // DC damping (0.999) keeps the overall pond level stable
  float g_next = (g0 + accel * dt) * 0.99;
  
  // Position update
  float b_next = b0 + g_next * dt;

  gl_FragColor = vec4(0.0, g_next + 0.5, b_next + 0.5, 1.0);
}
