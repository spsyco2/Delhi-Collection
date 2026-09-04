const fs = require('fs');
let code = fs.readFileSync('src/components/admin/BrandSettingsAdmin.tsx', 'utf8');

const oldSection = `<div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Background Image URL (Upload / Link)</label>`;

const newSection = `<div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Background Color (Fallback)</label>
                <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-xl border border-stone-200 w-full sm:w-1/2">
                  <input
                    type="color"
                    value={settings.backgroundColor || settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor || settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm uppercase font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Background Image URL (Upload / Link)</label>`;

code = code.replace(oldSection, newSection);
fs.writeFileSync('src/components/admin/BrandSettingsAdmin.tsx', code);
