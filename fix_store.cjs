const fs = require('fs');
let code = fs.readFileSync('src/data/campaignStore.ts', 'utf8');

const brandSettingsMethods = `
  public getBrandSettings(): BrandSettings {
    const data = localStorage.getItem(BRAND_SETTINGS_STORAGE_KEY);
    if (data) return JSON.parse(data);
    return {
      brandName: 'Delhi Collection',
      logoUrl: '/10.png',
      backgroundImageUrl: '/Delhi Collection Design Bag (4).png',
      primaryColor: '#861730',
      accentColor: '#FDD145',
      whatsappNumber: '',
      instagramUrl: ''
    };
  }

  public saveBrandSettings(settings: BrandSettings): void {
    localStorage.setItem(BRAND_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    this.notify();
  }
`;

if (!code.includes('getBrandSettings')) {
  code = code.replace("private saveCampaigns", brandSettingsMethods + "\n  private saveCampaigns");
  fs.writeFileSync('src/data/campaignStore.ts', code);
}
