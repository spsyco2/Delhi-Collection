const fs = require('fs');
const path = require('path');

// Extract SVG strings from defaultAssets.ts
const tsContent = fs.readFileSync(path.join(__dirname, 'src/assets/defaultAssets.ts'), 'utf8');

const logoMatch = tsContent.match(/export const DEFAULT_BRAND_LOGO_SVG = `([\s\S]*?)`;/);
const bgMatch = tsContent.match(/export const DEFAULT_BACKGROUND_SVG = `([\s\S]*?)`;/);

if (!logoMatch || !bgMatch) {
  console.error("Could not find SVG matches");
  process.exit(1);
}

const logoSvg = logoMatch[1];
const bgSvg = bgMatch[1];

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write SVGs to public directory
fs.writeFileSync(path.join(publicDir, 'brand-logo.svg'), logoSvg);
fs.writeFileSync(path.join(publicDir, 'delhi-background.svg'), bgSvg);
fs.writeFileSync(path.join(publicDir, 'Brand Logo.png'), logoSvg); // SVG content served with png name also works in browser <img> tags
fs.writeFileSync(path.join(publicDir, 'Delhi Collection BackGround.png'), bgSvg);
fs.writeFileSync(path.join(publicDir, 'delhi-collection-background.png'), bgSvg);

console.log('Successfully wrote default assets to public directory');
