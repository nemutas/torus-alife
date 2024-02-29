float qc2(vec2 c) { float d = distance(fuv, c); return smoothstep(0.5 - hwi - sm, 0.5 - hwi + sm, d) * smoothstep(0.5 + hwi + sm, 0.5 + hwi - sm, d); }

float starCircle() {
  float col;
  float h = hash(iuv).y;
  if (h < 0.4) col = qc2(vec2(0)) + qc2(vec2(1, 1));
  else if (h < 0.8) col = qc2(vec2(0, 1)) + qc2(vec2(1, 0));
  else {
    col = smoothstep(0.5 - hwi - sm, 0.5 - hwi + sm, distance(fuv, vec2(0)));
    col *= smoothstep(0.5 - hwi - sm, 0.5 - hwi + sm, distance(fuv, vec2(1, 0)));
    col *= smoothstep(0.5 - hwi - sm, 0.5 - hwi + sm, distance(fuv, vec2(0, 1)));
    col *= smoothstep(0.5 - hwi - sm, 0.5 - hwi + sm, distance(fuv, vec2(1, 1)));
  }
  return col;
}