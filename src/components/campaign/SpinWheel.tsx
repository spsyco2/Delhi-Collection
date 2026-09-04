import React, { useState, useEffect, useRef } from 'react';
import { PrizeOption, CampaignDesign } from '../../types';
import { soundFx } from '../common/SoundFx';
import { PrizeIcon } from '../common/PrizeIcon';
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
  Volume2,
  VolumeX
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpinWheelProps {
  prizes: PrizeOption[];
  design: CampaignDesign;
  targetPrizeIndex: number | null;
  isSpinning: boolean;
  onSpinComplete: () => void;
  disabled?: boolean;
}

// Icon mapper for wheel sections
export function getPrizeIcon(iconName: string, className: string = "w-4 h-4", imageUrl?: string, label?: string) {
  return <PrizeIcon iconName={iconName} label={label} imageUrl={imageUrl} className={className} />;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  prizes,
  design,
  targetPrizeIndex,
  isSpinning,
  onSpinComplete,
  disabled = false,
}) => {
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [animating, setAnimating] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const numSlices = Math.max(2, prizes.length);
  const sliceAngle = 360 / numSlices;
  const radius = 175; // SVG coordinate radius
  const center = 200; // SVG center coordinate (400x400 viewBox)

  useEffect(() => {
    soundFx.setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    if (isSpinning && targetPrizeIndex !== null && !animating) {
      setAnimating(true);
      
      // Calculate target rotation
      // Pointer is at 12 o'clock (270 deg or top in SVG)
      // Slices start at index 0 from angle 0 to sliceAngle
      // Midpoint of slice i is (i * sliceAngle + sliceAngle / 2)
      // To bring slice i to the top (270° or -90°):
      const sliceMid = targetPrizeIndex * sliceAngle + (sliceAngle / 2);
      
      // Top position is 270 degrees in SVG rotation space
      const fullRotations = (5 + Math.floor(Math.random() * 2)) * 360; // 5 or 6 full spins
      const baseRotation = (270 - sliceMid + 3600) % 360;
      
      // Total new rotation
      const finalRotation = currentRotation + fullRotations + ((baseRotation - (currentRotation % 360) + 360) % 360);

      const startTime = performance.now();
      const duration = 5200; // 5.2 seconds for realistic luxurious suspense
      const startRot = currentRotation;
      const totalDelta = finalRotation - startRot;

      let lastSliceIndex = -1;

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Quintic / cubic ease-out for luxurious decelerating physics
        // t < 1 ? 1 - Math.pow(1 - t, 4) : 1;
        const ease = 1 - Math.pow(1 - progress, 4.2);
        const currentRot = startRot + totalDelta * ease;
        
        setCurrentRotation(currentRot);

        // Calculate current slice under pointer for audio tick
        const normalizedAngle = (270 - (currentRot % 360) + 3600) % 360;
        const currentSlice = Math.floor(normalizedAngle / sliceAngle);

        if (currentSlice !== lastSliceIndex && time - lastTickRef.current > 40) {
          soundFx.playTick();
          lastTickRef.current = time;
          lastSliceIndex = currentSlice;
        }

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setAnimating(false);
          setCurrentRotation(finalRotation);

          const wonPrize = prizes[targetPrizeIndex];
          if (wonPrize?.isWinning) {
            soundFx.playWin();
            // Confetti celebration
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#d97706', '#1c1917', '#f59e0b', '#fbbf24', '#e11d48'],
            });
          }

          onSpinComplete();
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isSpinning, targetPrizeIndex]);

  // Generate SVG path for each slice
  const createSlicePath = (index: number) => {
    const startAngle = (index * sliceAngle * Math.PI) / 180;
    const endAngle = ((index + 1) * sliceAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-2 select-none">
      {/* Sound toggle floating button */}
      <div className="absolute top-0 right-2 z-20">
        <button
          type="button"
          onClick={() => setSoundOn(!soundOn)}
          className="p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors text-xs flex items-center gap-1"
          title={soundOn ? "Mute sound effects" : "Enable sound effects"}
          aria-label="Sound settings"
        >
          {soundOn ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
        </button>
      </div>

      {/* Wheel Container with decorative outer bezel */}
      <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] flex items-center justify-center">
        {/* Outer ambient glow and metallic bezel */}
        <div 
          className="absolute inset-0 rounded-full border-[10px] sm:border-[12px] shadow-2xl transition-all duration-500"
          style={{
            borderColor: design.wheelBorderColor || '#d97706',
            boxShadow: `0 20px 40px -15px ${design.wheelBorderColor ? design.wheelBorderColor + '40' : 'rgba(0,0,0,0.15)'}`,
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.15) 100%)',
          }}
        />

        {/* Outer studded rivets/jewels */}
        <div className="absolute inset-0 rounded-full pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            const r = 48.5; // percentage from center
            const x = 50 + r * Math.cos((angle * Math.PI) / 180);
            const y = 50 + r * Math.sin((angle * Math.PI) / 180);
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-200 shadow-sm border border-amber-500/50 transform -translate-x-1/2 -translate-y-1/2"
                style={{ top: `${y}%`, left: `${x}%` }}
              />
            );
          })}
        </div>

        {/* Top Pointer Indicator (High-fashion arrow needle) */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none drop-shadow-md">
          <div 
            className="w-7 h-9 sm:w-8 sm:h-10 relative"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
          >
            {/* Elegant Pointer Diamond/Tear */}
            <svg viewBox="0 0 32 40" className="w-full h-full">
              <path
                d="M 16 38 L 4 10 C 2 6 6 0 16 0 C 26 0 30 6 28 10 Z"
                fill={design.wheelIndicatorColor || '#d97706'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle cx="16" cy="12" r="4" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* The Animated SVG Wheel */}
        <div 
          className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
          style={{
            transform: `rotate(${currentRotation}deg)`,
            transition: animating ? 'none' : 'transform 0.1s ease-out',
            willChange: 'transform',
          }}
        >
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full"
            style={{ transformOrigin: 'center center' }}
          >
            <defs>
              <filter id="sliceShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
              </filter>
            </defs>

            {/* Render Slices */}
            {prizes.map((prize, index) => {
              const midAngle = (index * sliceAngle + sliceAngle / 2);
              const textDistance = radius * 0.65;
              const textRad = (midAngle * Math.PI) / 180;
              const textX = center + textDistance * Math.cos(textRad);
              const textY = center + textDistance * Math.sin(textRad);

              return (
                <g key={prize.id || index} id={`wheel-slice-${index}`}>
                  {/* Slice Wedge */}
                  <path
                    d={createSlicePath(index)}
                    fill={prize.color || (index % 2 === 0 ? '#1c1917' : '#d97706')}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />

                  {/* Slice Text and Icon aligned towards the center */}
                  <g
                    transform={`translate(${textX}, ${textY}) rotate(${midAngle + 90})`}
                    style={{ pointerEvents: 'none' }}
                  >
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={prize.textColor || '#ffffff'}
                      fontSize={numSlices > 8 ? "11" : "13"}
                      fontWeight="700"
                      letterSpacing="0.05em"
                      className="font-sans select-none drop-shadow-sm"
                    >
                      {prize.label}
                    </text>
                    {prize.subLabel && (
                      <text
                        y="14"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={prize.textColor || '#ffffff'}
                        fillOpacity="0.85"
                        fontSize={numSlices > 8 ? "8" : "9"}
                        fontWeight="500"
                        letterSpacing="0.02em"
                        className="font-sans select-none"
                      >
                        {prize.subLabel.length > 15 ? prize.subLabel.slice(0, 14) + '…' : prize.subLabel}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}

            {/* Inner Center Hub & Monogram */}
            <circle
              cx={center}
              cy={center}
              r="40"
              fill={design.wheelCenterColor || '#1c1917'}
              stroke="#ffffff"
              strokeWidth="3"
              filter="url(#sliceShadow)"
            />
            <circle
              cx={center}
              cy={center}
              r="34"
              fill="none"
              stroke={design.wheelBorderColor || '#d97706'}
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          </svg>
        </div>

        {/* Center Jewel / Brand Emblem (Non-rotating for high visual stability) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center bg-stone-900 border-2 border-amber-500 shadow-xl pointer-events-none z-10 text-white">
          <Sparkles className="w-4 h-4 text-amber-400 mb-0.5 animate-pulse" />
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase font-serif text-amber-100">
            {design.brandName ? design.brandName.split(' ')[0] : 'ATELIER'}
          </span>
        </div>
      </div>

      {/* Wheel Legend / Slice indicators on mobile */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-xs text-xs text-stone-500">
        <span className="text-[11px] font-medium text-stone-400">
          {prizes.length} privileged rewards configured
        </span>
      </div>
    </div>
  );
};
