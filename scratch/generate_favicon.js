import fs from 'fs';
import path from 'path';

// Construct the high-contrast, modern C+N Monogram Weave SVG
// 100% transparent background - NO square, NO border, NO grey/white box!
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Primary Gradient: Purple -> Indigo -> Vibrant Cyan -->
    <linearGradient id="cnGradC" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>

    <!-- Secondary Gradient: Royal Blue -> Electric Cyan -->
    <linearGradient id="cnGradN" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="60%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>

    <!-- Accent Spark Gradient -->
    <linearGradient id="cnSpark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>

    <!-- Subtle Depth Shadow between weave intersections -->
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0f172a" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Group with subtle drop shadow for depth on both dark and light browser chrome -->
  <g filter="url(#shadow)">
    <!-- 
      THE "C" ARC (Left Ribbon)
      Bold geometric sweep from top-right down around the left to bottom-center
    -->
    <path 
      d="M 270 95
         C 155 95, 75 165, 75 256
         C 75 347, 155 417, 270 417"
      fill="none"
      stroke="url(#cnGradC)"
      stroke-width="58"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!--
      THE "N" STEMS (Right and Diagonal Ribbons)
      Weaves dynamically through the C's aperture
    -->
    <!-- N Left Vertical / Diagonal Anchor -->
    <path
      d="M 270 417
         L 270 240
         L 395 417
         L 395 95"
      fill="none"
      stroke="url(#cnGradN)"
      stroke-width="58"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Overlapping Weave Knot (creates the interlocking weave illusion) -->
    <path
      d="M 220 256 L 310 380"
      fill="none"
      stroke="url(#cnGradN)"
      stroke-width="58"
      stroke-linecap="round"
    />

    <!-- Upward Growth Spark (Career launch accent at the peak of the N) -->
    <circle cx="395" cy="95" r="14" fill="url(#cnSpark)" />
  </g>
</svg>`;

const clientDir = path.resolve('client');
fs.writeFileSync(path.join(clientDir, 'favicon.svg'), svgContent.trim());
console.log('Saved favicon.svg successfully to client/favicon.svg');
