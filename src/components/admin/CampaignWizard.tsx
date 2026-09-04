import React, { useState } from 'react';
import { Campaign, CampaignType, CampaignStatus, PrizeOption, CampaignDesign, ParticipationRules, SocialLinks } from '../../types';
import { CustomerCampaignView } from '../campaign/CustomerCampaignView';
import { ImageUploadField } from '../common/ImageUploadField';
import { PrizeIcon, PRIZE_ICON_OPTIONS } from '../common/PrizeIcon';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Sparkles, 
  Sliders, 
  Layers, 
  Palette, 
  Eye, 
  Save, 
  Calendar, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
  CheckCircle2,
  Gift,
  RotateCcw
} from 'lucide-react';

interface CampaignWizardProps {
  initialCampaign?: Campaign | null;
  onSave: (campaign: Campaign) => void;
  onCancel: () => void;
}

const DEFAULT_NEW_CAMPAIGN: Campaign = {
  id: '',
  name: 'Summer Silk Runway Spin & Win',
  slug: 'summer-silk-runway',
  type: 'spin_wheel',
  description: 'Limited-edition summer promotion offering couture vouchers and silk accessories.',
  status: 'active',
  startDate: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T23:59:59.000Z',
  rules: {
    requireName: true,
    requirePhone: true,
    maxParticipationsPerPhone: 1,
    maxTotalParticipants: 1000,
    maxTotalSpins: 1000,
    minimumAge: 18,
  },
  design: {
    brandName: 'Delhi Collection',
    logoUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=160&auto=format&fit=crop&q=80',
    headline: 'Runway Exclusive Privileges',
    supportingText: 'Spin the couture wheel to unlock private discounts for the new fashion collection.',
    bannerImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
    themeStyle: 'champagne_gold',
    primaryColor: '#1c1917',
    accentColor: '#d97706',
    backgroundColor: '#fbfaf8',
    surfaceColor: '#ffffff',
    textColor: '#1c1917',
    fontFamily: 'serif',
    wheelBorderColor: '#d97706',
    wheelCenterColor: '#1c1917',
    wheelIndicatorColor: '#d97706',
    buttonText: 'Spin the Atelier Wheel',
    resultHeadline: 'Privilege Unlocked',
    resultSubtext: 'Your boutique promo code is ready to use online and in-store.',
    termsAndConditions: 'Valid on selected regular-priced apparel. 1 voucher per customer.',
    redemptionInstructions: 'Enter code at checkout on delhicollection.com',
    storeUrl: 'https://delhicollection.com',
  },
  prizes: [
    {
      id: 'prz-w-1',
      label: '25% OFF',
      subLabel: 'Silk & Couture',
      iconName: 'Sparkles',
      discountType: 'percentage',
      discountValue: '25%',
      promoCode: 'SILK25',
      probability: 20,
      totalStock: 50,
      claimedCount: 0,
      color: '#1c1917',
      textColor: '#fef3c7',
      isWinning: true,
      actionType: 'win',
    },
    {
      id: 'prz-w-2',
      label: '$50 GIFT',
      subLabel: 'Over $200',
      iconName: 'Gift',
      discountType: 'fixed_amount',
      discountValue: '$50',
      promoCode: 'GIFT50',
      probability: 15,
      totalStock: 30,
      claimedCount: 0,
      color: '#d97706',
      textColor: '#ffffff',
      isWinning: true,
      actionType: 'win',
    },
    {
      id: 'prz-w-3',
      label: '15% OFF',
      subLabel: 'Entire Order',
      iconName: 'Percent',
      discountType: 'percentage',
      discountValue: '15%',
      promoCode: 'SAVE15',
      probability: 35,
      totalStock: 200,
      claimedCount: 0,
      color: '#b45309',
      textColor: '#ffffff',
      isWinning: true,
      actionType: 'win',
    },
    {
      id: 'prz-w-4',
      label: 'FREE SHIPPING',
      subLabel: 'Express Worldwide',
      iconName: 'Truck',
      discountType: 'free_shipping',
      discountValue: 'Free Shipping',
      promoCode: 'EXPRESSLUXE',
      probability: 20,
      totalStock: 150,
      claimedCount: 0,
      color: '#44403c',
      textColor: '#ffffff',
      isWinning: true,
      actionType: 'win',
    },
    {
      id: 'prz-w-5',
      label: 'NEXT TIME',
      subLabel: 'VIP Early Access',
      iconName: 'HeartHandshake',
      discountType: 'no_prize',
      discountValue: 'None',
      promoCode: 'VIPACCESS',
      probability: 10,
      totalStock: 999,
      claimedCount: 0,
      color: '#78716c',
      textColor: '#ffffff',
      isWinning: false,
      actionType: 'lose',
    },
  ],
  totalSpins: 0,
  totalParticipants: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const FASHION_BANNER_PRESETS = [
  {
    name: 'Champagne Couture & Silk',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Noir Editorial & Trench',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Riviera Resort & Linen',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Minimalist Autumn Knitwear',
    url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80',
  },
];

export const CampaignWizard: React.FC<CampaignWizardProps> = ({
  initialCampaign,
  onSave,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const [campaignData, setCampaignData] = useState<Campaign>(() => {
    if (initialCampaign) {
      return JSON.parse(JSON.stringify(initialCampaign));
    }
    const newId = 'camp-' + Date.now().toString(36);
    return {
      ...DEFAULT_NEW_CAMPAIGN,
      id: newId,
    };
  });

  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  const updateBasic = (field: string, val: any) => {
    setCampaignData(prev => ({ ...prev, [field]: val }));
  };

  const updateRules = (field: keyof ParticipationRules, val: any) => {
    setCampaignData(prev => ({
      ...prev,
      rules: { ...prev.rules, [field]: val },
    }));
  };

  const updateDesign = (field: keyof CampaignDesign, val: any) => {
    setCampaignData(prev => ({
      ...prev,
      design: { ...prev.design, [field]: val },
    }));
  };

  const updateSocialLink = (platform: keyof SocialLinks, val: string) => {
    setCampaignData(prev => ({
      ...prev,
      design: {
        ...prev.design,
        socialLinks: {
          ...(prev.design.socialLinks || {}),
          [platform]: val
        }
      }
    }));
  };

  const updatePrize = (index: number, field: keyof PrizeOption, val: any) => {
    setCampaignData(prev => {
      const prizes = [...prev.prizes];
      prizes[index] = { ...prizes[index], [field]: val };
      return { ...prev, prizes };
    });
  };

  const addPrize = () => {
    if (campaignData.prizes.length >= 10) return;
    const newPrize: PrizeOption = {
      id: 'prz-new-' + Date.now().toString(36),
      label: '10% OFF',
      subLabel: 'Special Privilege',
      iconName: 'Sparkles',
      discountType: 'percentage',
      discountValue: '10%',
      promoCode: 'SPECIAL10',
      probability: 10,
      totalStock: 100,
      claimedCount: 0,
      color: '#3f3f46',
      textColor: '#ffffff',
      isWinning: true,
      actionType: 'win',
    };
    setCampaignData(prev => ({
      ...prev,
      prizes: [...prev.prizes, newPrize],
    }));
  };

  const removePrize = (index: number) => {
    if (campaignData.prizes.length <= 2) return;
    setCampaignData(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index),
    }));
  };

  const balanceProbabilities = () => {
    const count = campaignData.prizes.length;
    const equalShare = Math.floor(100 / count);
    const remainder = 100 % count;

    setCampaignData(prev => ({
      ...prev,
      prizes: prev.prizes.map((p, i) => ({
        ...p,
        probability: equalShare + (i === 0 ? remainder : 0),
      })),
    }));
  };

  const totalProbability = campaignData.prizes.reduce((sum, p) => sum + (Number(p.probability) || 0), 0);

  const handleFinish = (publishNow: boolean) => {
    const finalStatus: CampaignStatus = publishNow ? 'active' : (campaignData.status || 'draft');
    const finalCamp: Campaign = {
      ...campaignData,
      status: finalStatus,
      updatedAt: new Date().toISOString(),
    };
    onSave(finalCamp);
  };

  const stepsList = [
    { num: 1, title: 'Basic Info', icon: Sliders },
    { num: 2, title: 'Rules & Limits', icon: Layers },
    { num: 3, title: 'Prizes & Wheel', icon: Gift },
    { num: 4, title: 'Design & Style', icon: Palette },
    { num: 5, title: 'Preview & Publish', icon: Eye },
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
      {/* Wizard Top Header */}
      <div className="px-6 py-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/60">
        <div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-700">
            {initialCampaign ? 'Edit Campaign Studio' : 'Campaign Creation Studio'}
          </span>
          <h2 className="text-xl font-bold font-serif text-stone-900">
            {campaignData.name || 'Untitled Campaign'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-200/70 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleFinish(false)}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Progress Steps Indicator */}
      <div className="px-6 py-3.5 bg-stone-100/70 border-b border-stone-200 overflow-x-auto">
        <div className="flex items-center min-w-max gap-2 sm:gap-4 justify-between max-w-4xl mx-auto">
          {stepsList.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = step === s.num;
            const isCompleted = step > s.num;

            return (
              <div key={s.num} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-stone-900 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-amber-100/70 text-amber-900 hover:bg-amber-100'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent ? 'bg-amber-400 text-stone-900' : isCompleted ? 'bg-amber-600 text-white' : 'bg-stone-300 text-stone-700'
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  <span>{s.title}</span>
                </button>
                {idx < stepsList.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Body Content */}
      <div className="p-6 max-w-4xl mx-auto w-full min-h-[480px]">
        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold font-serif text-stone-900">Campaign Basic Information</h3>
              <p className="text-xs text-stone-500">Define the marketing campaign title, type, and active promotion dates.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={campaignData.name}
                  onChange={(e) => updateBasic('name', e.target.value)}
                  placeholder="e.g. Diwali Luxe Spin & Win"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Campaign Type
                </label>
                <select
                  value={campaignData.type}
                  onChange={(e) => updateBasic('type', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="spin_wheel">🎡 Spin & Win Wheel (Active)</option>
                  <option value="scratch_card">🎫 Scratch Card (Extensible)</option>
                  <option value="mystery_box">🎁 Mystery Box (Extensible)</option>
                  <option value="lucky_draw">✨ Lucky Draw (Extensible)</option>
                  <option value="coupon_reveal">🏷️ Coupon Reveal (Extensible)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Initial Status
                </label>
                <select
                  value={campaignData.status}
                  onChange={(e) => updateBasic('status', e.target.value as CampaignStatus)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="active">Active (Open to customers)</option>
                  <option value="draft">Draft (Private preview only)</option>
                  <option value="scheduled">Scheduled (Opens on start date)</option>
                  <option value="paused">Paused (Temporarily closed)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Internal Description & Notes
                </label>
                <textarea
                  value={campaignData.description}
                  onChange={(e) => updateBasic('description', e.target.value)}
                  rows={2}
                  placeholder="Describe target customer segment, promotional goal, or occasion..."
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Start Date & Time
                </label>
                <input
                  type="date"
                  value={campaignData.startDate.split('T')[0]}
                  onChange={(e) => updateBasic('startDate', new Date(e.target.value).toISOString())}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  End Date & Time
                </label>
                <input
                  type="date"
                  value={campaignData.endDate.split('T')[0]}
                  onChange={(e) => updateBasic('endDate', new Date(e.target.value + 'T23:59:59.000Z').toISOString())}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Participation Rules */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold font-serif text-stone-900">Participation & Verification Rules</h3>
              <p className="text-xs text-stone-500">
                Configure participant identity requirements and anti-abuse limits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Identity requirements */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Required Customer Fields
                </h4>
                
                <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200 cursor-pointer">
                  <span className="text-xs font-medium text-stone-800">Require Customer Full Name</span>
                  <input
                    type="checkbox"
                    checked={campaignData.rules.requireName}
                    onChange={(e) => updateRules('requireName', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200 cursor-pointer">
                  <div>
                    <span className="text-xs font-medium text-stone-800 block">Require Mobile Phone Number</span>
                    <span className="text-[10px] text-stone-400">Primary customer key for 1-spin limit</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={campaignData.rules.requirePhone}
                    onChange={(e) => updateRules('requirePhone', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                </label>
              </div>

              {/* Limits and Cap enforcement */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Anti-Abuse Limits
                </h4>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Max Spins / Participations Per Phone Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={campaignData.rules.maxParticipationsPerPhone}
                    onChange={(e) => updateRules('maxParticipationsPerPhone', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Default is 1 (prevents page refresh repeat spins).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Campaign Max Total Spins Limit
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="50"
                    value={campaignData.rules.maxTotalSpins}
                    onChange={(e) => updateRules('maxTotalSpins', parseInt(e.target.value) || 1000)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-sm"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Once reached, campaign automatically closes participation.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Configure Prizes & Probabilities */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold font-serif text-stone-900">Wheel Slices & Prizes Configuration</h3>
                <p className="text-xs text-stone-500">
                  Add, customize, and balance prize slices, promo codes, probabilities, and stock limits.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={balanceProbabilities}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Evenly divide 100% across all slices"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Auto-Balance %</span>
                </button>
                <button
                  type="button"
                  onClick={addPrize}
                  disabled={campaignData.prizes.length >= 10}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Slice</span>
                </button>
              </div>
            </div>

            {/* Probability Status Meter */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
              totalProbability === 100 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                {totalProbability === 100 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  Total Probability: <strong>{totalProbability}%</strong> {totalProbability === 100 ? '(Perfect)' : `(Adjust to equal 100%)`}
                </span>
              </div>
              <span className="text-[11px] font-semibold">
                {campaignData.prizes.length} Slices Configured
              </span>
            </div>

            {/* Prize list cards */}
            <div className="space-y-3.5">
              {campaignData.prizes.map((prize, idx) => (
                <div 
                  key={prize.id || idx}
                  className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold font-serif">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-stone-800">
                        {prize.label || `Slice ${idx + 1}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prize.isWinning}
                          onChange={(e) => updatePrize(idx, 'isWinning', e.target.checked)}
                          className="w-3.5 h-3.5 text-amber-600 rounded"
                        />
                        <span>Is Winning Prize</span>
                      </label>
                      {campaignData.prizes.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePrize(idx)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Remove slice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Prize Label *</label>
                      <input
                        type="text"
                        value={prize.label}
                        onChange={(e) => updatePrize(idx, 'label', e.target.value)}
                        placeholder="e.g. 20% OFF"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Sub-label / Category</label>
                      <input
                        type="text"
                        value={prize.subLabel || ''}
                        onChange={(e) => updatePrize(idx, 'subLabel', e.target.value)}
                        placeholder="e.g. Silk Collection"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Promo Code</label>
                      <input
                        type="text"
                        value={prize.promoCode}
                        onChange={(e) => updatePrize(idx, 'promoCode', e.target.value.toUpperCase())}
                        placeholder="SILK20"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Probability (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={prize.probability}
                        onChange={(e) => updatePrize(idx, 'probability', parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold text-amber-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Prize Stock (Cap)</label>
                      <input
                        type="number"
                        min="0"
                        value={prize.totalStock}
                        onChange={(e) => updatePrize(idx, 'totalStock', parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Slice Color</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={prize.color || '#1c1917'}
                          onChange={(e) => updatePrize(idx, 'color', e.target.value)}
                          className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0"
                        />
                        <span className="text-[10px] font-mono text-stone-500">{prize.color}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Discount Type</label>
                      <select
                        value={prize.discountType}
                        onChange={(e) => updatePrize(idx, 'discountType', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                      >
                        <option value="percentage">Percentage %</option>
                        <option value="fixed_amount">Fixed Amount $ / ₹</option>
                        <option value="free_gift">Free Gift 🎁</option>
                        <option value="free_shipping">Free Shipping 🚚</option>
                        <option value="no_prize">No Prize / Next Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Action Type</label>
                      <select
                        value={prize.actionType || 'standard'}
                        onChange={(e) => updatePrize(idx, 'actionType', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                      >
                        <option value="standard">Standard Result</option>
                        <option value="try_again">Try Again (+1 Spin)</option>
                      </select>
                    </div>

                    {/* SVG Icon Selector with Live Preview */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Prize SVG Icon</label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-center flex-shrink-0 shadow-xs">
                          <PrizeIcon iconName={prize.iconName} imageUrl={prize.imageUrl} className="w-4 h-4 text-amber-600" />
                        </div>
                        <select
                          value={prize.iconName}
                          onChange={(e) => updatePrize(idx, 'iconName', e.target.value)}
                          className="flex-1 px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                        >
                          {PRIZE_ICON_OPTIONS.map((opt) => (
                            <option key={opt.name} value={opt.name}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Custom Image / SVG URL for Prize (Optional) */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Custom Image / SVG URL <span className="text-stone-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={prize.imageUrl || ''}
                        onChange={(e) => updatePrize(idx, 'imageUrl', e.target.value)}
                        placeholder="https://... or /image.png"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Design & Style */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold font-serif text-stone-900">Branding & Aesthetic Design</h3>
              <p className="text-xs text-stone-500">
                Customize luxury visuals, promotional imagery, typography, and customer messaging.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={campaignData.design.brandName}
                  onChange={(e) => updateDesign('brandName', e.target.value)}
                  placeholder="e.g. Delhi Collection"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Theme Palette
                </label>
                <select
                  value={campaignData.design.themeStyle}
                  onChange={(e) => {
                    const style = e.target.value as any;
                    updateDesign('themeStyle', style);
                    if (style === 'champagne_gold') {
                      updateDesign('primaryColor', '#1c1917');
                      updateDesign('wheelBorderColor', '#d97706');
                      updateDesign('wheelIndicatorColor', '#d97706');
                      updateDesign('backgroundColor', '#fbfaf8');
                    } else if (style === 'monochrome_luxury') {
                      updateDesign('primaryColor', '#09090b');
                      updateDesign('wheelBorderColor', '#3f3f46');
                      updateDesign('wheelIndicatorColor', '#e4e4e7');
                      updateDesign('backgroundColor', '#09090b');
                    } else if (style === 'terracotta_sunset') {
                      updateDesign('primaryColor', '#9a3412');
                      updateDesign('wheelBorderColor', '#ea580c');
                      updateDesign('wheelIndicatorColor', '#ea580c');
                      updateDesign('backgroundColor', '#fffbeb');
                    }
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                >
                  <option value="champagne_gold">✨ Champagne & Atelier Gold</option>
                  <option value="monochrome_luxury">🖤 Monochrome Noir Luxury</option>
                  <option value="terracotta_sunset">🌅 Terracotta & Tuscan Sunset</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <ImageUploadField
                  label="Campaign Banner Imagery (Top Hero Image)"
                  value={campaignData.design.bannerImageUrl || ''}
                  onChange={(val) => updateDesign('bannerImageUrl', val)}
                  placeholder="Paste URL or upload banner image..."
                  helpText="Recommended: 1200x600px landscape image"
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploadField
                  label="Custom Background Image (Optional, defaults to Delhi Collection background)"
                  value={campaignData.design.backgroundImageUrl || ''}
                  onChange={(val) => updateDesign('backgroundImageUrl', val)}
                  placeholder="Paste URL or upload background image..."
                  helpText="Overrides global store background for this specific campaign"
                />
              </div>

              <div className="sm:col-span-2 border-t border-stone-200 pt-4 mt-2">
                <h4 className="text-sm font-bold text-stone-800 mb-3">Social Media Links (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={campaignData.design.socialLinks?.instagram || ''}
                      onChange={(e) => updateSocialLink('instagram', e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Facebook URL</label>
                    <input
                      type="url"
                      value={campaignData.design.socialLinks?.facebook || ''}
                      onChange={(e) => updateSocialLink('facebook', e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">WhatsApp Chat URL</label>
                    <input
                      type="url"
                      value={campaignData.design.socialLinks?.whatsapp || ''}
                      onChange={(e) => updateSocialLink('whatsapp', e.target.value)}
                      placeholder="https://wa.me/..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">Google Maps URL</label>
                    <input
                      type="url"
                      value={campaignData.design.socialLinks?.googleMaps || ''}
                      onChange={(e) => updateSocialLink('googleMaps', e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 border-t border-stone-200 pt-4 mt-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Headline Text
                </label>
                <input
                  type="text"
                  value={campaignData.design.headline}
                  onChange={(e) => updateDesign('headline', e.target.value)}
                  placeholder="e.g. The Festive Grand Reveal"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Action Button CTA
                </label>
                <input
                  type="text"
                  value={campaignData.design.buttonText}
                  onChange={(e) => updateDesign('buttonText', e.target.value)}
                  placeholder="e.g. Spin the Atelier Wheel"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Supporting Promotional Text
                </label>
                <input
                  type="text"
                  value={campaignData.design.supportingText}
                  onChange={(e) => updateDesign('supportingText', e.target.value)}
                  placeholder="e.g. Spin our couture wheel to unlock privileged discounts."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Redemption & Terms Instructions
                </label>
                <input
                  type="text"
                  value={campaignData.design.redemptionInstructions}
                  onChange={(e) => updateDesign('redemptionInstructions', e.target.value)}
                  placeholder="e.g. Present code at checkout or redeem online at delhicollection.com"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Preview & Publish */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold font-serif text-stone-900">Live Customer Preview</h3>
                <p className="text-xs text-stone-500">
                  Experience your campaign exactly as high-fashion customers will see it on their mobile devices.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    previewDevice === 'mobile' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
                  }`}
                >
                  📱 Mobile Simulator
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    previewDevice === 'desktop' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500'
                  }`}
                >
                  💻 Full View
                </button>
              </div>
            </div>

            {/* Device Container Frame */}
            <div className="flex justify-center p-4 bg-stone-100/60 rounded-3xl border border-stone-200">
              <div className={`transition-all ${
                previewDevice === 'mobile' 
                  ? 'w-[375px] max-w-full rounded-[40px] shadow-2xl border-[10px] border-stone-900 overflow-hidden bg-white min-h-[640px]' 
                  : 'w-full rounded-2xl shadow-md border border-stone-200 bg-white min-h-[500px]'
              }`}>
                <CustomerCampaignView
                  campaign={campaignData}
                  isEmbedPreview={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Navigation */}
      <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between bg-stone-50/70">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => setStep(s => Math.max(1, s - 1))}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-200 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(s => Math.min(5, s + 1))}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: {stepsList[step].title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="publish-campaign-button"
              onClick={() => handleFinish(true)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Publish Campaign Live</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
