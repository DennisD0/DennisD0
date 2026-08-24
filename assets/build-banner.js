const fs = require('fs');
const { field } = require('./gen-dots.js');

const W = 1584, H = 396;

// Bolder than the README hero on purpose. LinkedIn recompresses the upload and
// crushes anything faint, and the banner renders well under 1584px wide in feed.
const dots = field({ w: W, h: H, count: 400, seed: 20260824, minR: 1.0, maxR: 2.5, minO: 0.16, maxO: 0.60 });

const circles = dots
  .map(d => `      <circle cx="${d.x}" cy="${d.y}" r="${d.r}" opacity="${d.o}" />`)
  .join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Dennis Do, Product Manager and Builder. I direct AI agents to build and ship real product.">
  <title>Dennis Do, Product Manager and Builder</title>
  <style>
    .panel { fill: #050505; }
    .dots  { fill: #F4F3F1; }
    .name  { fill: #F4F3F1; font: 600 84px "Helvetica Neue", Helvetica, Arial, sans-serif; letter-spacing: -2px; }
    .role  { fill: #D4D4D8; font: 400 26px "Helvetica Neue", Helvetica, Arial, sans-serif; letter-spacing: 0.2px; }
    .meta  { fill: #98979D; font: 400 15px "Helvetica Neue", Helvetica, Arial, sans-serif; letter-spacing: 3px; }
  </style>

  <defs>
    <filter id="soften" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="64" />
    </filter>

    <!-- White keeps dots, the blurred black ellipse erases them, and the blur makes
         that erasure fall off gradually instead of cutting a visible hole. -->
    <mask id="keepClear">
      <rect width="${W}" height="${H}" fill="#FFF" />
      <ellipse cx="${W / 2}" cy="200" rx="300" ry="96" fill="#000" filter="url(#soften)" />
    </mask>
  </defs>

  <rect class="panel" width="${W}" height="${H}" />

  <g class="dots" mask="url(#keepClear)">
${circles}
  </g>

  <g text-anchor="middle">
    <text class="meta" x="${W / 2}" y="132">PRODUCT MANAGER AND BUILDER</text>
    <text class="name" x="${W / 2}" y="228">Dennis Do</text>
    <text class="role" x="${W / 2}" y="276">I direct AI agents to build and ship real product.</text>
  </g>
</svg>
`;

const out = process.argv[2];
fs.writeFileSync(out, svg, 'utf8');
console.log(`wrote ${out} with ${dots.length} dots`);
