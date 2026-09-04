import React from 'react';
import { 
  Sparkles, 
  Gift, 
  Crown, 
  Percent, 
  Truck, 
  HeartHandshake, 
  ShoppingBag, 
  Tag, 
  Star, 
  Award, 
  Gem, 
  Ticket, 
  Flame, 
  Trophy, 
  Coins, 
  Zap, 
  Heart, 
  Watch, 
  Shirt, 
  Scissors, 
  PartyPopper, 
  Smile, 
  BadgePercent, 
  DollarSign, 
  Box, 
  CheckCircle2, 
  Package,
  RotateCcw,
  User,
  Medal,
  Coffee,
  ShoppingCart
} from 'lucide-react';

export const PRIZE_ICON_OPTIONS: { name: string; label: string; icon: React.FC<{ className?: string }> }[] = [
  { name: 'Sparkles', label: 'Sparkles ✨', icon: Sparkles },
  { name: 'Shirt', label: 'Fashion / Shirt / Kurta 👔', icon: Shirt },
  { name: 'Watch', label: 'Luxury Watch ⌚', icon: Watch },
  { name: 'Gift', label: 'Gift Box 🎁', icon: Gift },
  { name: 'Crown', label: 'Crown 👑', icon: Crown },
  { name: 'Percent', label: 'Discount %', icon: Percent },
  { name: 'BadgePercent', label: 'Badge % 🏷️', icon: BadgePercent },
  { name: 'ShoppingBag', label: 'Shopping Bag 🛍️', icon: ShoppingBag },
  { name: 'Tag', label: 'Price Tag 🔖', icon: Tag },
  { name: 'Gem', label: 'Luxury Gem 💎', icon: Gem },
  { name: 'Trophy', label: 'Trophy 🏆', icon: Trophy },
  { name: 'Medal', label: 'Medal 🥇', icon: Medal },
  { name: 'Truck', label: 'Free Delivery 🚚', icon: Truck },
  { name: 'HeartHandshake', label: 'Privilege Club 🤝', icon: HeartHandshake },
  { name: 'Star', label: 'Golden Star ⭐', icon: Star },
  { name: 'Award', label: 'Award Ribbon 🎖️', icon: Award },
  { name: 'Ticket', label: 'Voucher Ticket 🎟️', icon: Ticket },
  { name: 'Coins', label: 'Cashback / Coins 🪙', icon: Coins },
  { name: 'Flame', label: 'Trending Hot 🔥', icon: Flame },
  { name: 'Scissors', label: 'Tailoring / Cut ✂️', icon: Scissors },
  { name: 'PartyPopper', label: 'Celebration 🎉', icon: PartyPopper },
  { name: 'Zap', label: 'Flash Deal ⚡', icon: Zap },
  { name: 'Package', label: 'Exclusive Box 📦', icon: Package },
  { name: 'RotateCcw', label: 'Try Again / Rotate 🔄', icon: RotateCcw },
];

export interface PrizeIconProps {
  iconName?: string;
  label?: string;
  imageUrl?: string;
  className?: string;
  containerClassName?: string;
  altText?: string;
}

