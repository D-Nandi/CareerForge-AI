const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const distDir = path.join(rootDir, 'dist');

// CareerNest Brand Concept 2: The Monogram Weave (Interlocking C + N)
// Vector SVG with 100% pure transparent canvas (Zero border, zero bounding box)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- CareerNest Gradient Palette -->
    <!-- Violet to Deep Purple/Indigo for C (The Nurturing Career Nest) -->
    <linearGradient id="cGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC"/>
      <stop offset="30%" stop-color="#A855F7"/>
      <stop offset="70%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#4F46E5"/>
    </linearGradient>

    <!-- Indigo to Electric Cyan for N (Dynamic Upward Trajectory & Growth) -->
    <linearGradient id="nGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4338CA"/>
      <stop offset="30%" stop-color="#6366F1"/>
      <stop offset="70%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#38BDF8"/>
    </linearGradient>

    <!-- Tactile Depth Shadows for Realistic Ribbon Interlock -->
    <filter id="nShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="-2" dy="5" stdDeviation="6" flood-color="#020617" flood-opacity="0.45"/>
    </filter>

    <filter id="cShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="2" dy="6" stdDeviation="7" flood-color="#020617" flood-opacity="0.42"/>
    </filter>
  </defs>

  <!-- 100% PURE TRANSPARENT BACKGROUND - Zero box, zero border, zero background fill -->

  <g id="careernest-monogram" transform="translate(16, 0)">
    <!-- 1. The N Letterform (Base / Middle Layer) -->
    <!-- Left leg tucks behind the bottom arm of C at y=360 -->
    <g id="letterform-n" filter="url(#nShadow)">
      <path d="M 238 360
               L 238 126
               L 384 382
               L 384 124"
            fill="none"
            stroke="url(#nGrad)"
            stroke-width="48"
            stroke-linecap="round"
            stroke-linejoin="round" />
    </g>

    <!-- 2. The Complete, Seamless, Unbroken Geometric C (Overlaps N at bottom) -->
    <path d="M 305 138 A 142 142 0 1 0 305 374"
          fill="none"
          stroke="url(#cGrad)"
          stroke-width="52"
          stroke-linecap="round"
          filter="url(#cShadow)" />

    <!-- 3. Interlocking Weave: The top of N's left leg passes OVER the top arm of C -->
    <path d="M 238 195 L 238 126"
          fill="none"
          stroke="url(#nGrad)"
          stroke-width="48"
          stroke-linecap="round"
          filter="url(#nShadow)" />

    <!-- 4. Career North Star (Sparkle) at top-right peak of N (Guidance & Ambition) -->
    <g id="ascent-sparkle" transform="translate(424, 108)">
      <circle cx="0" cy="0" r="14" fill="#38BDF8" opacity="0.25"/>
      <path d="M 0 -11 L 0 11 M -11 0 L 11 0" stroke="#38BDF8" stroke-width="4" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="3.5" fill="#FFFFFF"/>
    </g>
  </g>
</svg>`;

// Write client/favicon.svg
const clientSvgPath = path.join(clientDir, 'favicon.svg');
fs.writeFileSync(clientSvgPath, svgContent, 'utf-8');
console.log('Saved SVG to:', clientSvgPath);

// Render to client/favicon.png using Chrome headless
const clientPngPath = path.join(clientDir, 'favicon.png');
const chromeCmd = `Start-Process 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' -ArgumentList '--headless','--disable-gpu','--default-background-color=00000000','--window-size=512,512','--screenshot="${clientPngPath}"','file:///${clientSvgPath.replace(/\\/g, '/')}' -Wait`;

try {
  execSync(`powershell -Command "${chromeCmd}"`, { stdio: 'inherit' });
  console.log('Successfully generated transparent client/favicon.png via Chrome headless');
} catch (err) {
  console.error('Failed to run Chrome headless:', err);
}

// Copy to dist if dist exists
if (fs.existsSync(distDir)) {
  const distSvgPath = path.join(distDir, 'favicon.svg');
  const distPngPath = path.join(distDir, 'favicon.png');
  fs.copyFileSync(clientSvgPath, distSvgPath);
  if (fs.existsSync(clientPngPath)) {
    fs.copyFileSync(clientPngPath, distPngPath);
  }
  console.log('Copied favicon assets to dist directory');
}
