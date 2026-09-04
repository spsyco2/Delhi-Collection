const fs = require('fs');
let code = fs.readFileSync('src/components/admin/CampaignWizard.tsx', 'utf8');

code = code.replace(/isWinning: true/g, "isWinning: true,\n      actionType: 'win'");
code = code.replace(/isWinning: false/g, "isWinning: false,\n      actionType: 'lose'");

fs.writeFileSync('src/components/admin/CampaignWizard.tsx', code);

let storeCode = fs.readFileSync('src/data/campaignStore.ts', 'utf8');
storeCode = storeCode.replace(/null \|\| localStorage/g, "localStorage");
fs.writeFileSync('src/data/campaignStore.ts', storeCode);