export const PrizeIcon: React.FC<PrizeIconProps> = ({
  iconName = '',
  label = '',
  imageUrl,
  className = 'w-6 h-6 text-amber-600',
  containerClassName = '',
  altText = 'Prize',
}) => {
  const [imageFailed, setImageFailed] = React.useState(false);

  // If custom uploaded image / SVG is provided and hasn't errored out
  if (imageUrl && imageUrl.trim() && !imageFailed) {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center ${containerClassName}`}>
        <img
          src={imageUrl}
          alt={altText}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-contain drop-shadow-sm"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Look up corresponding SVG icon based on iconName or infer from label
  const rawKey = (iconName || '').toLowerCase().trim();
  const labelKey = (label || '').toLowerCase().trim();

  let IconComponent: React.FC<{ className?: string }> = Sparkles;

  if (
    rawKey === 'shirt' || 
    rawKey === 'clothing' || 
    rawKey === 'kurta' || 
    rawKey === 't-shirt' || 
    rawKey === 'tshirt' || 
    labelKey.includes('shirt') || 
    labelKey.includes('kurta') || 
    labelKey.includes('cloth') || 
    labelKey.includes('pant') || 
    labelKey.includes('suit') || 
    labelKey.includes('hoodie') ||
    labelKey.includes('wear')
  ) {
    IconComponent = Shirt;
  } else if (rawKey === 'watch' || labelKey.includes('watch') || labelKey.includes('clock')) {
    IconComponent = Watch;
  } else if (rawKey === 'gift' || labelKey.includes('gift') || labelKey.includes('hamper')) {
    IconComponent = Gift;
  } else if (rawKey === 'crown' || labelKey.includes('crown') || labelKey.includes('vip') || labelKey.includes('royal')) {
    IconComponent = Crown;
  } else if (rawKey === 'percent' || rawKey === 'percentage' || labelKey.includes('%') || labelKey.includes('percent') || labelKey.includes('off') || labelKey.includes('discount')) {
    IconComponent = Percent;
  } else if (rawKey === 'badgepercent') {
    IconComponent = BadgePercent;
  } else if (rawKey === 'shoppingbag' || rawKey === 'bag' || labelKey.includes('bag') || labelKey.includes('shopping')) {
    IconComponent = ShoppingBag;
  } else if (rawKey === 'shoppingcart' || rawKey === 'cart') {
    IconComponent = ShoppingCart;
  } else if (rawKey === 'tag' || labelKey.includes('tag')) {
    IconComponent = Tag;
  } else if (rawKey === 'gem' || rawKey === 'diamond' || labelKey.includes('gem') || labelKey.includes('diamond')) {
    IconComponent = Gem;
  } else if (rawKey === 'trophy' || labelKey.includes('trophy')) {
    IconComponent = Trophy;
  } else if (rawKey === 'medal' || labelKey.includes('medal')) {
    IconComponent = Medal;
  } else if (rawKey === 'truck' || rawKey === 'delivery' || rawKey === 'shipping' || labelKey.includes('shipping') || labelKey.includes('delivery')) {
    IconComponent = Truck;
  } else if (rawKey === 'hearthandshake' || rawKey === 'handshake') {
    IconComponent = HeartHandshake;
  } else if (rawKey === 'star' || labelKey.includes('star')) {
    IconComponent = Star;
  } else if (rawKey === 'award' || labelKey.includes('award') || labelKey.includes('ribbon')) {
    IconComponent = Award;
  } else if (rawKey === 'ticket' || rawKey === 'voucher' || labelKey.includes('voucher') || labelKey.includes('coupon') || labelKey.includes('ticket')) {
    IconComponent = Ticket;
  } else if (rawKey === 'coins' || rawKey === 'cash' || labelKey.includes('coin') || labelKey.includes('cash') || labelKey.includes('₹') || labelKey.includes('$') || labelKey.includes('cashback')) {
    IconComponent = Coins;
  } else if (rawKey === 'flame' || rawKey === 'fire' || labelKey.includes('hot') || labelKey.includes('flame')) {
    IconComponent = Flame;
  } else if (rawKey === 'scissors' || labelKey.includes('cut') || labelKey.includes('tailor')) {
    IconComponent = Scissors;
  } else if (rawKey === 'partypopper' || rawKey === 'celebrate' || labelKey.includes('party') || labelKey.includes('celebration')) {
    IconComponent = PartyPopper;
  } else if (rawKey === 'zap' || labelKey.includes('flash') || labelKey.includes('zap') || labelKey.includes('instant')) {
    IconComponent = Zap;
  } else if (rawKey === 'package' || rawKey === 'box' || labelKey.includes('box') || labelKey.includes('pack')) {
    IconComponent = Package;
  } else if (rawKey === 'heart' || labelKey.includes('love') || labelKey.includes('heart')) {
    IconComponent = Heart;
  } else if (rawKey === 'smile' || labelKey.includes('smile') || labelKey.includes('happy')) {
    IconComponent = Smile;
  } else if (rawKey === 'dollarsign') {
    IconComponent = DollarSign;
  } else if (rawKey === 'rotateccw' || rawKey === 'rotate_ccw' || rawKey === 'tryagain' || rawKey === 'repeat' || rawKey === 'refresh' || labelKey.includes('again') || labelKey.includes('try') || labelKey.includes('spin again')) {
    IconComponent = RotateCcw;
  } else if (rawKey === 'user' || rawKey === 'person') {
    IconComponent = User;
  } else if (rawKey === 'coffee') {
    IconComponent = Coffee;
  } else if (labelKey.includes('perfume') || labelKey.includes('scent') || labelKey.includes('fragrance') || rawKey === 'sparkles') {
    IconComponent = Sparkles;
  } else {
    IconComponent = Sparkles;
  }

  return (
    <div className={`flex items-center justify-center ${containerClassName}`}>
      <IconComponent className={className} />
    </div>
  );
};
