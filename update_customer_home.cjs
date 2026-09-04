const fs = require('fs');

let code = fs.readFileSync('src/components/customer/CustomerHome.tsx', 'utf8');

const oldStyle = `      style={{
        backgroundColor: settings.primaryColor,
        backgroundImage: settings.backgroundImageUrl ? \`url("\${settings.backgroundImageUrl}")\` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}`;

const newStyle = `      style={{
        backgroundColor: settings.primaryColor,
        backgroundImage: settings.backgroundImageUrl ? \`url("\${settings.backgroundImageUrl}")\` : 'none',
        backgroundSize: settings.backgroundSize || 'cover',
        backgroundPosition: settings.backgroundPosition || 'center',
        backgroundRepeat: settings.backgroundRepeat || 'no-repeat',
        backgroundAttachment: 'fixed',
      }}`;

const oldOverlay = `{settings.backgroundImageUrl && (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: settings.primaryColor, opacity: 0.65 }}></div>
      )}`;

const newOverlay = `{settings.backgroundImageUrl && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none" 
          style={{ 
            backgroundColor: settings.overlayColor || settings.primaryColor, 
            opacity: (settings.overlayOpacity !== undefined ? settings.overlayOpacity : 65) / 100,
            backdropFilter: \`blur(\${settings.blur || 0}px) brightness(\${settings.brightness || 100}%)\`,
            WebkitBackdropFilter: \`blur(\${settings.blur || 0}px) brightness(\${settings.brightness || 100}%)\`
          }}
        ></div>
      )}`;

code = code.replace(oldStyle, newStyle);
code = code.replace(oldOverlay, newOverlay);

fs.writeFileSync('src/components/customer/CustomerHome.tsx', code);
