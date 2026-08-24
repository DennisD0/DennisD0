// Deterministic dot field generator. Seeded so re-runs produce an identical field.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function field({ w, h, count, seed, minR, maxR, minO, maxO }) {
  const rnd = mulberry32(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = +(rnd() * w).toFixed(1);
    const y = +(rnd() * h).toFixed(1);
    const r = +(minR + rnd() * (maxR - minR)).toFixed(2);
    const o = +(minO + rnd() * (maxO - minO)).toFixed(3);
    // Slow independent twinkle so no two dots pulse in lockstep.
    const dur = +(4 + rnd() * 7).toFixed(1);
    const delay = +(rnd() * 9).toFixed(1);
    out.push({ x, y, r, o, dur, delay });
  }
  return out;
}

module.exports = { field };
