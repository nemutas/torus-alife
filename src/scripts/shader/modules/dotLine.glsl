float cir(vec2 c) { return smoothstep(dot + sm, dot - sm, distance(fuv, c)); }
float hl() { return 1.0 - smoothstep(wi - sm, wi + sm, abs(suv.y)); }
float vl() { return 1.0 - smoothstep(wi - sm, wi + sm, abs(suv.x)); }
float dlpx() { return hl() * step(0.75, fuv.x) + cir(vec2(0.75, 0.50)); }
float dlnx() { return hl() * step(fuv.x, 0.25) + cir(vec2(0.25, 0.50)); }
float dlpy() { return vl() * step(0.75, fuv.y) + cir(vec2(0.50, 0.75)); }
float dlny() { return vl() * step(fuv.y, 0.25) + cir(vec2(0.50, 0.25)); }
float qc(vec2 c) { float d = distance(fuv, c); return smoothstep(0.5 - hwi - sm, 0.5 - hwi + sm, d) * smoothstep(0.5 + hwi + sm, 0.5 + hwi - sm, d); }

float dotLine() {
  float threshold = 0.35;
  float px = step(threshold, hash(iuv + vec2(0.5, 0.0)).x);
  float nx = step(threshold, hash(iuv - vec2(0.5, 0.0)).x);
  float py = step(threshold, hash(iuv + vec2(0.0, 0.5)).x);
  float ny = step(threshold, hash(iuv - vec2(0.0, 0.5)).x);
  float sum = px + nx + py + ny;

  float col;
  
  if (sum < 1.0) {
    // 0
    col = cir(vec2(0.5));
  } else if (3.0 < sum) {
    // 4
    col = hl() + vl();
  } else if (2.0 < sum) {
    // 3
    vec2 hs = hash(iuv);
    if (px < 1.0) {
      if      (hs.x < 0.33) col = vl() + dlnx();
      else if (hs.x < 0.66) col = qc(vec2(0, 1)) + dlny();
      else                  col = qc(vec2(0, 0)) + dlpy();
    } else if (nx < 1.0) {
      if      (hs.x < 0.33) col = vl() + dlpx();
      else if (hs.x < 0.66) col = qc(vec2(1, 1)) + dlny();
      else                  col = qc(vec2(1, 0)) + dlpy();
    } else if (py < 1.0) {
      if      (hs.x < 0.33) col = hl() + dlny();
      else if (hs.x < 0.66) col = qc(vec2(0, 0)) + dlpx();
      else                  col = qc(vec2(1, 0)) + dlnx();
    } else if (ny < 1.0) {
      if      (hs.x < 0.33) col = hl() + dlpy();
      else if (hs.x < 0.66) col = qc(vec2(0, 1)) + dlpx();
      else                  col = qc(vec2(1, 1)) + dlnx();
    }
  } else if (1.0 < sum) {
    // 2
    if      (0.0 < px && 0.0 < nx) col = hl();
    else if (0.0 < py && 0.0 < ny) col = vl();
    else if (0.0 < nx && 0.0 < ny) col = qc(vec2(0, 0));
    else if (0.0 < nx && 0.0 < py) col = qc(vec2(0, 1));
    else if (0.0 < px && 0.0 < ny) col = qc(vec2(1, 0));
    else if (0.0 < px && 0.0 < py) col = qc(vec2(1, 1));
  } else {
    // 1
    if      (0.0 < px) col = dlpx() + cir(vec2(0.75, 0.50));
    else if (0.0 < nx) col = dlnx() + cir(vec2(0.25, 0.50));
    else if (0.0 < py) col = dlpy() + cir(vec2(0.50, 0.75));
    else if (0.0 < ny) col = dlny() + cir(vec2(0.50, 0.25));
  }

  return sat(col);
}