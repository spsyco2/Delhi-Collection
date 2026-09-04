/**
 * Utility for generating high-resolution 9:16 Story Cards (Instagram & WhatsApp Status)
 * and triggering direct 1-2 click sharing via Web Share API, WhatsApp URL schemes, and Instagram deep links.
 */

import { PrizeOption } from '../types';

export interface StoryShareOptions {
  brandName: string;
  prize: PrizeOption;
  promoCode: string;
  campaignTitle?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  campaignUrl?: string;
}

/**
 * Generate a vertical 1080x1920 Story Image on an HTML Canvas and return it as a Blob/File and Data URL.
 */
export async function generateStoryImage(options: StoryShareOptions): Promise<{ file: File; dataUrl: string }> {
  const {
    brandName = 'Delhi Collection',
    prize,
    promoCode = 'DELHIVIP',
    campaignTitle = 'Spin to Win',
    primaryColor = '#861730',
    accentColor = '#FDD145',
  } = options;

  const width = 1080;
  const height = 1920;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Background Gradient (Atmospheric Deep Crimson/Wine to Obsidian)
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#4a0815');
  bgGradient.addColorStop(0.35, primaryColor || '#861730');
  bgGradient.addColorStop(0.8, '#1f0409');
  bgGradient.addColorStop(1, '#0c0204');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Decorative Golden Glows & Circles
  const radialGlow = ctx.createRadialGradient(width / 2, 850, 50, width / 2, 850, 500);
  radialGlow.addColorStop(0, 'rgba(253, 209, 69, 0.25)');
  radialGlow.addColorStop(0.6, 'rgba(253, 209, 69, 0.06)');
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 300, width, 1100);

  // Sparkle stars in background
  ctx.fillStyle = 'rgba(253, 209, 69, 0.6)';
  const sparkles = [
    { x: 160, y: 320, r: 6 },
    { x: 920, y: 380, r: 8 },
    { x: 220, y: 1380, r: 7 },
    { x: 880, y: 1450, r: 5 },
    { x: 120, y: 800, r: 4 },
    { x: 960, y: 920, r: 6 },
  ];
  sparkles.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Top Brand Banner
  ctx.textAlign = 'center';
  ctx.fillStyle = accentColor || '#FDD145';
  ctx.font = 'bold 44px "Cinzel", "Playfair Display", Georgia, serif';
  ctx.fillText(brandName.toUpperCase(), width / 2, 220);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '600 28px sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('EXCLUSIVE PRIVILEGE REWARD', width / 2, 275);

  // Gold decorative horizontal divider
  ctx.strokeStyle = 'rgba(253, 209, 69, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(340, 310);
  ctx.lineTo(740, 310);
  ctx.stroke();

  // 4. "I WON!" Headline
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 82px sans-serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 20;
  ctx.fillText('🎉 I JUST WON! 🎉', width / 2, 450);
  ctx.shadowBlur = 0;

  // 5. Center Luxury Card Box
  const cardX = 120;
  const cardY = 540;
  const cardW = 840;
  const cardH = 820;
  const cardRadius = 48;

  // Card Background
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  ctx.fill();
  ctx.restore();

  // Card Gold Border
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.strokeStyle = '#FDD145';
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();

  // Badge Circle inside Card
  const badgeCenterX = width / 2;
  const badgeCenterY = cardY + 220;
  const badgeRadius = 130;

  const badgeGrad = ctx.createLinearGradient(badgeCenterX, badgeCenterY - badgeRadius, badgeCenterX, badgeCenterY + badgeRadius);
  badgeGrad.addColorStop(0, '#FEF3C7');
  badgeGrad.addColorStop(1, '#FDE68A');

  ctx.beginPath();
  ctx.arc(badgeCenterX, badgeCenterY, badgeRadius, 0, Math.PI * 2);
  ctx.fillStyle = badgeGrad;
  ctx.fill();
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Badge Icon / Text
  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 90px sans-serif';
  ctx.fillText('🎁', badgeCenterX, badgeCenterY + 32);

  // Prize Label (e.g. 50% OFF or LUXURY WATCH)
  ctx.fillStyle = '#1C1917';
  ctx.font = '900 64px sans-serif';
  
  // Wrap text if long
  const prizeLabel = prize.label || 'Grand Exclusive Prize';
  if (prizeLabel.length > 20) {
    ctx.font = '900 52px sans-serif';
  }
  ctx.fillText(prizeLabel, width / 2, cardY + 440);

  if (prize.subLabel) {
    ctx.fillStyle = '#78716C';
    ctx.font = '600 32px sans-serif';
    ctx.fillText(prize.subLabel, width / 2, cardY + 500);
  }

  // Promo Code Box inside Card
  const promoBoxY = cardY + 560;
  const promoBoxW = 640;
  const promoBoxH = 150;
  const promoBoxX = (width - promoBoxW) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(promoBoxX, promoBoxY, promoBoxW, promoBoxH, 24);
  ctx.fillStyle = '#FFFBEB';
  ctx.fill();
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 8]);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 24px sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('EXCLUSIVE PROMO CODE', width / 2, promoBoxY + 44);

  ctx.fillStyle = '#1C1917';
  ctx.font = '900 56px "Courier New", Courier, monospace';
  ctx.fillText(promoCode || 'DELHIVIP', width / 2, promoBoxY + 108);

  ctx.fillStyle = '#57534E';
  ctx.font = '500 24px sans-serif';
  ctx.fillText('Show this card at billing counter to redeem', width / 2, cardY + 760);

  // 6. Bottom Call to Action / Story Footer
  ctx.fillStyle = '#FDD145';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText(`⚡ Play & Win at ${brandName} ⚡`, width / 2, 1490);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 30px sans-serif';
  ctx.fillText(campaignTitle, width / 2, 1545);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '400 26px sans-serif';
  ctx.fillText('Visit in-store or online to claim your spin', width / 2, 1600);

  // Bottom Branding Bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 1780, width, 140);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 28px sans-serif';
  ctx.fillText(`@${brandName.toLowerCase().replace(/\s+/g, '')} • #DelhiCollection #SpinAndWin`, width / 2, 1860);

  // Convert canvas to Blob / File
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas blob generation failed'));
          return;
        }
        const file = new File([blob], `delhi-collection-prize-${promoCode}.png`, { type: 'image/png' });
        const dataUrl = canvas.toDataURL('image/png');
        resolve({ file, dataUrl });
      },
      'image/png',
      0.95
    );
  });
}

