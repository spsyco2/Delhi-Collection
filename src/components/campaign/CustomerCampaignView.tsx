import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Campaign, PrizeOption, EligibilityResult, ParticipantRecord, BrandSettings } from '../../types';
import { campaignStore, normalizePhoneNumber } from '../../data/campaignStore';
import { SpinWheel, getPrizeIcon } from './SpinWheel';
import { PrizeIcon } from '../common/PrizeIcon';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { DEFAULT_LOGO_URL, DEFAULT_BACKGROUND_URL } from '../../assets/defaultAssets';
import { shareToWhatsAppStory, shareToInstagramStory } from '../../utils/storyShare';
import { 
  Sparkles, 
  Check, 
  Copy, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Globe, 
  ChevronRight, 
  ArrowRight, 
  ArrowLeft,
  Home,
  RefreshCw,
  Gift,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  User,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
  Youtube,
  Share2,
  Download,
  Loader2
} from 'lucide-react';

interface CustomerCampaignViewProps {
  campaign: Campaign;
  onCampaignUpdated?: () => void;
  isEmbedPreview?: boolean;
  onBack?: () => void;
}

export const CustomerCampaignView: React.FC<CustomerCampaignViewProps> = ({
  campaign,
  onCampaignUpdated,
  isEmbedPreview = false,
  onBack,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [globalBrand, setGlobalBrand] = useState<BrandSettings>(() => campaignStore.getBrandSettings());

  const handleBackNavigation = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  // Form input states
  const [customerName, setCustomerName] = useState<string>(localStorage.getItem('dc_customer_name') || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(localStorage.getItem('dc_customer_phone') || '');
  
  // Interaction states
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<boolean>(false);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(!!localStorage.getItem('dc_customer_phone'));

  // Spin execution states
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [targetPrizeIndex, setTargetPrizeIndex] = useState<number | null>(null);
  const [wonPrize, setWonPrize] = useState<PrizeOption | null>(null);
  const [wonRecord, setWonRecord] = useState<ParticipantRecord | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Story sharing states
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState<boolean>(false);
  const [isSharingInstagram, setIsSharingInstagram] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = campaignStore.subscribe(() => {
      setGlobalBrand(campaignStore.getBrandSettings());
    });
    return unsub;
  }, []);

  // Re-check eligibility if user changes
  useEffect(() => {
    if (localStorage.getItem('dc_customer_phone') && localStorage.getItem('dc_customer_name')) {
      const result = campaignStore.checkEligibility(
        campaign.id, 
        localStorage.getItem('dc_customer_phone')!, 
        localStorage.getItem('dc_customer_name')!
      );
      setEligibility(result);
    }
  }, [campaign.id]);

  const handleVerifyIdentity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (campaign.rules.requireName && !customerName.trim()) {
      setErrorMessage(t('enter_name'));
      return;
    }

    if (campaign.rules.requirePhone && (!phoneNumber.trim() || normalizePhoneNumber(phoneNumber).length < 7)) {
      setErrorMessage(t('enter_phone'));
      return;
    }

    setIsCheckingEligibility(true);
    
    // Simulate brief validation
    setTimeout(() => {
      const result = campaignStore.checkEligibility(campaign.id, phoneNumber, customerName);
      setEligibility(result);
      setIsCheckingEligibility(false);

      if (result.isEligible) {
        setIsVerified(true);
        localStorage.setItem('dc_customer_name', customerName);
        localStorage.setItem('dc_customer_phone', phoneNumber);
      } else {
        setIsVerified(false);
        // If they already won previously, allow them to view their past reward
        if (result.previousParticipations && result.previousParticipations.length > 0) {
          const past = result.previousParticipations[0];
          setWonRecord(past);
          const prizeObj = campaign.prizes.find(p => p.id === past.prizeId);
          if (prizeObj) setWonPrize(prizeObj);
        }
      }
    }, 400);
  };

  const handleStartSpin = () => {
    if (!isVerified || isSpinning) return;
    setErrorMessage(null);

    // Call store execute spin
    const res = campaignStore.executeSpin(campaign.id, customerName, phoneNumber);
    if (!res.success || res.prizeIndex === undefined || !res.prize) {
      setErrorMessage(res.error || t('already_reached_limit'));
      setIsVerified(false);
      return;
    }

    setTargetPrizeIndex(res.prizeIndex);
    setWonPrize(res.prize);
    setWonRecord(res.record || null);
    setIsSpinning(true);
  };

  const handleSpinComplete = () => {
    setIsSpinning(false);
    setShowResultModal(true);
    if (onCampaignUpdated) {
      onCampaignUpdated();
    }
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleWhatsAppStoryShare = async () => {
    if (!wonPrize) return;
    setIsSharingWhatsApp(true);
    setShareToast('Opening WhatsApp... Select "My Status" to share to your Story 📲');
    try {
      await shareToWhatsAppStory({
        brandName: activeBrandName,
        prize: wonPrize,
        promoCode: wonPrize.promoCode || wonRecord?.promoCode || 'DELHIVIP',
        campaignTitle: campaign.name,
        primaryColor: globalBrand.primaryColor,
        accentColor: activeAccentColor,
        campaignUrl: window.location.href,
      });
    } catch (err) {
      console.error('WhatsApp Story share error:', err);
    } finally {
      setTimeout(() => {
        setIsSharingWhatsApp(false);
        setShareToast(null);
      }, 3500);
    }
  };

  const handleInstagramStoryShare = async () => {
    if (!wonPrize) return;
    setIsSharingInstagram(true);
    setShareToast('Generating Story Card... Opening Instagram 📸');
    try {
      const result = await shareToInstagramStory(
        {
          brandName: activeBrandName,
          prize: wonPrize,
          promoCode: wonPrize.promoCode || wonRecord?.promoCode || 'DELHIVIP',
          campaignTitle: campaign.name,
          primaryColor: globalBrand.primaryColor,
          accentColor: activeAccentColor,
          campaignUrl: window.location.href,
        },
        globalBrand.instagramUrl
      );
      if (result.downloaded) {
        setShareToast('Story image saved & caption copied! Upload to your Story in Instagram ✨');
      }
    } catch (err) {
      console.error('Instagram Story share error:', err);
    } finally {
      setTimeout(() => {
        setIsSharingInstagram(false);
        setShareToast(null);
      }, 4000);
    }
  };

  // Quick preset phone fillers for fast testing
  const fillDemoCustomer = (name: string, phone: string) => {
    setCustomerName(name);
    setPhoneNumber(phone);
    setEligibility(null);
    setIsVerified(false);
    setShowResultModal(false);
  };

  // Brand hierarchy: A custom campaign background uploaded during campaign creation takes direct precedence for that campaign
  const activeBrandName = globalBrand.brandName || campaign.design.brandName || 'Delhi Collection';
  const activeLogoUrl = campaign.design.logoUrl || globalBrand.logoUrl || DEFAULT_LOGO_URL;
  const isCustomCampaignBg = !!(campaign.design.backgroundImageUrl && campaign.design.backgroundImageUrl.trim());
  const activeBackgroundUrl = isCustomCampaignBg 
    ? campaign.design.backgroundImageUrl.trim() 
    : (globalBrand.backgroundImageUrl || DEFAULT_BACKGROUND_URL);
  const activePrimaryColor = campaign.design.primaryColor || globalBrand.primaryColor || '#861730';
  const activeAccentColor = campaign.design.accentColor || globalBrand.accentColor || '#FDD145';

  const { design } = campaign;

  return (
    <div 
      className="min-h-full w-full flex flex-col items-center justify-start transition-colors duration-300 pb-12 relative overflow-x-hidden"
      style={{
        backgroundColor: activePrimaryColor,
        color: '#ffffff',
      }}
    >
      {/* Background Image & Atmosphere Layer */}
      {activeBackgroundUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={activeBackgroundUrl} 
            alt="Campaign Atmosphere"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          {/* Subtle overlay: if custom campaign image, keep it clean and true with mild darkening for text readability; otherwise apply global overlay */}
          {isCustomCampaignBg ? (
            <div className="absolute inset-0 bg-black/35 backdrop-brightness-95 pointer-events-none" />
          ) : (
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                backgroundColor: globalBrand.overlayColor || activePrimaryColor || '#861730', 
                opacity: (globalBrand.overlayOpacity !== undefined ? globalBrand.overlayOpacity : 75) / 100,
                backdropFilter: `blur(${globalBrand.blur || 0}px) brightness(${globalBrand.brightness || 100}%)`,
                WebkitBackdropFilter: `blur(${globalBrand.blur || 0}px) brightness(${globalBrand.brightness || 100}%)`
              }}
            />
          )}
        </div>
      )}
      
      {/* Brand Top Header Bar with Back Navigation & Translate Button */}
      <header className="w-full max-w-md mx-auto pt-3.5 px-4 flex flex-col items-center pb-2 z-10 relative">
        <div className="w-full flex items-center justify-between gap-2 mb-2">
          {/* Back Navigation Button */}
          <button
            type="button"
            id="back-navigation-button"
            onClick={handleBackNavigation}
            aria-label="Back to Store / All Offers"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 text-xs font-semibold backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[11px] font-medium">Home</span>
          </button>

          {/* Logo and Brand Name */}
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full overflow-hidden bg-white border-2 flex items-center justify-center shadow-md flex-shrink-0"
              style={{ borderColor: activeAccentColor }}
            >
              {activeLogoUrl ? (
                <img 
                  src={activeLogoUrl} 
                  alt={activeBrandName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-stone-900 text-amber-300 flex items-center justify-center text-xs font-bold font-serif">
                  DC
                </div>
              )}
            </div>
            <h1 className="text-xs sm:text-sm font-bold tracking-wider uppercase font-serif drop-shadow-sm truncate max-w-[130px]" style={{ color: activeAccentColor }}>
              {activeBrandName}
            </h1>
          </div>

          {/* Translate Button */}
          <LanguageSelector
            variant="header"
            themePrimaryColor={activePrimaryColor}
            themeAccentColor={activeAccentColor}
          />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/40 border border-white/20 text-white text-[10px] font-medium tracking-wide shadow-sm backdrop-blur-sm">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{t('exclusive_privilege')}</span>
        </div>
      </header>

      {/* Main Campaign Content */}
      <main className="w-full max-w-md mx-auto px-4 pt-1 flex flex-col items-center z-10 relative">
        {/* Campaign Banner image if present */}
        {design.bannerImageUrl && (
          <div className="w-full h-28 sm:h-32 rounded-2xl overflow-hidden mb-3 relative shadow-md border border-white/20">
            <img 
              src={design.bannerImageUrl} 
              alt={campaign.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {campaign.type === 'spin_wheel' ? 'Spin to Win' : 'VIP Reward'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-snug font-serif">
                {design.headline || campaign.name}
              </h2>
            </div>
          </div>
        )}

        {!design.bannerImageUrl && (
          <div className="text-center mb-3 mt-1 bg-black/30 backdrop-blur-md p-3.5 rounded-2xl shadow-sm border border-white/15 w-full">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-serif mb-1" style={{ color: activeAccentColor }}>
              {design.headline || campaign.name}
            </h2>
            <p className="text-xs text-white/90 max-w-xs mx-auto leading-relaxed font-medium">
              {design.supportingText || campaign.description}
            </p>
          </div>
        )}

        {/* Step 1: Customer Identity Form (If not verified yet) */}
        {!isVerified && !wonRecord && (
          <div className="w-full bg-white rounded-3xl p-5 shadow-2xl border border-stone-200/80 mb-4 transition-all text-stone-900 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900">{t('member_verification')}</h3>
                <p className="text-[11px] text-stone-500">{t('check_eligibility_sub')}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4 text-amber-700" />
              </div>
            </div>

            <form onSubmit={handleVerifyIdentity} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('full_name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="customer-name-input"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t('enter_name')}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all text-stone-900 font-medium"
                    required={campaign.rules.requireName}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t('phone_number')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    id="customer-phone-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={t('enter_phone')}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all text-stone-900 font-medium"
                    required={campaign.rules.requirePhone}
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{t('used_for_verification')}</span>
                </p>
              </div>

              {/* Error Alert */}
              {(errorMessage || (eligibility && !eligibility.isEligible)) && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{errorMessage || eligibility?.reason}</p>
                    {eligibility?.previousParticipations && eligibility.previousParticipations.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const past = eligibility.previousParticipations![0];
                          setWonRecord(past);
                          const prizeObj = campaign.prizes.find(p => p.id === past.prizeId);
                          if (prizeObj) setWonPrize(prizeObj);
                          setShowResultModal(true);
                        }}
                        className="mt-2 text-[11px] text-amber-700 underline font-medium block"
                      >
                        {t('view_previous_reward')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Fill Test Badges */}
              <div className="pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                  Demo Fast-Fill:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemoCustomer('Amit Kumar', `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`)}
                    className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-[10px] rounded-lg font-medium text-stone-700 transition-colors cursor-pointer"
                  >
                    ✨ New Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCustomer('Vikram Singh', '+91 9310581186')}
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-[10px] rounded-lg font-medium text-amber-800 transition-colors cursor-pointer"
                  >
                    🔄 Already Spun (Test Limit)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="verify-eligibility-button"
                disabled={isCheckingEligibility}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-75"
                style={{ backgroundColor: activeAccentColor || '#FDD145', color: activePrimaryColor || '#861730' }}
              >
                {isCheckingEligibility ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('verifying_privileges')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('unlock_wheel')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Verified User Banner */}
        {isVerified && !wonRecord && (
          <div className="w-full bg-emerald-950/60 backdrop-blur-md border border-emerald-400/40 rounded-2xl px-4 py-2.5 mb-3 flex items-center justify-between animate-fadeIn text-white shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-xs font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {t('welcome_customer')}, {customerName}
                </p>
                <p className="text-[10px] text-emerald-200">
                  {t('spin_unlocked')} ({phoneNumber})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsVerified(false);
                setEligibility(null);
              }}
              className="text-[10px] text-amber-300 underline font-semibold cursor-pointer"
            >
              {t('change')}
            </button>
          </div>
        )}

        {/* The Spin Wheel Component */}
        <div className="w-full flex flex-col items-center">
          <SpinWheel
            prizes={campaign.prizes}
            design={{
              ...design,
              brandName: activeBrandName,
              primaryColor: activePrimaryColor,
              accentColor: activeAccentColor,
              wheelBorderColor: activeAccentColor,
              wheelIndicatorColor: activeAccentColor,
              wheelCenterColor: activePrimaryColor,
            }}
            targetPrizeIndex={targetPrizeIndex}
            isSpinning={isSpinning}
            onSpinComplete={handleSpinComplete}
            disabled={!isVerified}
          />

          {/* Action Spin Button */}
          <div className="w-full mt-3 flex flex-col items-center">
            {isVerified ? (
              <button
                type="button"
                id="spin-the-wheel-cta-button"
                onClick={handleStartSpin}
                disabled={isSpinning}
                className="w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base tracking-wide uppercase shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  backgroundColor: activeAccentColor || '#FDD145',
                  color: activePrimaryColor || '#861730',
                  boxShadow: '0 8px 25px -4px rgba(253, 209, 69, 0.5)',
                }}
              >
                {isSpinning ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>{t('spinning_wheel')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{t('spin_button_text')}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('customer-name-input');
                  if (input) input.focus();
                }}
                className="w-full py-3 px-6 rounded-2xl font-semibold text-xs sm:text-sm bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors flex items-center justify-center gap-2 border border-white/20 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>{t('enter_details_first')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Terms & Conditions Accordion */}
        <div className="w-full mt-6 pt-3 border-t border-white/20">
          <button
            type="button"
            onClick={() => setShowTerms(!showTerms)}
            className="w-full flex items-center justify-between text-xs text-white/80 hover:text-white transition-colors py-1 cursor-pointer"
          >
            <span className="font-semibold">{t('terms_privileges')}</span>
            {showTerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showTerms && (
            <div className="mt-2 text-[11px] text-stone-800 leading-relaxed bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-white/40 animate-fadeIn space-y-1.5 shadow-lg">
              <p>• {design.termsAndConditions || 'Valid on selected apparel and fashion wear. One prize per unique customer.'}</p>
              <p>• {design.redemptionInstructions || 'Present the winning code at billing counter at Delhi Collection, Bharwara.'}</p>
              <p>• Campaign active until {new Date(campaign.endDate).toLocaleDateString()}.</p>
            </div>
          )}
        </div>

        {/* Unified Social Media Links Footer */}
        <div className="w-full mt-5 pt-3 border-t border-white/20 flex flex-col items-center justify-center gap-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-300 bg-black/40 px-3 py-0.5 rounded-full border border-amber-400/20 backdrop-blur-sm">
            {t('connect_with_us')}
          </span>

          <div className="flex items-center justify-center gap-2.5 bg-black/30 p-2 rounded-2xl backdrop-blur-md border border-white/15 shadow-lg">
            {globalBrand.instagramUrl && (
              <a 
                href={globalBrand.instagramUrl} 
                target="_blank" 
                rel="noreferrer" 
                title="Instagram"
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}

            {(globalBrand.whatsappUrl || globalBrand.whatsappNumber) && (
              <a 
                href={globalBrand.whatsappUrl || `https://wa.me/${globalBrand.whatsappNumber}`} 
                target="_blank" 
                rel="noreferrer" 
                title="WhatsApp"
                className="w-9 h-9 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}

            {globalBrand.facebookUrl && (
              <a 
                href={globalBrand.facebookUrl} 
                target="_blank" 
                rel="noreferrer" 
                title="Facebook"
                className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}

            {globalBrand.googleMapsUrl && (
              <a 
                href={globalBrand.googleMapsUrl} 
                target="_blank" 
                rel="noreferrer" 
                title="Store Location"
                className="w-9 h-9 rounded-xl bg-stone-100 text-red-600 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <MapPin className="w-4 h-4" />
              </a>
            )}

            {globalBrand.youtubeUrl && (
              <a 
                href={globalBrand.youtubeUrl} 
                target="_blank" 
                rel="noreferrer" 
                title="YouTube"
                className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}

            {globalBrand.storeUrl && (
              <a 
                href={globalBrand.storeUrl} 
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
      </main>

      {/* Result Modal / Prize Reveal Overlay */}
      {showResultModal && wonPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn text-stone-900">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-amber-200/80 text-center overflow-hidden animate-scaleUp">
            {/* Top decorative badge with Prize SVG icon / uploaded image in clean appealing shape */}
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/70 border-2 border-amber-400 flex items-center justify-center p-3 shadow-md shadow-amber-900/10 mb-3.5 relative">
              <PrizeIcon 
                iconName={wonPrize.iconName} 
                label={wonPrize.label}
                imageUrl={wonPrize.imageUrl} 
                className="w-10 h-10 text-amber-600 drop-shadow-xs" 
                containerClassName="w-full h-full flex items-center justify-center"
              />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
              {wonPrize.isWinning ? t('privilege_unlocked') : t('thank_you')}
            </span>

            <h3 className="text-2xl font-bold font-serif text-stone-900 mt-1 mb-1">
              {wonPrize.label}
            </h3>

            {wonPrize.subLabel && (
              <p className="text-xs text-stone-500 font-medium mb-3">
                {wonPrize.subLabel}
              </p>
            )}

            {/* Promo Code Box */}
            {wonPrize.isWinning && wonPrize.actionType !== 'try_again' && (
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 mb-3.5 shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">
                  {t('your_exclusive_promo')}
                </p>
                <div className="flex items-center justify-between bg-white border border-dashed border-amber-400 rounded-xl px-3.5 py-2.5">
                  <span className="font-mono font-bold text-base text-stone-900 tracking-wider">
                    {wonPrize.promoCode || wonRecord?.promoCode || 'DELHIVIP'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(wonPrize.promoCode || wonRecord?.promoCode || 'DELHIVIP')}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t('copy')}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 mt-2">
                  {t('redemption_note')}
                </p>
              </div>
            )}

            {/* Try Again specific message */}
            {wonPrize.actionType === 'try_again' && (
              <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-200 mb-3.5 text-xs text-amber-800 leading-relaxed font-semibold">
                {t('try_again_note')}
              </div>
            )}

            {/* Non-winning note */}
            {!wonPrize.isWinning && wonPrize.actionType !== 'try_again' && (
              <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 mb-3.5 text-xs text-stone-600 leading-relaxed">
                {t('lose_note')}
              </div>
            )}

            {/* Active Share Toast Feedback */}
            {shareToast && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-3 py-2 mb-3 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                <span className="text-[11px] leading-tight">{shareToast}</span>
              </div>
            )}

            {/* Social Share Buttons for Direct WhatsApp & Instagram Story Sharing */}
            {wonPrize.isWinning && (
              <div className="mb-3.5 w-full">
                <div className="flex gap-2">
                  {/* WhatsApp Story Button */}
                  <button
                    type="button"
                    id="whatsapp-story-share-button"
                    onClick={handleWhatsAppStoryShare}
                    disabled={isSharingWhatsApp}
                    className="flex-1 py-2.5 px-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all shadow-md shadow-green-900/15 active:scale-98 cursor-pointer disabled:opacity-75"
                  >
                    <div className="flex items-center gap-1.5">
                      {isSharingWhatsApp ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-white" />
                      )}
                      <span>{t('share_whatsapp_story')}</span>
                    </div>
                    <span className="text-[9.5px] font-medium text-emerald-100/90">
                      1-Tap Status
                    </span>
                  </button>

                  {/* Instagram Story Button */}
                  <button
                    type="button"
                    id="instagram-story-share-button"
                    onClick={handleInstagramStoryShare}
                    disabled={isSharingInstagram}
                    className="flex-1 py-2.5 px-2.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all shadow-md shadow-pink-900/15 active:scale-98 cursor-pointer disabled:opacity-75"
                  >
                    <div className="flex items-center gap-1.5">
                      {isSharingInstagram ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Instagram className="w-4 h-4 text-white" />
                      )}
                      <span>{t('share_instagram_story')}</span>
                    </div>
                    <span className="text-[9.5px] font-medium text-rose-100/90">
                      Add to Story
                    </span>
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 font-medium mt-1.5 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{t('share_story_hint')}</span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <a
                href={globalBrand.googleMapsUrl || globalBrand.storeUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 bg-stone-900 hover:bg-black text-white rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
              >
                <span>{t('shop_now')}</span>
                <ExternalLink className="w-4 h-4 text-amber-400" />
              </a>

              <button
                type="button"
                id="modal-explore-more-button"
                onClick={() => {
                  setShowResultModal(false);
                  handleBackNavigation();
                }}
                className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Explore All Offers & Home</span>
              </button>

              <button
                type="button"
                onClick={() => { 
                  setShowResultModal(false); 
                }}
                className="w-full py-2 px-4 text-stone-500 hover:text-stone-800 text-xs font-medium transition-colors cursor-pointer"
              >
                {t('close_window')}
              </button>
            </div>

            {/* Participant summary footer */}
            {wonRecord && (
              <p className="text-[9px] text-stone-400 mt-2.5 border-t border-stone-100 pt-2">
                {t('registered_to')} {wonRecord.customerName} • {t('spin_number')} #{wonRecord.spinNumber}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Quick Navigation Bar */}
      <div className="sticky bottom-3 z-30 w-full max-w-md mx-auto px-4 pointer-events-auto">
        <div className="bg-stone-900/95 backdrop-blur-md text-white border border-stone-700/80 rounded-full py-1 px-1.5 shadow-2xl flex items-center justify-between text-xs">
          <button
            type="button"
            id="bottom-menu-all-offers"
            onClick={handleBackNavigation}
            className="flex-1 flex items-center justify-center gap-1.5 text-stone-200 hover:text-amber-300 font-semibold px-2 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Return to all campaigns & store home"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap text-[11px] sm:text-xs">All Offers</span>
          </button>

          <div className="h-4 w-px bg-stone-700/80 shrink-0" />

          {(globalBrand.whatsappUrl || globalBrand.whatsappNumber) && (
            <>
              <a
                id="bottom-menu-whatsapp"
                href={globalBrand.whatsappUrl || `https://wa.me/${globalBrand.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap text-[11px] sm:text-xs">Chat</span>
              </a>
              <div className="h-4 w-px bg-stone-700/80 shrink-0" />
            </>
          )}

          {globalBrand.storeUrl && (
            <>
              <a
                id="bottom-menu-website"
                href={globalBrand.storeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 text-amber-300 hover:text-amber-200 font-medium px-2 py-1.5 rounded-full hover:bg-white/10 transition-colors"
                title="Visit Web"
              >
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap text-[11px] sm:text-xs">Web</span>
              </a>
              <div className="h-4 w-px bg-stone-700/80 shrink-0" />
            </>
          )}

          {globalBrand.googleMapsUrl && (
            <a
              id="bottom-menu-shop-location"
              href={globalBrand.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-stone-200 hover:text-amber-300 font-medium px-2 py-1.5 rounded-full hover:bg-white/10 transition-colors"
              title="Store Location (Bharwara)"
            >
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span className="whitespace-nowrap text-[11px] sm:text-xs">Shop</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
