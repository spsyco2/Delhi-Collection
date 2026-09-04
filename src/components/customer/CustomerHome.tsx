import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignStore } from '../../data/campaignStore';
import { BrandSettings, Campaign, ParticipantRecord } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { DEFAULT_LOGO_URL, DEFAULT_BACKGROUND_URL } from '../../assets/defaultAssets';
import { 
  Lock, 
  User, 
  Phone, 
  Play, 
  Gift, 
  History, 
  ChevronRight, 
  Sparkles,
  Instagram,
  Facebook,
  MessageCircle,
  MapPin,
  Youtube,
  Globe,
  ExternalLink
} from 'lucide-react';

export const CustomerHome: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [settings, setSettings] = useState<BrandSettings>(() => campaignStore.getBrandSettings());
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [customer, setCustomer] = useState<{ name: string; phone: string } | null>(null);
  const [showParticipationForm, setShowParticipationForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [history, setHistory] = useState<ParticipantRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const updateData = () => {
      setSettings(campaignStore.getBrandSettings());
      setActiveCampaigns(campaignStore.getCampaigns().filter(c => c.status === 'active'));
    };
    updateData();
    return campaignStore.subscribe(updateData);
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem('dc_customer_name');
    const savedPhone = localStorage.getItem('dc_customer_phone');
    if (savedName && savedPhone) {
      setCustomer({ name: savedName, phone: savedPhone });
      loadHistory(savedPhone);
    }
  }, []);

  const loadHistory = (phoneNumber: string) => {
    const allParticipants = campaignStore.getParticipants();
    const myRecords = allParticipants.filter(
      p => p.phoneNumber === phoneNumber || 
      p.phoneNumber.replace(/[\s\-\(\)\.]/g, '') === phoneNumber.replace(/[\s\-\(\)\.]/g, '')
    );
    setHistory(myRecords.sort((a, b) => new Date(b.participatedAt).getTime() - new Date(a.participatedAt).getTime()));
  };

  const handleParticipate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    localStorage.setItem('dc_customer_name', name);
    localStorage.setItem('dc_customer_phone', phone);
    setCustomer({ name, phone });
    loadHistory(phone);
    setShowParticipationForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('dc_customer_name');
    localStorage.removeItem('dc_customer_phone');
    setCustomer(null);
    setShowHistory(false);
  };

  const effectiveBgUrl = settings.backgroundImageUrl || DEFAULT_BACKGROUND_URL;
  const effectiveLogoUrl = settings.logoUrl || DEFAULT_LOGO_URL;

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-start transition-colors duration-300 pb-12 relative overflow-x-hidden"
      style={{
        backgroundColor: settings.backgroundColor || settings.primaryColor,
        backgroundImage: effectiveBgUrl ? `url("${effectiveBgUrl}")` : 'none',
        backgroundSize: settings.backgroundSize || 'cover',
        backgroundPosition: settings.backgroundPosition || 'center',
        backgroundRepeat: settings.backgroundRepeat || 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Background Overlay Layer */}
      {effectiveBgUrl && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none" 
          style={{ 
            backgroundColor: settings.overlayColor || settings.primaryColor || '#861730', 
            opacity: (settings.overlayOpacity !== undefined ? settings.overlayOpacity : 75) / 100,
            backdropFilter: `blur(${settings.blur || 0}px) brightness(${settings.brightness || 100}%)`,
            WebkitBackdropFilter: `blur(${settings.blur || 0}px) brightness(${settings.brightness || 100}%)`
          }}
        />
      )}

      {/* Top Bar with Translate & Language Selection */}
      <div className="z-20 w-full max-w-md mx-auto pt-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white text-[11px]">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="font-medium">{t('exclusive_privilege')}</span>
        </div>

        {/* User Panel Translate Button */}
        <LanguageSelector
          variant="header"
          themePrimaryColor={settings.primaryColor}
          themeAccentColor={settings.accentColor}
        />
      </div>

      <div className="z-10 w-full max-w-md mx-auto pt-6 px-4 flex flex-col items-center min-h-[calc(100vh-80px)]">
        {/* Brand Profile Emblem */}
        <div 
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 mb-4 shadow-2xl flex items-center justify-center bg-white" 
          style={{ borderColor: settings.accentColor || '#FDD145' }}
        >
          {effectiveLogoUrl ? (
            <img 
              src={effectiveLogoUrl} 
              alt={settings.brandName} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-3xl sm:text-4xl font-bold font-serif text-stone-900">DC</span>
          )}
        </div>
        
        {/* Brand Headline & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-center mb-1 drop-shadow-md" style={{ color: settings.accentColor || '#FDD145' }}>
          {settings.brandName || 'Delhi Collection'}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-center mb-6 text-white/90 max-w-xs drop-shadow-sm">
          {settings.tagline || t('exclusive_rewards')}
        </p>

        {/* Brand Story Section */}
        <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/20 shadow-xl mb-8 animate-fadeIn text-center">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            About {settings.brandName || 'Delhi Collection'}
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            {settings.brandDescription || "Welcome to Delhi Collection, where luxury meets tradition. We bring you the finest curated collections and exclusive rewards to enhance your shopping experience."}
          </p>
        </div>

        {/* Visit Us Section */}
        <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/20 shadow-xl mb-8 animate-fadeIn">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-400" />
            Visit Our Store
          </h2>
          <div className="space-y-3 text-sm text-white/80">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-3 h-3" />
              </div>
              <p>{settings.storeAddress || "Main Market, Bharwara, Delhi"}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Phone className="w-3 h-3" />
              </div>
              <p>{settings.whatsappNumber || "+91 000 000 0000"}</p>
            </div>
          </div>
          {settings.googleMapsUrl && (
            <a 
              href={settings.googleMapsUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="mt-4 w-full py-2.5 bg-white/20 hover:bg-white/30 text-white text-center rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/30"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Google Maps
            </a>
          )}
        </div>

        {!customer && !showParticipationForm && (
          <button
            type="button"
            onClick={() => setShowParticipationForm(true)}
            className="w-full py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: settings.accentColor || '#FDD145', color: settings.primaryColor || '#861730' }}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t('participate_now')}</span>
          </button>
        )}

        {/* Customer Identity Form */}
        {showParticipationForm && !customer && (
          <div className="w-full bg-white/15 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl animate-fadeIn">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 text-center">
              {t('join_campaign')}
            </h2>
            <form onSubmit={handleParticipate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5 ml-1">
                  {t('full_name')}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('enter_name')}
                    className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/25 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:bg-white/20 transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5 ml-1">
                  {t('phone_number')}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('enter_phone')}
                    className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/25 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:bg-white/20 transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                style={{ backgroundColor: settings.accentColor || '#FDD145', color: settings.primaryColor || '#861730' }}
              >
                {t('continue_to_campaigns')}
              </button>
            </form>
          </div>
        )}

        {/* Customer Logged-in State */}
        {customer && (
          <div className="w-full animate-fadeIn flex flex-col flex-grow">
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 mb-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{customer.name}</p>
                  <p className="text-[11px] text-white/70">{customer.phone}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleLogout} 
                className="text-[10px] uppercase font-bold text-white/60 hover:text-white transition-colors bg-white/10 px-2.5 py-1 rounded-lg"
              >
                {t('change_user')}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2.5 mb-4">
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !showHistory 
                    ? 'shadow-lg scale-100' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                style={!showHistory ? { backgroundColor: settings.accentColor || '#FDD145', color: settings.primaryColor || '#861730' } : {}}
              >
                <Gift className="w-4 h-4" />
                <span>{t('live_campaigns')}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  showHistory 
                    ? 'shadow-lg scale-100' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                style={showHistory ? { backgroundColor: settings.accentColor || '#FDD145', color: settings.primaryColor || '#861730' } : {}}
              >
                <History className="w-4 h-4" />
                <span>{t('my_rewards')}</span>
              </button>
            </div>

            {/* Campaign Cards */}
            {!showHistory ? (
              <div className="space-y-4">
                {activeCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-white/70 bg-white/10 rounded-2xl border border-white/15 p-4">
                    <p className="text-xs">{t('no_active_campaigns')}</p>
                  </div>
                ) : (
                  activeCampaigns.map(camp => (
                    <div 
                      key={camp.id}
                      onClick={() => navigate(`/campaign/${camp.id}`)}
                      className="group bg-white rounded-3xl overflow-hidden cursor-pointer hover:scale-[1.01] transition-all shadow-2xl flex flex-col mb-4 border border-stone-200/60"
                    >
                      <div 
                        className="h-32 w-full relative"
                        style={{ backgroundColor: camp.design?.primaryColor || settings.primaryColor }}
                      >
                        {(camp.design?.bannerImageUrl || settings.backgroundImageUrl) && (
                          <div 
                            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-60"
                            style={{ backgroundImage: `url(${camp.design?.bannerImageUrl || settings.backgroundImageUrl})` }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/95 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-yellow-400" />
                            {camp.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 sm:p-5 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-stone-900 leading-tight mb-1 group-hover:text-amber-700 transition-colors">
                          {camp.name}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
                          {camp.description}
                        </p>
                        
                        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                             <Gift className="w-3.5 h-3.5" />
                             <span>{t('win_prizes_instantly')}</span>
                          </div>
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all group-hover:scale-110" 
                            style={{ backgroundColor: settings.primaryColor || '#861730', color: settings.accentColor || '#FDD145' }}
                          >
                            <ChevronRight className="w-4 h-4 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-white/70 bg-white/10 rounded-2xl border border-white/15 p-4">
                    <p className="text-xs">{t('no_history')}</p>
                  </div>
                ) : (
                  history.map(record => (
                    <div key={record.id} className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 flex items-center justify-between shadow-md">
                      <div>
                        <p className="text-[10px] text-white/70 mb-0.5">
                          {record.campaignName} • {new Date(record.participatedAt).toLocaleDateString()}
                        </p>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {record.isWinner ? <Gift className="w-3.5 h-3.5 text-green-400" /> : <Play className="w-3.5 h-3.5 text-stone-400" />}
                          {record.prizeLabel}
                        </h4>
                        {record.isWinner && (
                          <p className="text-[11px] font-mono text-white mt-1 bg-black/30 inline-block px-2.5 py-0.5 rounded-md border border-white/20 font-bold">
                            Code: {record.promoCode}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Unified Social Media Profiles Footer */}
        <div className="w-full mt-6 pt-4 border-t border-white/15 flex flex-col items-center justify-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-300 bg-black/40 px-3 py-0.5 rounded-full border border-amber-400/20 backdrop-blur-sm">
            {t('connect_with_us')}
          </span>

          <div className="flex items-center justify-center gap-2.5 bg-black/30 p-2 rounded-2xl backdrop-blur-md border border-white/15 shadow-lg">
            {settings.instagramUrl && (
              <a 
                href={settings.instagramUrl} 
                target="_blank" 
                rel="noreferrer" 
                title="Instagram"
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}

            {(settings.whatsappUrl || settings.whatsappNumber) && (
              <a 
                href={settings.whatsappUrl || `https://wa.me/${settings.whatsappNumber}`} 
                target="_blank" 
                rel="noreferrer" 
                title="WhatsApp"
                className="w-9 h-9 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}

            {settings.facebookUrl && (
              <a 
                href={settings.facebookUrl} 
                target="_blank" 
                rel="noreferrer" 
                title="Facebook"
                className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}

            {settings.googleMapsUrl && (
              <a 
                href={settings.googleMapsUrl} 
                target="_blank" 
                rel="noreferrer" 
                title="Store Location (Bharwara)"
                className="w-9 h-9 rounded-xl bg-stone-100 text-red-600 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <MapPin className="w-4 h-4" />
              </a>
            )}

            {settings.youtubeUrl && (
              <a 
                href={settings.youtubeUrl} 
                target="_blank" 
                rel="noreferrer" 
                title="YouTube"
                className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}

            {settings.storeUrl && (
              <a 
                href={settings.storeUrl} 
                target="_blank" 
                rel="noreferrer" 
                title="Website"
                className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
        
        {/* Admin Login Link */}
        <div className="mt-6 w-full text-center">
          <button 
            type="button"
            onClick={() => navigate('/admin/login')} 
            className="inline-flex items-center gap-1.5 text-[10px] text-white/50 hover:text-white transition-colors uppercase tracking-widest font-bold bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10"
          >
            <Lock className="w-3 h-3" />
            <span>{t('admin_login')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
