// shaders/gravity.frag
precision mediump float;
varying vec2 v_texCoord;
uniform vec2 u_center;
uniform float u_radius;
uniform float u_strength;

void main() {
    // Calculate distance vector accounting for wrapping (torus topology)
    vec2 diff = abs(v_texCoord - u_center);
    diff = min(diff, 1.0 - diff);
    
    float r = length(diff);
    float pot = 0.0;
    
    // Potential calculation:
    // Inside: Harmonic oscillator (parabola) to avoid singularity and match boundary
    // Outside: 1/r
    if(r < u_radius){
        // Matches 1/r and its derivative at r = u_radius
        pot = u_strength * (3.0 * u_radius * u_radius - r * r) / (2.0 * u_radius * u_radius * u_radius);
    } else {
        pot = u_strength / r;
    }
    
    // Output potential to the red channel
    gl_FragColor = vec4(pot*.1, 0.0, 0.0, 1.0);
}
