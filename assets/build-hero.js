const fs = require('fs');
const { grid } = require('./gen-dots.js');

const W = 1000, H = 320;

const THEMES = {
  light: {
    panel: '#FFFFFF', name: '#0A0A0B', role: '#3F3F46', meta: '#71717A',
    tick: '#8E8E96', slash: '#C4C4CC', rule: '#E4E4E7',
    dot: '#0A0A0B', dotLayer: 0.34,
  },
  dark: {
    panel: '#050505', name: '#F4F3F1', role: '#D4D4D8', meta: '#98979D',
    tick: '#7A7A82', slash: '#4A4A52', rule: '#26262A',
    dot: '#F4F3F1', dotLayer: 0.5,
  },
};

const ROLES = `MAVENSTUDIO FOUNDER <tspan class="slash">/</tspan> AUTOBULLETIN <tspan class="slash">/</tspan> 413 YOUTH CLUB <tspan class="slash">/</tspan> EN HAKKORE CAFE <tspan class="slash">/</tspan> SCOUT PRODUCT DESIGNER <tspan class="slash">/</tspan> NASA L'SPACE PROJECT MANAGER <tspan class="slash">/</tspan> RESEARCH FOUNDATION OF CUNY <tspan class="slash">/</tspan>`;

// Three rolls of the grid. The shader re-rolls every cell every 5s, so cycling
// three frames on a 15s loop reproduces the shimmer without animating each cell.
const FRAMES = [5, 6, 7];
const BANDS = 16;

function frameGroup(step, i) {
  const rings = grid({ w: W, h: H, total: 20, dot: 3, step, bands: BANDS })
    .map(r => {
      const paths = r.layers
        .map(l => `          <path d="${l.d}" opacity="${l.opacity}" />`)
        .join('\n');
      // Reveal delay grows with distance from the centre, so the grid switches
      // on in rings the way the shader's step(timing_offset, u_time) does.
      return `        <g class="r" style="animation-delay:${(r.ring * 0.07).toFixed(2)}s">\n${paths}\n        </g>`;
    })
    .join('\n');
  return `      <g class="f f${i}">\n${rings}\n      </g>`;
}

