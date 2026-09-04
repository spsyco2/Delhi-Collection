export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended';

export type CampaignType = 
  | 'spin_wheel'
  | 'scratch_card'
  | 'mystery_box'
  | 'lucky_draw'
  | 'coupon_reveal'
  | 'quiz_win';

export interface PrizeOption {
  id: string;
  label: string;
  subLabel?: string;
  iconName: string; // lucide icon identifier or emoji
  imageUrl?: string;
  discountType: 'percentage' | 'fixed_amount' | 'free_gift' | 'free_shipping' | 'no_prize' | 'custom';
  actionType: 'win' | 'try_again' | 'lose'; // Special handling for Try Again
  discountValue?: string; // e.g. "25%", "$50", "Silk Scarf"
  promoCode: string;
  probability: number; // percentage (0 - 100)
  totalStock: number; // total available
  claimedCount: number; // claimed so far
  color: string; // section slice background color
  textColor: string; // section slice text color
  isWinning: boolean;
  minSpend?: string;
  terms?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  whatsappNumber?: string;
  googleMaps?: string;
  youtube?: string;
}

export interface BrandSettings {
  brandName: string;
  tagline?: string;
  logoUrl: string;
  backgroundImageUrl: string;
  backgroundColor?: string;
  primaryColor: string;
  accentColor: string;
  // Unified Social Profile Settings
  whatsappNumber: string;
  whatsappUrl?: string;
  instagramUrl: string;
  facebookUrl?: string;
  googleMapsUrl?: string;
  youtubeUrl?: string;
  storeUrl?: string;
  // Advanced background styling
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  blur?: number;
  brightness?: number;
}

export interface CampaignDesign {
  brandName: string;
  logoUrl: string;
  headline: string;
  supportingText: string;
  bannerImageUrl: string;
  backgroundImageUrl?: string; // Optional background image
  socialLinks?: SocialLinks;
  themeStyle: 'monochrome_luxury' | 'terracotta_sunset' | 'emerald_noir' | 'champagne_gold' | 'rose_cashmere';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  fontFamily: 'serif' | 'display' | 'sans';
  wheelBorderColor: string;
  wheelCenterColor: string;
  wheelIndicatorColor: string;
  buttonText: string;
  resultHeadline: string;
  resultSubtext: string;
  termsAndConditions: string;
  redemptionInstructions: string;
  storeUrl: string;
}

export interface ParticipationRules {
  requireName: boolean;
  requirePhone: boolean;
  maxParticipationsPerPhone: number; // 1 = one spin per phone
  maxTotalParticipants: number;
  maxTotalSpins: number;
  allowRepeatAfterDays?: number;
  restrictedPhonePrefixes?: string[];
  minimumAge?: number;
}

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  type: CampaignType;
  description: string;
  status: CampaignStatus;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  rules: ParticipationRules;
  prizes: PrizeOption[];
  design: CampaignDesign;
  totalSpins: number;
  totalParticipants: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantRecord {
  id: string;
  campaignId: string;
  campaignName: string;
  customerName: string;
  phoneNumber: string;
  participatedAt: string; // ISO string
  spinNumber: number;
  prizeId: string;
  prizeLabel: string;
  promoCode: string;
  isWinner: boolean;
  discountValue?: string;
  isRedeemed: boolean;
  redeemedAt?: string;
  ipAddress?: string;
  device?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  reason?: string;
  spinsRemaining: number;
  totalSpinsAllowed: number;
  previousParticipations?: ParticipantRecord[];
  campaignStatus: CampaignStatus;
}

export interface CampaignAnalytics {
  totalParticipants: number;
  totalSpins: number;
  uniquePhones: number;
  winnersCount: number;
  nonWinnersCount: number;
  conversionRate: number; // % who won
  redemptionCount: number;
  redemptionRate: number;
  remainingPrizesCount: number;
  prizeDistribution: {
    prizeId: string;
    label: string;
    claimed: number;
    totalStock: number;
    remaining: number;
    percentageOfWins: number;
  }[];
  timeline: {
    date: string;
    spins: number;
    uniqueParticipants: number;
  }[];
}
