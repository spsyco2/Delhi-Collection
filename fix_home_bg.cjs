const fs = require('fs');
let code = fs.readFileSync('src/components/customer/CustomerHome.tsx', 'utf8');

const oldStyle = `      style={{
        backgroundColor: settings.primaryColor,
        backgroundImage: settings.backgroundImageUrl ? \`url("\${settings.backgroundImageUrl}")\` : 'none',`;

const newStyle = `      style={{
        backgroundColor: settings.backgroundColor || settings.primaryColor,
        backgroundImage: settings.backgroundImageUrl ? \`url("\${settings.backgroundImageUrl}")\` : 'none',`;

code = code.replace(oldStyle, newStyle);
fs.writeFileSync('src/components/customer/CustomerHome.tsx', code);
