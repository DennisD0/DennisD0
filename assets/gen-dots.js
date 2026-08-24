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
function grid({ w, h, total = 20, dot = 3, step = 5, bands = 0 }) {
  // The shader centres the grid inside the viewport rather than starting flush.
  const offX = Math.abs(Math.floor((w % total - dot) * 0.5));
  const offY = Math.abs(Math.floor((h % total - dot) * 0.5));

  const cols = Math.ceil(w / total);
  const rows = Math.ceil(h / total);

  // Distance from the centre cell decides which reveal ring a cell belongs to,
  // mirroring the shader's dist_from_center timing offset.
  const midX = cols / 2, midY = rows / 2;
  const maxDist = Math.hypot(midX, midY);
  const ringOf = (cx, cy) =>
    bands ? Math.min(bands - 1, Math.floor(Math.hypot(cx - midX, cy - midY) / maxDist * bands)) : 0;

  // ring -> opacity -> path segments
  const rings = new Map();

  for (let cx = 0; cx < cols; cx++) {
    for (let cy = 0; cy < rows; cy++) {
      const showOffset = shaderRandom(cx, cy);
      const k = Math.floor(step + showOffset);
      const rand = shaderRandom(cx * k, cy * k);
      const idx = Math.min(9, Math.max(0, Math.floor(rand * 10)));

      const x = cx * total + offX;
      const y = cy * total + offY;
      if (x > w || y > h) continue;

      const ring = ringOf(cx, cy);
      if (!rings.has(ring)) rings.set(ring, new Map());
      const byOpacity = rings.get(ring);
      const o = OPACITIES[idx];
      if (!byOpacity.has(o)) byOpacity.set(o, []);
      byOpacity.get(o).push(`M${x} ${y}h${dot}v${dot}h-${dot}z`);
    }
  }

  // Collapse to a handful of paths rather than thousands of elements.
  const toLayers = m => [...m.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([opacity, segs]) => ({ opacity, d: segs.join('') }));

  if (!bands) return toLayers(rings.get(0) || new Map());

  return [...rings.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([ring, m]) => ({ ring, layers: toLayers(m) }));
}

module.exports = { grid, OPACITIES };