/**
 * Direct WhatsApp Story / Status share (1-2 clicks).
 */
export async function shareToWhatsAppStory(options: StoryShareOptions): Promise<{ success: boolean; method: string }> {
  const { brandName, prize, promoCode, campaignUrl } = options;
  const currentUrl = campaignUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const shareText = `🎉 *I JUST WON AT ${brandName.toUpperCase()}!* 🛍️✨\n\n🏆 *Prize:* ${prize.label}\n🎟️ *Promo Code:* ${promoCode}\n\n👉 Spin the wheel & win your gift here:\n${currentUrl}\n\n#${brandName.replace(/\s+/g, '')} #SpinToWin #ExclusiveReward`;

  // Try Web Share API with image file first if supported (Android/iOS supports direct WhatsApp Status sharing)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const { file } = await generateStoryImage(options);
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `I Won ${prize.label}!`,
          text: shareText,
          files: [file],
        });
        return { success: true, method: 'web_share_file' };
      }
    } catch {
      // User cancelled or share failed, fallback to direct WhatsApp URL
    }
  }

  // Universal WhatsApp direct status / chat link (pre-populated, user taps 'My Status' in 1 click)
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  return { success: true, method: 'whatsapp_url' };
}

/**
 * Direct Instagram Story share (1-2 clicks).
 */
export async function shareToInstagramStory(
  options: StoryShareOptions,
  instagramProfileUrl?: string
): Promise<{ success: boolean; method: string; downloaded?: boolean }> {
  const { brandName, prize, promoCode } = options;
  const caption = `🎉 Just won ${prize.label} at @${brandName.toLowerCase().replace(/\s+/g, '')}! ✨ Promo Code: ${promoCode} #DelhiCollection #Winner`;

  // Copy caption to clipboard so user can paste on Instagram story
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(caption);
    } catch {
      // non-blocking
    }
  }

  // Try native Web Share API with image (Direct Instagram Story option in native sheet)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const { file } = await generateStoryImage(options);
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `My ${brandName} Prize Story`,
          text: caption,
          files: [file],
        });
        return { success: true, method: 'web_share_story' };
      }
    } catch {
      // continue to fallback
    }
  }

  // Fallback: Generate & download story graphic, then open Instagram app/web
  try {
    const { dataUrl } = await generateStoryImage(options);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-prize-story.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Open Instagram app or profile
    const targetUrl = instagramProfileUrl || 'https://www.instagram.com/';
    setTimeout(() => {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }, 400);

    return { success: true, method: 'download_and_open', downloaded: true };
  } catch {
    const targetUrl = instagramProfileUrl || 'https://www.instagram.com/';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    return { success: true, method: 'open_only' };
  }
}
