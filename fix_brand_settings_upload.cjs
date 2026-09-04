const fs = require('fs');

let code = `import React, { useState, useRef } from 'react';
import { campaignStore } from '../../data/campaignStore';
import { BrandSettings } from '../../types';
import { Save, Image as ImageIcon, Link, Palette, Layout, Settings, Type, Upload } from 'lucide-react';

export const BrandSettingsAdmin = () => {
  const [settings, setSettings] = useState<BrandSettings>(campaignStore.getBrandSettings());
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert string number inputs to actual numbers for opacity, blur, etc.
    const toSave = {
      ...settings,
      overlayOpacity: settings.overlayOpacity !== undefined ? Number(settings.overlayOpacity) : 65,
      blur: settings.blur !== undefined ? Number(settings.blur) : 0,
      brightness: settings.brightness !== undefined ? Number(settings.brightness) : 100
    };
    
    campaignStore.saveBrandSettings(toSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'backgroundImageUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-stone-100 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-amber-600" />
              Admin Account Settings
            </h2>
            <p className="text-sm text-stone-500 mt-1">Admin Panel Configuration & Site Customization.</p>
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Save className="w-4 h-4" /> Save All Settings
          </button>
        </div>
        
        {saved && (
          <div className="bg-emerald-50 border-b border-emerald-100 p-4 text-center text-emerald-700 font-medium animate-fadeIn">
            ✅ All site configurations have been saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-10">
          
          {/* SECTION: Site Identity */}
          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-stone-100">
              <Type className="w-5 h-5 text-stone-400" />
              <h3 className="text-lg font-bold text-stone-800">Site Identity & Header</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Site Brand Name</label>
                <input
                  type="text"
                  required
                  value={settings.brandName}
                  onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Site Logo</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={settings.logoUrl}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="/logo.png or base64..."
                      className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm transition-all"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={logoInputRef}
                    onChange={(e) => handleFileUpload(e, 'logoUrl')}
                  />
                  <button 
                    type="button" 
                    onClick={() => logoInputRef.current?.click()}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium flex items-center gap-2 border border-stone-200 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Upload
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: Site Colors */}
          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-stone-100">
              <Palette className="w-5 h-5 text-stone-400" />
              <h3 className="text-lg font-bold text-stone-800">Site Colors</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Primary Color</label>
                <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-xl border border-stone-200">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm uppercase font-mono font-medium outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Accent Color</label>
                <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-xl border border-stone-200">
                  <input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="w-10 h-10 rounded border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm uppercase font-mono font-medium outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: Site Background */}
          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-stone-100">
              <Layout className="w-5 h-5 text-stone-400" />
              <h3 className="text-lg font-bold text-stone-800">Site Background Settings</h3>
            </div>
            
            <div className="space-y-6">
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
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm uppercase font-mono font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Background Image URL</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={settings.backgroundImageUrl}
                      onChange={(e) => setSettings({ ...settings, backgroundImageUrl: e.target.value })}
                      placeholder="/background.jpg or base64..."
                      className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm transition-all"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={bgInputRef}
                    onChange={(e) => handleFileUpload(e, 'backgroundImageUrl')}
                  />
                  <button 
                    type="button" 
                    onClick={() => bgInputRef.current?.click()}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium flex items-center gap-2 border border-stone-200 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Upload Image
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Position</label>
                  <select
                    value={settings.backgroundPosition || 'center'}
                    onChange={(e) => setSettings({ ...settings, backgroundPosition: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm outline-none"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Size</label>
                  <select
                    value={settings.backgroundSize || 'cover'}
                    onChange={(e) => setSettings({ ...settings, backgroundSize: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm outline-none"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="auto">Auto</option>
                    <option value="100% 100%">Stretch (100% 100%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Repeat</label>
                  <select
                    value={settings.backgroundRepeat || 'no-repeat'}
                    onChange={(e) => setSettings({ ...settings, backgroundRepeat: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm outline-none"
                  >
                    <option value="no-repeat">No Repeat</option>
                    <option value="repeat">Repeat</option>
                    <option value="repeat-x">Repeat X</option>
                    <option value="repeat-y">Repeat Y</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">Overlay Color</label>
                  <input
                    type="color"
                    value={settings.overlayColor || '#000000'}
                    onChange={(e) => setSettings({ ...settings, overlayColor: e.target.value })}
                    className="w-full h-9 rounded-lg border-0 cursor-pointer p-0"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                    <span>Opacity</span>
                    <span className="text-amber-600">{settings.overlayOpacity !== undefined ? settings.overlayOpacity : 65}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.overlayOpacity !== undefined ? settings.overlayOpacity : 65}
                    onChange={(e) => setSettings({ ...settings, overlayOpacity: parseInt(e.target.value) })}
                    className="w-full mt-2 accent-amber-600"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                    <span>Blur</span>
                    <span className="text-amber-600">{settings.blur || 0}px</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={settings.blur || 0}
                    onChange={(e) => setSettings({ ...settings, blur: parseInt(e.target.value) })}
                    className="w-full mt-2 accent-amber-600"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                    <span>Brightness</span>
                    <span className="text-amber-600">{settings.brightness !== undefined ? settings.brightness : 100}%</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={settings.brightness !== undefined ? settings.brightness : 100}
                    onChange={(e) => setSettings({ ...settings, brightness: parseInt(e.target.value) })}
                    className="w-full mt-2 accent-amber-600"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: Social Links */}
          <section>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-stone-100">
              <Link className="w-5 h-5 text-stone-400" />
              <h3 className="text-lg font-bold text-stone-800">Social Links</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">WhatsApp Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">#</span>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    placeholder="919876543210"
                    className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Instagram URL</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">@</span>
                  <input
                    type="text"
                    value={settings.instagramUrl}
                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

        </form>
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/components/admin/BrandSettingsAdmin.tsx', code);
