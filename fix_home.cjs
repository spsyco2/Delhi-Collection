const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerHome.tsx', 'utf8');

code = code.replace(/backgroundImage: settings\.backgroundImageUrl \? \\`url\("\\\$\\{settings\.backgroundImageUrl\\}"\\)\\` : 'none',/g, 'backgroundImage: settings.backgroundImageUrl ? `url("${settings.backgroundImageUrl}")` : \'none\',');
code = code.replace(/onClick=\{\(\) => navigate\(\\`\/campaign\/\\\$\\{camp\.id\\}\\`\)\}/g, 'onClick={() => navigate(`/campaign/${camp.id}`)}');
code = code.replace(/\\\$\\{!showHistory/g, '${!showHistory');
code = code.replace(/\\\$\\{showHistory/g, '${showHistory');

fs.writeFileSync('src/components/customer/CustomerHome.tsx', code);
