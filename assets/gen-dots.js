// Port of the portfolio hero's WebGL2 DotMatrix shader to static SVG.
//
// The look is a strict uniform grid, not a scatter. Every dot sits on an exact
// grid position, and the "scattered" feel comes purely from each cell drawing a
// pseudo random opacity out of a 10 bucket table. The shader also re-rolls those
// buckets every 5 seconds, which is what makes the field shimmer in place.
//
// Values lifted from the live bundle:
//   u_total_size 20   cell pitch in px
//   u_dot_size    3   dot is a 3px square, not a circle
//   u_opacities  [.3,.3,.3,.5,.5,.5,.8,.8,.8,1]
//   u_colors     all #F4F3F1

const PHI = 1.61803398874989484820459;
const OPACITIES = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1];

// float random(vec2 xy){ return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x); }
function shaderRandom(x, y) {
  const d = Math.hypot(x * PHI - x, y * PHI - y);
  const v = Math.tan(d * 0.5) * x;
  const f = v - Math.floor(v);
  return Number.isFinite(f) ? f : 0;
}

/**
 * Build one frame of the grid.
 * `step` stands in for the shader's floor(u_time / frequency + show_offset + frequency);
 * advancing it re-rolls every cell the way the live shader does every 5s.
 */
function grid({ w, h, total = 20, dot = 3, step = 5 }) {
  // The shader centres the grid inside the viewport rather than starting flush.
  const offX = Math.abs(Math.floor((w % total - dot) * 0.5));
  const offY = Math.abs(Math.floor((h % total - dot) * 0.5));

  const cols = Math.ceil(w / total);
  const rows = Math.ceil(h / total);
  const buckets = OPACITIES.map(() => []);

  for (let cx = 0; cx < cols; cx++) {
    for (let cy = 0; cy < rows; cy++) {
      const showOffset = shaderRandom(cx, cy);
      const k = Math.floor(step + showOffset);
      const rand = shaderRandom(cx * k, cy * k);
      const idx = Math.min(9, Math.max(0, Math.floor(rand * 10)));

      const x = cx * total + offX;
      const y = cy * total + offY;
      if (x > w || y > h) continue;
      buckets[idx].push(`M${x} ${y}h${dot}v${dot}h-${dot}z`);
    }
  }

  // Collapse the 10 buckets into the 4 distinct opacity values they resolve to,
  // so each frame is 4 paths instead of thousands of elements.
  const byOpacity = new Map();
  buckets.forEach((segs, i) => {
    if (!segs.length) return;
    const o = OPACITIES[i];
    byOpacity.set(o, (byOpacity.get(o) || []).concat(segs));
  });

  return [...byOpacity.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([opacity, segs]) => ({ opacity, d: segs.join('') }));
}

module.exports = { grid, OPACITIES };
