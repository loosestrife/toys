precision mediump float;
varying vec2 v_texCoord;

uniform vec3 u_color1;
uniform vec3 u_color2;
uniform int u_hollow;

// from https://www.shadertoy.com/view/4dS3Wd
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = v_texCoord * 2.0 - 1.0; // from -1 to 1
    float dist = length(uv);
    
    if (dist > 1.0) discard;
    
    mat2 m = mat2(1.6,  1.2, -1.2,  1.6);
    vec2 p = uv * 4.0;
    float f = 0.5*noise(p) + 0.25*noise(p*m) + 0.125*noise(p*m*m);
    
    vec3 final_color;
    if (u_hollow == 1) {
        // Planetary Nebula (hollow ring)
        float density = smoothstep(1.0, 0.2, dist) * smoothstep(0.0, 0.5, dist);
        final_color = mix(u_color1, u_color2, f) * density;
    } else {
        // Pulsar Wind Nebula (Crab-like)
        // Inner green glow, brightest at center, semi-transparent
        float inner_density = (1.0 - smoothstep(0.0, 0.7, dist)) * 0.7;
        vec3 inner_color = vec3(0.4, 1.0, 0.5) * inner_density * (0.5 + f * 0.5);
        // Outer, less-bright shell
        float outer_density = smoothstep(0.4, 0.7, dist) * smoothstep(1.0, 0.9, dist);
        vec3 outer_shell_color = mix(u_color1, u_color2, f) * 0.4 * outer_density;
        final_color = inner_color + outer_shell_color;
    }
    
    gl_FragColor = vec4(final_color, 1.0);
}