#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D tBackBuffer;
uniform vec2 uCell;
uniform int uFrame;
uniform vec2 uIntersectUv;
uniform int uUpdateStep;

vec3 hash(vec3 v) {
  uvec3 x = floatBitsToUint(v + vec3(0.1, 0.2, 0.3));
  x = (x >> 8 ^ x.yzx) * 0x456789ABu;
  x = (x >> 8 ^ x.yzx) * 0x6789AB45u;
  x = (x >> 8 ^ x.yzx) * 0x89AB4567u;
  return vec3(x) / vec3(-1u);
}

void main() {
  vec2 iuv = (floor(vUv * uCell) + 0.5) / uCell;
  vec2 px = 1.0 / uCell;

  float c;
  if (uFrame == 1) {
    c = step(0.5, hash(vec3(iuv, 0.1)).x);
  } else if(uFrame % uUpdateStep == 0)  {
    float nc;
    for (float ix = -1.0; ix <= 1.0; ix++) {
      for (float iy = -1.0; iy <= 1.0; iy++) {
        if (ix == 0.0 && iy == 0.0) continue;
        nc += texture(tBackBuffer, iuv + vec2(ix, iy) * px).a;
      } 
    }

    if (0.5 < texture(tBackBuffer, vUv).a) {
      // alive
      if (nc == 2.0 || nc == 3.0) c = 1.0;
      else if (nc <= 1.0) c = 0.0;
      else if (4.0 <= nc) c = 0.0;
    } else {
      // dead
      if (nc == 3.0) c = 1.0;
    }
  } else {
    c = texture(tBackBuffer, vUv).a;
  }

  if (uFrame % uUpdateStep == 0) {
    vec2 iiuv = floor(uIntersectUv * uCell) + 0.5;
    float d = step(distance(iiuv, iuv * uCell), 2.0);
    c += d * step(hash(vec3(iuv, float(uFrame))).x, 0.5);
  }

  vec3 b = texture(tBackBuffer, vUv).rgb;
  vec3 col = vec3(c, b.rg);
  col = mix(col, b, 0.5);

  outColor = vec4(col, c);
}