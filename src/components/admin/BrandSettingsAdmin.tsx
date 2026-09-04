import React, { useState, useRef } from 'react';
import { campaignStore } from '../../data/campaignStore';
import { BrandSettings } from '../../types';
import { ImageUploadField } from '../common/ImageUploadField';
import { DEFAULT_LOGO_URL, DEFAULT_BACKGROUND_URL } from '../../assets/defaultAssets';
import { downloadJsonFile, readJsonFile } from '../../utils/fileUtils';
import { 
  Save, 
  Palette, 
  Layout, 
  Settings, 
  Type, 
  Share2, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  MapPin, 
  Youtube, 
  Globe, 
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Eye,
  Database,
  Download,
  Upload,
  FileJson,
  AlertTriangle,
  Check
} from 'lucide-react';

export const BrandSettingsAdmin: React.FC = () => {
  const [settings, setSettings] = useState<BrandSettings>(() => campaignStore.getBrandSettings());
  const [saved, setSaved] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'brand' | 'background' | 'social' | 'backup'>('brand');
  
  // Backup & restore state
  const [backupJsonText, setBackupJsonText] = useState('');
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Ensure numbers are cast correctly
    const toSave: BrandSettings = {
      ...settings,
      overlayColor: settings.overlayColor || '#861730',
      overlayOpacity: settings.overlayOpacity !== undefined ? Number(settings.overlayOpacity) : 75,
      blur: settings.blur !== undefined ? Number(settings.blur) : 0,
      brightness: settings.brightness !== undefined ? Number(settings.brightness) : 100
    };
    
    campaignStore.saveBrandSettings(toSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all brand and social settings to default Delhi Collection configurations?')) {
      const defaults = campaignStore.getDefaultBrandSettings();
      setSettings(defaults);
      campaignStore.saveBrandSettings(defaults);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleExportFullBackup = () => {
    const jsonStr = campaignStore.exportFullBackupJson();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadJsonFile(`delhi_collection_full_backup_${dateStr}.json`, jsonStr);
    setBackupStatus({ type: 'success', message: 'Full system backup exported successfully!' });
  };

  const handleExportCampaignsOnly = () => {
    const jsonStr = campaignStore.exportCampaignsJson();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadJsonFile(`delhi_collection_campaigns_${dateStr}.json`, jsonStr);
    setBackupStatus({ type: 'success', message: 'Campaigns exported successfully!' });
  };

  const handleBackupFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupFile(file);
    setBackupStatus(null);
    try {
      const text = await readJsonFile(file);
      setBackupJsonText(text);
    } catch (err: any) {
      setBackupStatus({ type: 'error', message: 'Failed to read file: ' + err.message });
    }
  };

  const handleExecuteRestore = () => {
    if (!backupJsonText.trim()) {
      setBackupStatus({ type: 'error', message: 'Please select a backup JSON file or paste JSON code.' });
      return;
    }
    const res = campaignStore.importFullBackupJson(backupJsonText);
    if (res.success) {
      setSettings(campaignStore.getBrandSettings());
      setBackupStatus({ type: 'success', message: res.message });
      setBackupJsonText('');
      setBackupFile(null);
    } else {
      setBackupStatus({ type: 'error', message: res.error || 'Failed to restore backup.' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-stone-200 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Centralized Configuration
              </span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-amber-400" />
              Admin Account Settings
            </h2>
            <p className="text-xs text-stone-300 mt-1 max-w-xl">
              Single unified configuration for Brand Identity, Colors, Background Styling, and Social Profiles across the entire user panel, Home page, and all Campaign pages.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-white/10"
              title="Reset to Delhi Collection default settings"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-300" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save All Settings</span>
            </button>
          </div>
        </div>
        
        {saved && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-4 text-center text-emerald-800 font-semibold text-sm flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All brand identity, styling, and social configurations have been saved & synced across the entire application!</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50/80 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('brand')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'brand'
                ? 'border-stone-900 text-stone-900 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-600" />
            <span>1. Brand Identity & Colors</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('background')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'background'
                ? 'border-stone-900 text-stone-900 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Layout className="w-4 h-4 text-amber-600" />
            <span>2. Unified Background & Foreground Tint</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('social')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'social'
                ? 'border-stone-900 text-stone-900 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Share2 className="w-4 h-4 text-amber-600" />
            <span>3. Unified Social Profiles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('backup')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'backup'
                ? 'border-stone-900 text-stone-900 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Database className="w-4 h-4 text-amber-600" />
            <span>4. System Backup & Restore</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8">
          
          {/* TAB 1: Brand Identity & Colors */}
          {activeSubTab === 'brand' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2 mb-1 pb-1">
                  <Type className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-stone-900">Brand Identity & Visuals</h3>
                </div>
                <p className="text-xs text-stone-500">
                  This brand name and logo will automatically reflect on customer home, wheel header, and spin views.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.brandName}
                    onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                    placeholder="e.g. Delhi Collection"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm transition-all font-semibold text-stone-900"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Displayed in headers and winning certificates.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Brand Tagline / Category Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.tagline || ''}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    placeholder="e.g. Men’s Wear | Streetwear | Trending Fashion"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm transition-all text-stone-900"
                  />
                </div>

                {/* Brand Logo with Image Upload & URL input */}
                <div className="md:col-span-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <ImageUploadField
                    label="Brand Logo (URL or Upload Image File)"
                    value={settings.logoUrl}
                    onChange={(val) => setSettings({ ...settings, logoUrl: val })}
                    placeholder="/Brand Logo.png or https://..."
                    helperText="Default brand logo is 'Brand Logo.png'. You can upload custom PNG, JPG, or SVG image."
                    presets={[
                      { name: 'Default Delhi Logo', url: DEFAULT_LOGO_URL },
                      { name: 'Static /Brand Logo.png', url: '/Brand Logo.png' },
                      { name: 'SVG /brand-logo.svg', url: '/brand-logo.svg' },
                    ]}
                  />
                </div>
              </div>

              {/* Theme Colors */}
              <div className="pt-6 border-t border-stone-200">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-stone-900">Brand Color Palette</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Primary Theme Color (Maroon / Burgundy)
                    </label>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm uppercase font-mono font-bold outline-none text-stone-800"
                      />
                      <div className="w-6 h-6 rounded-md shadow-xs" style={{ backgroundColor: settings.primaryColor }} />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1.5">
                      Main brand background, buttons, and theme accents.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Accent Highlight Color (Gold / Yellow)
                    </label>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm uppercase font-mono font-bold outline-none text-stone-800"
                      />
                      <div className="w-6 h-6 rounded-md shadow-xs" style={{ backgroundColor: settings.accentColor }} />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1.5">
                      Used for CTA buttons, wheel pointers, and glowing highlights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Unified Background Styling */}
          {activeSubTab === 'background' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2 mb-1 pb-1">
                  <Layout className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-stone-900">Unified Background & Visual Effects</h3>
                </div>
                <p className="text-xs text-stone-500">
                  Configure default background image ('Delhi Collection BackGround.png'), position, overlay opacity, and blur applied consistently across the platform.
                </p>
              </div>

              {/* Background Image Upload / URL Input */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200">
                <ImageUploadField
                  label="Default Background Image (URL or Upload Image)"
                  value={settings.backgroundImageUrl}
                  onChange={(val) => setSettings({ ...settings, backgroundImageUrl: val })}
                  placeholder="/Delhi Collection BackGround.png or https://..."
                  helperText="Default background is 'Delhi Collection BackGround.png'. You can upload custom high-resolution images."
                  presets={[
                    { name: 'Default Delhi Collection Background', url: DEFAULT_BACKGROUND_URL },
                    { name: 'Static /Delhi Collection BackGround.png', url: '/Delhi Collection BackGround.png' },
                    { name: 'SVG /delhi-background.svg', url: '/delhi-background.svg' },
                  ]}
                />
              </div>

              {/* Background Position & Sizing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Position</label>
                  <select
                    value={settings.backgroundPosition || 'center'}
                    onChange={(e) => setSettings({ ...settings, backgroundPosition: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm outline-none"
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Size</label>
                  <select
                    value={settings.backgroundSize || 'cover'}
                    onChange={(e) => setSettings({ ...settings, backgroundSize: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm outline-none"
                  >
                    <option value="cover">Cover (Fill Screen)</option>
                    <option value="contain">Contain (Fit Whole Image)</option>
                    <option value="auto">Auto (Natural Scale)</option>
                    <option value="100% 100%">Stretch (100% 100%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Repeat</label>
                  <select
                    value={settings.backgroundRepeat || 'no-repeat'}
                    onChange={(e) => setSettings({ ...settings, backgroundRepeat: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm outline-none"
                  >
                    <option value="no-repeat">No Repeat (Standard)</option>
                    <option value="repeat">Tile Repeat</option>
                    <option value="repeat-x">Repeat Horizontal</option>
                    <option value="repeat-y">Repeat Vertical</option>
                  </select>
                </div>
              </div>

              {/* Sliders: Overlay, Blur, Brightness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 p-5 bg-stone-50 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">Overlay Tint Color</label>
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-stone-200">
                    <input
                      type="color"
                      value={settings.overlayColor || settings.primaryColor || '#861730'}
                      onChange={(e) => setSettings({ ...settings, overlayColor: e.target.value })}
                      className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.overlayColor || settings.primaryColor || '#861730'}
                      onChange={(e) => setSettings({ ...settings, overlayColor: e.target.value })}
                      className="flex-1 bg-transparent text-xs font-mono font-semibold uppercase outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex justify-between text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                    <span>Overlay Opacity</span>
                    <span className="text-amber-700 font-bold">{settings.overlayOpacity !== undefined ? settings.overlayOpacity : 65}%</span>
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
                  <label className="flex justify-between text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                    <span>Background Blur</span>
                    <span className="text-amber-700 font-bold">{settings.blur || 0}px</span>
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
                  <label className="flex justify-between text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wider">
                    <span>Brightness</span>
                    <span className="text-amber-700 font-bold">{settings.brightness !== undefined ? settings.brightness : 100}%</span>
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="150"
                    value={settings.brightness !== undefined ? settings.brightness : 100}
                    onChange={(e) => setSettings({ ...settings, brightness: parseInt(e.target.value) })}
                    className="w-full mt-2 accent-amber-600"
                  />
                </div>
              </div>

              {/* Live Mini Preview Box */}
              <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-600" />
                    Live Background & Card Preview
                  </span>
                  <span className="text-[10px] text-stone-500">How customers see the backdrop</span>
                </div>
                
                <div 
                  className="w-full h-44 rounded-xl relative overflow-hidden flex items-center justify-center p-4 border border-stone-300 shadow-inner"
                  style={{
                    backgroundColor: settings.backgroundColor || settings.primaryColor,
                    backgroundImage: settings.backgroundImageUrl ? `url("${settings.backgroundImageUrl}")` : 'none',
                    backgroundSize: settings.backgroundSize || 'cover',
                    backgroundPosition: settings.backgroundPosition || 'center',
                    backgroundRepeat: settings.backgroundRepeat || 'no-repeat',
                  }}
                >
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: settings.overlayColor || settings.primaryColor,
                      opacity: (settings.overlayOpacity !== undefined ? settings.overlayOpacity : 65) / 100,
                      backdropFilter: `blur(${settings.blur || 0}px) brightness(${settings.brightness || 100}%)`,
                    }}
                  />
                  
                  <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center max-w-xs shadow-xl">
                    <div className="w-12 h-12 rounded-full mx-auto mb-2 overflow-hidden bg-white flex items-center justify-center shadow-md border-2" style={{ borderColor: settings.accentColor }}>
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-xs">DC</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold font-serif text-white" style={{ color: settings.accentColor }}>
                      {settings.brandName}
                    </h4>
                    <p className="text-[10px] text-white/80 mt-0.5">
                      {settings.tagline || 'Trending Fashion & Exclusive Rewards'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Unified Social Profiles */}
          {activeSubTab === 'social' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2 mb-1 pb-1">
                  <Share2 className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-stone-900">Unified Social Profile Links</h3>
                </div>
                <p className="text-xs text-stone-500">
                  Single social profile configuration used everywhere across the customer panel, campaign views, share buttons, and store footers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WhatsApp */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Contact & Chat</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      WhatsApp Mobile Number
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappNumber || ''}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      placeholder="919310581186"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm font-mono text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      WhatsApp Chat Direct Link URL
                    </label>
                    <input
                      type="url"
                      value={settings.whatsappUrl || ''}
                      onChange={(e) => setSettings({ ...settings, whatsappUrl: e.target.value })}
                      placeholder="https://wa.me/919310581186?text=Hi..."
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2 text-pink-700 font-bold text-xs uppercase tracking-wider">
                    <Instagram className="w-4 h-4" />
                    <span>Instagram Profile</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      value={settings.instagramUrl || ''}
                      onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                      placeholder="https://www.instagram.com/delhi_collection_1/"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Used when customers tag Delhi Collection on winning rewards.
                    </p>
                  </div>
                </div>

                {/* Facebook */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                    <Facebook className="w-4 h-4" />
                    <span>Facebook Page</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Facebook Page URL
                    </label>
                    <input
                      type="url"
                      value={settings.facebookUrl || ''}
                      onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                      placeholder="https://www.facebook.com/uniqueItems05/"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900"
                    />
                  </div>
                </div>

                {/* Google Maps Location */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    <span>Store Location / Google Maps</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Google Maps Location URL (Bharwara)
                    </label>
                    <input
                      type="url"
                      value={settings.googleMapsUrl || ''}
                      onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                      placeholder="https://maps.app.goo.gl/2XtiDe9uBGQP8WGo8"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Main Road, Bouka Chowk, Bharwara, Bihar
                    </p>
                  </div>
                </div>

                {/* YouTube & Online Store */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 md:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs mb-1">
                        <Youtube className="w-4 h-4" />
                        <span>YouTube Channel URL (Optional)</span>
                      </div>
                      <input
                        type="url"
                        value={settings.youtubeUrl || ''}
                        onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                        placeholder="https://youtube.com/@delhicollection"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-stone-800 font-bold text-xs mb-1">
                        <Globe className="w-4 h-4 text-amber-600" />
                        <span>Website / Online Store URL</span>
                      </div>
                      <input
                        type="url"
                        value={settings.storeUrl || ''}
                        onChange={(e) => setSettings({ ...settings, storeUrl: e.target.value })}
                        placeholder="https://delhicollection.in"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Backup & Restore Data */}
          {activeSubTab === 'backup' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2 mb-1 pb-1">
                  <Database className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-stone-900">System Data Backup & Automatic Restore</h3>
                </div>
                <p className="text-xs text-stone-500">
                  Export all your campaigns (including Raksha Bandhan), brand customizations, foreground settings (#861730 at 75%), and participants into a single backup file, or restore an earlier backup at any time.
                </p>
              </div>

              {/* Status Alert */}
              {backupStatus && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  backupStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {backupStatus.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm font-medium">{backupStatus.message}</span>
                </div>
              )}

              {/* Export Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-amber-600" />
                    <h4 className="text-sm font-bold text-stone-900">Full System Snapshot</h4>
                  </div>
                  <p className="text-xs text-stone-500">
                    Exports all campaigns, Raksha Bandhan special configuration, brand identities, custom colors, background settings, and winner logs.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportFullBackup}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download Full System Backup (.json)</span>
                  </button>
                </div>

                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-amber-600" />
                    <h4 className="text-sm font-bold text-stone-900">Campaigns Only Backup</h4>
                  </div>
                  <p className="text-xs text-stone-500">
                    Exports only the campaign configurations and prize matrices to share or import into other instances.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportCampaignsOnly}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-stone-600" />
                    <span>Download Campaigns Backup (.json)</span>
                  </button>
                </div>
              </div>

              {/* Restore Section */}
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-600" />
                  <h4 className="text-sm font-bold text-stone-900">Restore from Backup File</h4>
                </div>
                <p className="text-xs text-stone-500">
                  Select your backup <span className="font-mono text-stone-800">.json</span> file to automatically restore and synchronize campaigns, colors, and settings.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleBackupFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-white hover:bg-amber-50/40"
                >
                  <FileJson className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  {backupFile ? (
                    <div>
                      <p className="text-xs font-bold text-stone-800">{backupFile.name}</p>
                      <p className="text-[11px] text-stone-500">{(backupFile.size / 1024).toFixed(1)} KB • Click to replace file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-stone-700">Click to select backup file from your computer</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Supports full backup JSON or campaigns backup JSON</p>
                    </div>
                  )}
                </div>

                {/* Paste JSON code */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Or paste raw JSON backup content:
                  </label>
                  <textarea
                    rows={3}
                    value={backupJsonText}
                    onChange={(e) => setBackupJsonText(e.target.value)}
                    placeholder='{"version": "1.0", "brandSettings": {...}, "campaigns": [...]}'
                    className="w-full p-3 font-mono text-[11px] bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleExecuteRestore}
                    disabled={!backupJsonText.trim()}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-black disabled:bg-stone-300 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Restore Selected Backup</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                const defaults = campaignStore.getDefaultBrandSettings();
                setSettings(defaults);
                campaignStore.saveBrandSettings(defaults);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Brand Assets</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Save & Apply Settings Everywhere</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
