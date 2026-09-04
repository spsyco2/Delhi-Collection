const fs = require('fs');
let code = fs.readFileSync('src/data/campaignStore.ts', 'utf8');

code = code.replace("const CAMPAIGNS_STORAGE_KEY = 'maison_campaigns_v1';", "const CAMPAIGNS_STORAGE_KEY = 'maison_campaigns_v1';\nconst BRAND_SETTINGS_STORAGE_KEY = 'maison_brand_settings_v1';");
code = code.replace("import { INITIAL_CAMPAIGNS, INITIAL_PARTICIPANTS } from './initialData';", "import { INITIAL_CAMPAIGNS, INITIAL_PARTICIPANTS } from './initialData';\nimport { BrandSettings } from '../types';");

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
    this.notifyListeners();
  }
`;

code = code.replace("public saveCampaigns", brandSettingsMethods + "\n  public saveCampaigns");

code = code.replace("if (latestPrize && latestPrize.actionType === 'try_again' && userRecords.length === maxAllowed)", "if ((latestPrize?.actionType === 'try_again' || !latestRecord.isWinner) && userRecords.length === maxAllowed)");

fs.writeFileSync('src/data/campaignStore.ts', code);
