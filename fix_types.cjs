const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const oldSettings = `export interface BrandSettings {
  brandName: string;
  logoUrl: string;
  backgroundImageUrl: string;
  primaryColor: string;
  accentColor: string;
  whatsappNumber: string;
  instagramUrl: string;
}`;

const newSettings = `export interface BrandSettings {
  brandName: string;
  logoUrl: string;
  backgroundImageUrl: string;
  primaryColor: string;
  accentColor: string;
  whatsappNumber: string;
  instagramUrl: string;
  // Advanced background settings
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  blur?: number;
  brightness?: number;
}`;

code = code.replace(oldSettings, newSettings);
fs.writeFileSync('src/types.ts', code);