function build(themeName) {
  const t = THEMES[themeName];
  const frames = FRAMES.map(frameGroup).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Dennis Do, Product Manager and Builder, Queens NYC. I direct AI agents to build and ship real product.">
  <title>Dennis Do, Product Manager and Builder</title>
  <style>
    .panel { fill: ${t.panel}; }
    .dots  { fill: ${t.dot}; }
    .name  { fill: ${t.name}; font: 600 62px "Helvetica Neue", Helvetica, Arial, sans-serif; letter-spacing: -1.5px; }
    .role  { fill: ${t.role}; font: 400 21px "Helvetica Neue", Helvetica, Arial, sans-serif; letter-spacing: 0.2px; }
    .meta  { fill: ${t.meta}; font: 400 13px "Helvetica Neue", Helvetica, Arial, sans-serif; letter-spacing: 2.4px; }
    .tick  { fill: ${t.tick}; font: 400 14px "Helvetica Neue", Helvetica, Arial, sans-serif; letter-spacing: 1.6px; }
    .slash { fill: ${t.slash}; }
    .rule  { stroke: ${t.rule}; stroke-width: 1; }
    .dot   { fill: ${t.name}; }

    .rise { opacity: 0; animation: rise .9s cubic-bezier(.22,.61,.36,1) forwards; }
    .d1 { animation-delay: .15s; }
    .d2 { animation-delay: .35s; }
    .d3 { animation-delay: .55s; }
    .d4 { animation-delay: .75s; }
    @keyframes rise {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .draw { stroke-dasharray: 920; stroke-dashoffset: 920;
            animation: draw 1.5s cubic-bezier(.22,.61,.36,1) .8s forwards; }
    @keyframes draw { to { stroke-dashoffset: 0; } }

    .pulse { animation: pulse 2.6s ease-in-out 1.6s infinite; }
    @keyframes pulse { 0%, 100% { opacity: .25; } 50% { opacity: 1; } }

    .track { animation: scroll 38s linear infinite; }
    @keyframes scroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-1700px); }
    }

    /* Rings switch on outward from the centre, with a brief overshoot on arrival
       like the shader's clamp(..., 1.0, 1.25) flash. */
    .r { opacity: 0; animation: reveal .75s ease-out forwards; }
    @keyframes reveal {
      0%   { opacity: 0; }
      55%  { opacity: 1; }
      100% { opacity: 0.82; }
    }

    /* Hard cuts rather than cross fades, matching the shader's floor() quantised re-roll. */
    .f  { opacity: 0; animation: flip 15s step-end infinite; }
    .f0 { animation-delay:  0s; }
    .f1 { animation-delay: -10s; }
    .f2 { animation-delay: -5s; }
    @keyframes flip {
      0%     { opacity: 1; }
      33.33% { opacity: 0; }
      100%   { opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .rise, .draw, .pulse, .track, .f, .r { animation: none; }
      .rise { opacity: 1; }
      .draw { stroke-dashoffset: 0; }
      .pulse { opacity: .7; }
      .f0 { opacity: 1; }
      .r  { opacity: 0.82; }
    }
  </style>

  <defs>
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0"    stop-color="#fff" stop-opacity="0" />
      <stop offset="0.05" stop-color="#fff" stop-opacity="1" />
      <stop offset="0.95" stop-color="#fff" stop-opacity="1" />
      <stop offset="1"    stop-color="#fff" stop-opacity="0" />
    </linearGradient>
    <mask id="edges">
      <rect x="0" y="252" width="${W}" height="68" fill="url(#fade)" />
    </mask>

    <filter id="soften" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="58" />
    </filter>
    <!-- Fades the grid out before the rule and marquee band at the bottom. -->
    <linearGradient id="vfade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0"    stop-color="#FFF" />
      <stop offset="0.62" stop-color="#FFF" />
      <stop offset="0.78" stop-color="#000" />
      <stop offset="1"    stop-color="#000" />
    </linearGradient>
    <!-- Clears the grid out from behind the copy block on the left. -->
    <mask id="keepClear">
      <rect width="${W}" height="${H}" fill="url(#vfade)" />
      <ellipse cx="300" cy="140" rx="300" ry="105" fill="#000" filter="url(#soften)" />
    </mask>

    <clipPath id="panelClip">
      <rect width="${W}" height="${H}" rx="16" />
    </clipPath>
  </defs>

  <g clip-path="url(#panelClip)">
    <rect class="panel" width="${W}" height="${H}" />

    <g class="dots" mask="url(#keepClear)" opacity="${t.dotLayer}">
${frames}
    </g>

    <text class="meta rise d1" x="48" y="58">PRODUCT MANAGER AND BUILDER</text>
    <text class="name rise d2" x="48" y="132">Dennis Do</text>
    <text class="role rise d3" x="48" y="176">I direct AI agents to build and ship real product.</text>

    <circle class="dot pulse" cx="53" cy="204" r="3.5" />
    <text class="meta rise d4" x="68" y="209">QUEENS, NYC</text>

    <line class="rule draw" x1="48" y1="252" x2="952" y2="252" />

    <g mask="url(#edges)">
      <g class="track">
        <text class="tick" x="48" y="292" textLength="1700" lengthAdjust="spacing">${ROLES}</text>
        <text class="tick" x="1748" y="292" textLength="1700" lengthAdjust="spacing">${ROLES}</text>
      </g>
    </g>
  </g>
</svg>
`;
}

const dir = process.argv[2] || '.';
for (const name of ['light', 'dark']) {
  const p = `${dir}/hero-${name}.svg`;
  fs.writeFileSync(p, build(name), 'utf8');
  console.log('wrote ' + p);
}
