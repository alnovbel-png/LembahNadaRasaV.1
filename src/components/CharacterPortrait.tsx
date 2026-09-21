import React from 'react';

export interface CharacterPortraitProps {
  sprite: string;
  size?: 'sm' | 'md' | 'lg' | 'dialogue' | 'small';
  isResolved?: boolean;
  className?: string;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  sprite,
  size = 'md',
  isResolved = false,
  className = '',
}) => {
  // Dimension styles
  const sizeClasses = {
    sm: 'w-10 h-10',
    small: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    dialogue: 'w-16 h-16 shrink-0',
  }[size] || 'w-12 h-12';

  // SVG viewBox is 32x32 standard pixel art grid
  const svgStyle: React.CSSProperties = {
    imageRendering: 'pixelated',
    shapeRendering: 'crispEdges',
  };

  switch (sprite) {
    // =========================================================================
    // EZSEL (PLAYER / PROTAGONIST - BOY & GIRL AVATARS)
    // =========================================================================
    case 'player':
    case 'player_boy':
      return (
        <div
          className={`${sizeClasses} bg-[#112b29] rounded-xl flex items-center justify-center border-2 border-[#2ca88e] shadow-[0_0_12px_rgba(44,168,142,0.35)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Soft Oval Shadow */}
            <ellipse cx="16" cy="29" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />
            {/* Dark Charcoal Navy Legs */}
            <rect x="10" y="26" width="4" height="5" fill="#242c3d" />
            <rect x="18" y="26" width="4" height="5" fill="#242c3d" />
            {/* Emerald/Jade Teal Tunic */}
            <rect x="8" y="15" width="16" height="11" fill="#1ea282" />
            <rect x="8" y="15" width="2" height="11" fill="#168c70" />
            <rect x="22" y="15" width="2" height="11" fill="#168c70" />
            {/* Golden Waist Buckle / Compass */}
            <rect x="14" y="22" width="4" height="4" fill="#f5b822" />
            <rect x="14" y="22" width="2" height="2" fill="#fef08a" />
            {/* Red Scarf / Collar */}
            <rect x="8" y="13" width="16" height="3" fill="#ef4444" />
            <rect x="8" y="13" width="16" height="1" fill="#f87171" />
            {/* Face Skin Tone */}
            <rect x="8" y="7" width="16" height="7" fill="#fcd7b0" />
            {/* Brown Hair Bangs & Locks */}
            <rect x="8" y="3" width="16" height="5" fill="#7d3817" />
            <rect x="8" y="7" width="3" height="4" fill="#7d3817" />
            <rect x="21" y="7" width="3" height="4" fill="#7d3817" />
            <rect x="9" y="4" width="14" height="2" fill="#8c421d" />
            {/* Expressive Dark Square Eyes */}
            <rect x="11" y="8" width="2" height="3" fill="#192134" />
            <rect x="19" y="8" width="2" height="3" fill="#192134" />
          </svg>
        </div>
      );

    case 'player_girl':
      return (
        <div
          className={`${sizeClasses} bg-[#24132b] rounded-xl flex items-center justify-center border-2 border-[#ec4899] shadow-[0_0_12px_rgba(236,72,153,0.4)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Soft Oval Shadow */}
            <ellipse cx="16" cy="29" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />
            {/* Dark Charcoal Navy Skirt / Legs */}
            <rect x="10" y="26" width="4" height="5" fill="#242c3d" />
            <rect x="18" y="26" width="4" height="5" fill="#242c3d" />
            {/* Emerald Adventurer Tunic */}
            <rect x="8" y="15" width="16" height="11" fill="#1ea282" />
            <rect x="8" y="15" width="2" height="11" fill="#168c70" />
            <rect x="22" y="15" width="2" height="11" fill="#168c70" />
            {/* Golden Waist Buckle / Compass */}
            <rect x="14" y="22" width="4" height="4" fill="#f5b822" />
            <rect x="14" y="22" width="2" height="2" fill="#fef08a" />
            {/* Ruby Scarf / Collar */}
            <rect x="8" y="13" width="16" height="3" fill="#e11d48" />
            <rect x="8" y="13" width="16" height="1" fill="#fb7185" />
            {/* Face Skin Tone */}
            <rect x="8" y="7" width="16" height="7" fill="#fcd7b0" />
            {/* Cute Rosy Blushing Cheeks */}
            <rect x="9" y="11" width="3" height="2" fill="#fda4af" />
            <rect x="20" y="11" width="3" height="2" fill="#fda4af" />
            {/* Long Rich Warm Auburn Hair with Side Locks & Twin Pigtails */}
            <rect x="8" y="3" width="16" height="5" fill="#713f12" />
            <rect x="9" y="4" width="14" height="2" fill="#854d0e" />
            {/* Flowing Side Locks framing face */}
            <rect x="7" y="7" width="3" height="8" fill="#713f12" />
            <rect x="22" y="7" width="3" height="8" fill="#713f12" />
            {/* Cute Twin Ribbon Hairclips (Rose Pink / Ruby) */}
            <rect x="5" y="6" width="3" height="3" fill="#f43f5e" />
            <rect x="6" y="7" width="1" height="1" fill="#ffe4e6" />
            <rect x="24" y="6" width="3" height="3" fill="#f43f5e" />
            <rect x="25" y="7" width="1" height="1" fill="#ffe4e6" />
            {/* Cute Twin Ponytail Bobs */}
            <rect x="4" y="8" width="3" height="6" fill="#854d0e" />
            <rect x="25" y="8" width="3" height="6" fill="#854d0e" />
            {/* Expressive Bright Eyes with subtle highlight */}
            <rect x="11" y="8" width="2" height="3" fill="#1e1b4b" />
            <rect x="11" y="8" width="1" height="1" fill="#ffffff" />
            <rect x="19" y="8" width="2" height="3" fill="#1e1b4b" />
            <rect x="19" y="8" width="1" height="1" fill="#ffffff" />
          </svg>
        </div>
      );

    // =========================================================================
    // REDESIGNED NPCS:
    // =========================================================================

    // 1. KIKI - TUPAI POS CILIK (POSTAL SQUIRREL)
    case 'squirrel':
    case 'kiki':
      return (
        <div
          className={`${sizeClasses} bg-[#2c1808] rounded-xl flex items-center justify-center border-2 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Contact Shadow */}
            <ellipse cx="16" cy="29" rx="10" ry="3" fill="rgba(0,0,0,0.4)" />
            {/* Bushy S-Curve Tail with Fluffy Gradient Tip */}
            <path d="M 5,25 Q 1,17 4,11 Q 7,5 12,5 Q 14,7 10,12 Q 7,16 9,24 Z" fill="#b45309" />
            <path d="M 5,23 Q 2,16 5,12 Q 8,7 12,6 Q 13,8 9,13 Z" fill="#d97706" />
            <rect x="8" y="5" width="4" height="4" fill="#fef3c7" />
            <rect x="9" y="6" width="2" height="2" fill="#ffffff" />
            {/* Feet */}
            <rect x="11" y="27" width="3" height="2" fill="#92400e" />
            <rect x="18" y="27" width="3" height="2" fill="#92400e" />
            {/* Russet Body */}
            <rect x="10" y="14" width="12" height="13" fill="#d97706" />
            <rect x="10" y="14" width="2" height="13" fill="#b45309" />
            <rect x="20" y="14" width="2" height="13" fill="#b45309" />
            {/* Creamy Fur Bib & Belly */}
            <rect x="13" y="16" width="6" height="9" fill="#fef3c7" />
            <rect x="14" y="17" width="4" height="6" fill="#fffbeb" />
            {/* Leather Messenger Satchel Strap & Bag */}
            <line x1="10" y1="14" x2="21" y2="24" stroke="#78350f" strokeWidth="2" />
            <rect x="18" y="21" width="6" height="6" fill="#78350f" rx="1" />
            <rect x="19" y="22" width="4" height="4" fill="#92400e" />
            <rect x="20" y="23" width="2" height="2" fill="#facc15" /> {/* Brass Buckle */}
            {/* White Mail Envelope with Red Wax Seal */}
            <rect x="19" y="20" width="4" height="2" fill="#ffffff" />
            <rect x="20" y="20" width="2" height="1" fill="#ef4444" />
            {/* Squirrel Head */}
            <rect x="9" y="8" width="14" height="9" fill="#ea580c" />
            <rect x="11" y="9" width="10" height="7" fill="#f97316" />
            {/* Fluffy Pointed Ears with Pink Inner Tuft */}
            <rect x="9" y="4" width="4" height="5" fill="#c2410c" />
            <rect x="10" y="5" width="2" height="3" fill="#fda4af" />
            <rect x="19" y="4" width="4" height="5" fill="#c2410c" />
            <rect x="20" y="5" width="2" height="3" fill="#fda4af" />
            {/* Royal Blue Postal Courier Cap */}
            <rect x="11" y="4" width="10" height="4" fill="#1e3a8a" />
            <rect x="10" y="7" width="12" height="2" fill="#1d4ed8" />
            <rect x="10" y="8" width="13" height="1" fill="#0f172a" /> {/* Visor brim */}
            <rect x="15" y="5" width="2" height="2" fill="#fbbf24" /> {/* Postal Horn Badge */}
            {/* Shiny Dark Eyes with Catchlights */}
            <rect x="11" y="11" width="3" height="3" fill="#0f172a" />
            <rect x="11" y="11" width="1" height="1" fill="#ffffff" />
            <rect x="18" y="11" width="3" height="3" fill="#0f172a" />
            <rect x="18" y="11" width="1" height="1" fill="#ffffff" />
            {/* Cheerful Snout & Whiskers */}
            <rect x="14" y="13" width="4" height="3" fill="#fef3c7" />
            <rect x="15" y="13" width="2" height="1" fill="#18181b" /> {/* Nose */}
            <rect x="8" y="13" width="2" height="1" fill="#fef3c7" /> {/* Whisker */}
            <rect x="22" y="13" width="2" height="1" fill="#fef3c7" />
          </svg>
        </div>
      );

    // 2. KAKEK RANU - TUKANG KAYU JEMBATAN (MASTER CARPENTER)
    case 'old_man':
    case 'kakek_ranu':
      return (
        <div
          className={`${sizeClasses} bg-[#0c1933] rounded-xl flex items-center justify-center border-2 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Contact Shadow */}
            <ellipse cx="16" cy="29" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />
            {/* Sturdy Work Trousers & Boots */}
            <rect x="10" y="24" width="4" height="5" fill="#334155" />
            <rect x="18" y="24" width="4" height="5" fill="#334155" />
            <rect x="9" y="27" width="5" height="3" fill="#451a03" />
            <rect x="18" y="27" width="5" height="3" fill="#451a03" />
            {/* Natural Linen Rolled-up Shirt */}
            <rect x="7" y="14" width="18" height="11" fill="#fef3c7" />
            {/* Indigo Denim Carpenter Work Vest */}
            <rect x="9" y="14" width="14" height="10" fill="#1e3a8a" />
            <rect x="9" y="14" width="3" height="10" fill="#1d4ed8" />
            <rect x="20" y="14" width="3" height="10" fill="#1d4ed8" />
            <rect x="15" y="16" width="2" height="2" fill="#f59e0b" /> {/* Brass Button */}
            <rect x="15" y="19" width="2" height="2" fill="#f59e0b" />
            {/* Heavy Leather Tool Belt with Chisel Slot */}
            <rect x="8" y="22" width="16" height="3" fill="#78350f" />
            <rect x="14" y="22" width="4" height="3" fill="#f59e0b" /> {/* Belt Buckle */}
            <rect x="9" y="23" width="2" height="5" fill="#b45309" /> {/* Chisel handle */}
            <rect x="9" y="28" width="2" height="2" fill="#94a3b8" /> {/* Steel blade */}
            {/* Master Carpenter Mallet held in hand */}
            <rect x="23" y="17" width="2" height="8" fill="#b45309" />
            <rect x="21" y="14" width="6" height="4" fill="#64748b" />
            <rect x="21" y="14" width="1" height="4" fill="#f59e0b" /> {/* Brass Ring */}
            <rect x="26" y="14" width="1" height="4" fill="#f59e0b" />
            {/* Face & Head */}
            <rect x="9" y="6" width="14" height="9" fill="#fed7aa" />
            {/* Bald Crown with Silver Side Hair */}
            <rect x="11" y="4" width="10" height="3" fill="#ffedd5" />
            <rect x="8" y="6" width="3" height="7" fill="#cbd5e1" />
            <rect x="21" y="6" width="3" height="7" fill="#cbd5e1" />
            {/* Traditional Batik Headband (Udeng / Ikat Kepala) */}
            <rect x="8" y="4" width="16" height="3" fill="#991b1b" />
            <rect x="10" y="5" width="2" height="1" fill="#facc15" />
            <rect x="14" y="5" width="2" height="1" fill="#facc15" />
            <rect x="18" y="5" width="2" height="1" fill="#facc15" />
            <rect x="22" y="3" width="2" height="4" fill="#991b1b" /> {/* Tied Knot */}
            {/* Wise Eyes & Bushy Eyebrows */}
            <rect x="10" y="7" width="4" height="2" fill="#f8fafc" />
            <rect x="18" y="7" width="4" height="2" fill="#f8fafc" />
            <rect x="11" y="8" width="2" height="2" fill="#0f172a" />
            <rect x="19" y="8" width="2" height="2" fill="#0f172a" />
            {/* Magnificent Silver Handlebar Mustache & Braided Beard */}
            <rect x="9" y="12" width="14" height="3" fill="#f8fafc" />
            <rect x="8" y="13" width="3" height="2" fill="#e2e8f0" />
            <rect x="21" y="13" width="3" height="2" fill="#e2e8f0" />
            <rect x="13" y="15" width="6" height="4" fill="#f8fafc" />
            <rect x="14" y="18" width="4" height="2" fill="#cbd5e1" />
          </svg>
        </div>
      );

    // 3. BIMO - MURID PEMBUAT JAM (WATCHMAKER APPRENTICE)
    case 'boy_glasses':
    case 'bimo':
      return (
        <div
          className={`${sizeClasses} bg-[#271d05] rounded-xl flex items-center justify-center border-2 border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Shadow */}
            <ellipse cx="16" cy="29" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />
            {/* Trousers & Boots */}
            <rect x="11" y="24" width="4" height="5" fill="#475569" />
            <rect x="17" y="24" width="4" height="5" fill="#475569" />
            <rect x="10" y="27" width="5" height="3" fill="#78350f" />
            <rect x="17" y="27" width="5" height="3" fill="#78350f" />
            {/* Collared White Shirt & Tie */}
            <rect x="9" y="14" width="14" height="11" fill="#ffffff" />
            <rect x="14" y="13" width="4" height="2" fill="#7c2d12" /> {/* Small Cravat */}
            {/* Mustard Knit Sweater Vest with Argyle Diamond Accents */}
            <rect x="9" y="14" width="14" height="10" fill="#eab308" />
            <rect x="11" y="14" width="10" height="2" fill="#facc15" /> {/* V-Neck */}
            <rect x="15" y="16" width="2" height="2" fill="#ca8a04" />
            <rect x="15" y="20" width="2" height="2" fill="#ca8a04" />
            {/* Leather Tool Apron & Pocket Tweezers */}
            <rect x="9" y="21" width="14" height="4" fill="#543930" />
            <rect x="11" y="20" width="1" height="3" fill="#94a3b8" /> {/* Tweezers handle */}
            <rect x="13" y="19" width="1" height="4" fill="#ca8a04" /> {/* Screwdriver */}
            {/* Miniature Golden Pocket Watch on Chest Strap */}
            <line x1="12" y1="16" x2="19" y2="21" stroke="#b45309" strokeWidth="1" />
            <rect x="18" y="19" width="3" height="3" fill="#facc15" rx="0.5" />
            {/* Head & Neck */}
            <rect x="10" y="6" width="12" height="9" fill="#fed7aa" />
            {/* Messy Curly Brown Hair with Animated Cowlick */}
            <rect x="8" y="3" width="16" height="5" fill="#3b2f2f" />
            <rect x="7" y="6" width="3" height="5" fill="#3b2f2f" />
            <rect x="22" y="6" width="3" height="5" fill="#3b2f2f" />
            <rect x="10" y="1" width="4" height="3" fill="#3b2f2f" /> {/* Cowlick tip */}
            <rect x="11" y="4" width="11" height="2" fill="#543930" />
            {/* Rosy Cheeks */}
            <rect x="9" y="12" width="3" height="2" fill="#fca5a5" />
            <rect x="20" y="12" width="3" height="2" fill="#fca5a5" />
            {/* Oversized Round Turquoise Spectacles with Glint */}
            <rect x="9" y="8" width="6" height="5" fill="none" stroke="#0284c7" strokeWidth="1.2" />
            <rect x="17" y="8" width="6" height="5" fill="none" stroke="#0284c7" strokeWidth="1.2" />
            <line x1="15" y1="10" x2="17" y2="10" stroke="#0284c7" strokeWidth="1.2" />
            {/* Eyes behind lenses */}
            <rect x="11" y="9" width="2" height="2" fill="#0f172a" />
            <rect x="19" y="9" width="2" height="2" fill="#0f172a" />
            <rect x="11" y="9" width="1" height="1" fill="#ffffff" />
            <rect x="19" y="9" width="1" height="1" fill="#ffffff" />
            {/* Swiveling Brass Watchmaker Loupe Magnifier above right eye */}
            <rect x="18" y="6" width="4" height="2" fill="#f59e0b" />
            <circle cx="20" cy="7" r="1.5" fill="#38bdf8" />
          </svg>
        </div>
      );

    // 4. PROFESOR KOTEK - AYAM PENELITI EMOSI (SCIENTIST ROOSTER - OFFICIAL MODEL SHEET)
    case 'chicken_glasses':
      return (
        <div
          className={`${sizeClasses} bg-[#0b1329] rounded-xl flex items-center justify-center border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Ground Shadow */}
            <ellipse cx="16" cy="29.5" rx="9" ry="2.5" fill="rgba(0,0,0,0.45)" />

            {/* High-Tech Reactor Backpack Canisters peeking over shoulders */}
            {/* Left Canister: Glowing Green Liquid */}
            <rect x="5" y="10" width="4" height="2" fill="#475569" rx="0.5" />
            <rect x="5" y="12" width="4" height="8" fill="#15803d" />
            <rect x="5.5" y="13" width="3" height="6" fill="#22c55e" />
            <rect x="6.5" y="14" width="1" height="4" fill="#86efac" />
            <rect x="5" y="20" width="4" height="2" fill="#334155" rx="0.5" />
            <rect x="4" y="14" width="1.5" height="5" fill="#78350f" />

            {/* Right Canister: Glowing Orange Liquid & Battery Module */}
            <rect x="23" y="10" width="4" height="2" fill="#475569" rx="0.5" />
            <rect x="23" y="12" width="4" height="8" fill="#c2410c" />
            <rect x="23.5" y="13" width="3" height="6" fill="#f97316" />
            <rect x="24.5" y="14" width="1" height="4" fill="#fde047" />
            <rect x="23" y="20" width="4" height="2" fill="#334155" rx="0.5" />
            <rect x="26.5" y="14" width="2" height="6" fill="#581c87" rx="0.5" />

            {/* Scaled Golden Chicken Feet */}
            <rect x="12" y="24" width="2" height="5" fill="#f59e0b" />
            <rect x="10" y="28" width="5" height="2" fill="#f59e0b" />
            <rect x="18" y="24" width="2" height="5" fill="#f59e0b" />
            <rect x="17" y="28" width="5" height="2" fill="#f59e0b" />

            {/* White Lab Coat ("Jas Lab Putih") */}
            <rect x="9" y="12" width="14" height="13" fill="#ffffff" rx="1.5" />
            <rect x="9" y="12" width="2" height="13" fill="#e2e8f0" />
            <rect x="9" y="24" width="14" height="1.5" fill="#cbd5e1" />

            {/* Inner Blue Shirt & Belt */}
            <rect x="13" y="13" width="6" height="10" fill="#0284c7" />
            <rect x="13" y="21" width="6" height="2" fill="#0369a1" />

            {/* High-Tech Chest Harness & Sensor Gauge */}
            <rect x="11" y="13.5" width="10" height="1.5" fill="#78350f" />
            {/* Center Gauge Casing */}
            <rect x="13" y="14.5" width="6" height="6.5" fill="#f8fafc" stroke="#334155" strokeWidth="0.8" rx="0.5" />
            {/* Gold Sensor Dial */}
            <circle cx="16" cy="16" r="1.2" fill="#f59e0b" />
            {/* Dual Red & Green Indicator Bars */}
            <rect x="14" y="18" width="1.5" height="2.5" fill="#ef4444" />
            <rect x="16.5" y="18" width="1.5" height="2.5" fill="#22c55e" />

            {/* Arms / Wings */}
            {/* Right Wing (Left on screen): White Lab Coat Sleeve */}
            <rect x="7" y="13" width="3" height="8" fill="#f1f5f9" rx="1" />

            {/* Left Wing (Right on screen): Bright Red Glove/Sleeve extending out */}
            <rect x="22" y="14" width="7" height="5" fill="#ef4444" rx="1" />
            <rect x="22" y="18" width="7" height="1" fill="#b91c1c" />
            {/* Cyan device/sensor cuff underneath */}
            <rect x="24" y="19" width="3.5" height="2" fill="#06b6d4" rx="0.5" />

            {/* Head & Feathers */}
            <rect x="11" y="5" width="10" height="8.5" fill="#ffffff" rx="1" />
            <rect x="11" y="12" width="10" height="1.5" fill="#f1f5f9" />

            {/* Tall Red Royal Comb */}
            <rect x="14" y="0" width="4" height="7" fill="#ef4444" rx="1" />
            <rect x="12" y="2" width="2.5" height="4" fill="#dc2626" rx="0.5" />
            <rect x="17.5" y="2" width="2.5" height="4" fill="#dc2626" rx="0.5" />
            <rect x="15" y="1" width="1.5" height="5" fill="#f87171" />

            {/* Golden Beak */}
            <polygon points="19,8.5 25,10 19,11.5" fill="#f59e0b" />
            <polygon points="19,8.5 23,9.5 19,10" fill="#fbbf24" />

            {/* Crimson Wattle */}
            <rect x="17.5" y="11.5" width="3.5" height="4" fill="#ef4444" rx="1" />
            <rect x="18" y="13.5" width="2.5" height="2" fill="#dc2626" />

            {/* Blue Eye with Yellow Spectacles Frame */}
            <rect x="14" y="7" width="5" height="4.5" fill="none" stroke="#eab308" strokeWidth="1" rx="1" />
            <rect x="14.5" y="7.5" width="4" height="3.5" fill="rgba(56,189,248,0.2)" />
            <rect x="15" y="8" width="2.5" height="2.5" fill="#0284c7" />
            <rect x="16" y="8.5" width="1.5" height="1.5" fill="#0f172a" />
            <rect x="15.5" y="8" width="1" height="1" fill="#ffffff" />
          </svg>
        </div>
      );

    // 5. SOSOK KABUT / NENEK WILIS (TOWER GUARDIAN & ELDER LIBRARIAN)
    case 'spirit_elder':
    case 'grandmother':
    case 'penjaga_kabut':
    case 'nenek_wilis':
      if (isResolved) {
        // REVEALED FORM: NENEK WILIS (TRADITIONAL ELDER IN ROYAL BATIK KEBAYA)
        return (
          <div
            className={`${sizeClasses} bg-[#260515] rounded-xl flex items-center justify-center border-2 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)] overflow-hidden relative ${className}`}
          >
            <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
              {/* Shadow */}
              <ellipse cx="16" cy="29" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />
              {/* Royal Maroon Batik Kebaya Long Skirt with Golden Flowers */}
              <rect x="8" y="16" width="16" height="12" fill="#831843" />
              <rect x="10" y="18" width="2" height="2" fill="#fbbf24" />
              <rect x="18" y="20" width="2" height="2" fill="#fbbf24" />
              <rect x="12" y="23" width="2" height="2" fill="#fbbf24" />
              <rect x="20" y="24" width="2" height="2" fill="#fbbf24" />
              {/* Silk Emerald Green Selendang (Sash) draped over shoulder */}
              <path d="M 8,14 Q 12,19 14,28 L 17,28 Q 15,19 11,14 Z" fill="#047857" />
              <rect x="14" y="27" width="3" height="2" fill="#facc15" /> {/* Golden Fringe */}
              {/* Dignified Face Tone */}
              <rect x="10" y="6" width="12" height="9" fill="#fed7aa" />
              {/* Pearl Necklace */}
              <rect x="12" y="14" width="8" height="2" fill="#f8fafc" />
              {/* Silver Traditional Hair Bun (Sanggul) */}
              <rect x="9" y="3" width="14" height="5" fill="#cbd5e1" />
              <rect x="8" y="5" width="2" height="5" fill="#94a3b8" />
              <rect x="22" y="5" width="2" height="5" fill="#94a3b8" />
              <rect x="13" y="1" width="6" height="3" fill="#e2e8f0" /> {/* High Coiled Bun */}
              {/* 3 Golden Hairpins (Cunduk Mentul) with Sparkle Highlights */}
              <rect x="13" y="0" width="1" height="2" fill="#facc15" />
              <rect x="16" y="-1" width="1" height="3" fill="#fef08a" />
              <rect x="19" y="0" width="1" height="2" fill="#facc15" />
              {/* Loving Grandmotherly Eyes with Gentle Wrinkles */}
              <rect x="11" y="8" width="3" height="2" fill="#0f172a" />
              <rect x="18" y="8" width="3" height="2" fill="#0f172a" />
              <rect x="12" y="8" width="1" height="1" fill="#ffffff" />
              <rect x="19" y="8" width="1" height="1" fill="#ffffff" />
              {/* Ancient Village Chronicle Ledger in Hand */}
              <rect x="20" y="17" width="7" height="9" fill="#78350f" />
              <rect x="21" y="18" width="5" height="7" fill="#fef3c7" />
              <rect x="22" y="20" width="3" height="3" fill="#f59e0b" /> {/* Golden Crest */}
            </svg>
          </div>
        );
      } else {
        // UNRESOLVED FORM: SOSOK KABUT (ETHEREAL AURORAL MIST GUARDIAN)
        return (
          <div
            className={`${sizeClasses} bg-[#17092b] rounded-xl flex items-center justify-center border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] overflow-hidden relative ${className}`}
          >
            <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
              {/* Outer Swirling Nebula Mist */}
              <circle cx="16" cy="16" r="14" fill="rgba(147, 51, 234, 0.35)" />
              <circle cx="16" cy="15" r="11" fill="rgba(59, 130, 246, 0.45)" />
              <circle cx="16" cy="14" r="8" fill="rgba(192, 132, 252, 0.6)" />
              {/* Translucent Cloaked Silhouette */}
              <path d="M 11,27 Q 16,23 21,27 L 19,16 Q 16,11 13,16 Z" fill="rgba(76, 29, 149, 0.85)" />
              {/* Glowing Ancient SEL Runes */}
              <rect x="7" y="10" width="2" height="2" fill="#67e8f9" />
              <rect x="23" y="11" width="2" height="2" fill="#c084fc" />
              <rect x="8" y="21" width="2" height="2" fill="#fde047" />
              <rect x="22" y="22" width="2" height="2" fill="#a7f3d0" />
              {/* Luminous Amethyst Spirit Eyes */}
              <rect x="12" y="12" width="3" height="2" fill="#c084fc" />
              <rect x="17" y="12" width="3" height="2" fill="#c084fc" />
              <rect x="13" y="12" width="1" height="1" fill="#ffffff" />
              <rect x="18" y="12" width="1" height="1" fill="#ffffff" />
              {/* Floating Antique Brass Spirit Lantern */}
              <rect x="22" y="14" width="6" height="8" fill="#b45309" rx="1" />
              <rect x="23" y="15" width="4" height="6" fill="#fef08a" />
              <circle cx="25" cy="18" r="1.5" fill="#f59e0b" />
              <rect x="24" y="12" width="2" height="2" fill="#ca8a04" /> {/* Handle */}
            </svg>
          </div>
        );
      }

    // 6. KAK CITRA - KONSELOR CILIK TAMAN BUNGA (FLORAL GARDEN COUNSELOR)
    case 'girl_counselor':
      return (
        <div
          className={`${sizeClasses} bg-[#062421] rounded-xl flex items-center justify-center border-2 border-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.3)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Shadow */}
            <ellipse cx="16" cy="29" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />
            {/* Apricot Peasant Skirt */}
            <rect x="8" y="21" width="16" height="7" fill="#fed7aa" />
            <rect x="9" y="26" width="14" height="2" fill="#fdba74" />
            {/* Sage-Mint Gardener Counselor Tunic */}
            <rect x="8" y="14" width="16" height="8" fill="#0f766e" />
            <rect x="10" y="14" width="12" height="7" fill="#14b8a6" />
            {/* 4-Zone Emotion Gemstone Medallion across Chest */}
            <rect x="12" y="17" width="8" height="3" fill="#134e4a" rx="1" />
            <circle cx="13.5" cy="18.5" r="1" fill="#22c55e" /> {/* Green */}
            <circle cx="15.5" cy="18.5" r="1" fill="#eab308" /> {/* Yellow */}
            <circle cx="17.5" cy="18.5" r="1" fill="#ef4444" /> {/* Red */}
            <circle cx="19.5" cy="18.5" r="1" fill="#38bdf8" /> {/* Blue */}
            {/* Head & Neck */}
            <rect x="10" y="6" width="12" height="9" fill="#fed7aa" />
            {/* Cascading Braided Brown Hair */}
            <rect x="8" y="3" width="16" height="5" fill="#451a03" />
            <rect x="7" y="6" width="4" height="9" fill="#451a03" />
            <rect x="21" y="6" width="4" height="13" fill="#451a03" /> {/* Long Braid */}
            {/* Fresh Pink Jasmine Blossoms in Hair */}
            <rect x="21" y="6" width="3" height="3" fill="#f43f5e" />
            <rect x="22" y="7" width="1" height="1" fill="#fef08a" />
            <rect x="22" y="11" width="3" height="3" fill="#fda4af" />
            <rect x="23" y="12" width="1" height="1" fill="#fef08a" />
            {/* Cheerful Friendly Eyes & Smile */}
            <rect x="11" y="8" width="2" height="3" fill="#0f172a" />
            <rect x="18" y="8" width="2" height="3" fill="#0f172a" />
            <rect x="11" y="8" width="1" height="1" fill="#ffffff" />
            <rect x="18" y="8" width="1" height="1" fill="#ffffff" />
            <rect x="13" y="12" width="5" height="1" fill="#e11d48" /> {/* Smile */}
            {/* Leather Counselor Assessment Folder in hand */}
            <rect x="22" y="17" width="7" height="9" fill="#78350f" />
            <rect x="23" y="18" width="5" height="7" fill="#fef3c7" />
            {/* 4 Colored Ribbon Page Markers */}
            <rect x="23" y="17" width="1" height="2" fill="#22c55e" />
            <rect x="24" y="17" width="1" height="2" fill="#eab308" />
            <rect x="25" y="17" width="1" height="2" fill="#ef4444" />
            <rect x="26" y="17" width="1" height="2" fill="#38bdf8" />
          </svg>
        </div>
      );

    // 7. KAKEK DAMAI - PRAKTISI MINDFUL (ZEN MASTER)
    case 'zen_master':
      return (
        <div
          className={`${sizeClasses} bg-[#061d11] rounded-xl flex items-center justify-center border-2 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Sacred Mossy River Meditation Rock */}
            <rect x="4" y="24" width="24" height="6" fill="#334155" rx="2" />
            <rect x="6" y="24" width="20" height="2" fill="#16a34a" /> {/* Lush Moss */}
            {/* Flowing Jade-Green and Ivory Zen Robes (Lotus Posture) */}
            <rect x="6" y="13" width="20" height="12" fill="#15803d" />
            <rect x="8" y="13" width="16" height="11" fill="#16a34a" />
            <rect x="13" y="13" width="6" height="11" fill="#f8fafc" /> {/* Ivory Inner Lapel */}
            {/* Head & Neck */}
            <rect x="10" y="6" width="12" height="8" fill="#fed7aa" />
            {/* Flowing Silver Beard & Noble Topknot */}
            <rect x="14" y="1" width="4" height="5" fill="#e2e8f0" /> {/* Topknot */}
            <rect x="13" y="2" width="6" height="1" fill="#ca8a04" /> {/* Bamboo Pin */}
            <rect x="9" y="4" width="14" height="4" fill="#cbd5e1" />
            <rect x="10" y="11" width="12" height="6" fill="#f8fafc" /> {/* Beard */}
            <rect x="12" y="16" width="8" height="3" fill="#e2e8f0" />
            {/* Serene Meditating Closed Eyes */}
            <line x1="11" y1="9" x2="14" y2="9" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="18" y1="9" x2="21" y2="9" stroke="#0f172a" strokeWidth="1.2" />
            {/* Miniature Ancient Pine Bonsai Tree in Celadon Pot */}
            <rect x="13" y="19" width="6" height="4" fill="#0284c7" /> {/* Pot */}
            <rect x="15" y="17" width="2" height="3" fill="#78350f" /> {/* Trunk */}
            <circle cx="16" cy="15" r="3.5" fill="#22c55e" /> {/* Foliage */}
            <circle cx="14" cy="14" r="2" fill="#4ade80" />
            <circle cx="18" cy="14" r="2" fill="#4ade80" />
            {/* Zen Sparkle Petal */}
            <rect x="19" y="12" width="2" height="2" fill="#86efac" />
          </svg>
        </div>
      );

    // 8. MOKA - KUCING PUSTAKAWAN LEMBUT (CAT LIBRARIAN)
    case 'cat_librarian':
      return (
        <div
          className={`${sizeClasses} bg-[#2c1303] rounded-xl flex items-center justify-center border-2 border-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.3)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Shadow */}
            <ellipse cx="16" cy="29" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />
            {/* Tricolor Calico Coat (Caramel, Espresso, White) */}
            <rect x="9" y="14" width="14" height="13" fill="#ea580c" rx="2" />
            <rect x="9" y="14" width="5" height="8" fill="#451a03" /> {/* Dark Patch */}
            {/* Snowy White Chest Bib */}
            <rect x="13" y="16" width="6" height="9" fill="#ffffff" />
            {/* Graceful 3-Stage Animated Striped Tail */}
            <path d="M 6,24 Q 2,21 3,16 Q 4,12 8,11" fill="none" stroke="#ea580c" strokeWidth="3" />
            <rect x="2" y="18" width="2" height="2" fill="#fef08a" /> {/* Tail Ring */}
            {/* Cat Head */}
            <rect x="9" y="8" width="14" height="9" fill="#ea580c" rx="1" />
            <rect x="9" y="8" width="4" height="5" fill="#451a03" /> {/* Head Patch */}
            {/* Pointed Ears with Pink Inner Tuft */}
            <polygon points="9,8 12,2 14,8" fill="#c2410c" />
            <polygon points="10,7 12,4 13,7" fill="#fda4af" />
            <polygon points="18,8 20,2 23,8" fill="#c2410c" />
            <polygon points="19,7 20,4 22,7" fill="#fda4af" />
            {/* Round Brass Librarian Spectacles on Snout */}
            <circle cx="12.5" cy="11.5" r="2.5" fill="none" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="19.5" cy="11.5" r="2.5" fill="none" stroke="#f59e0b" strokeWidth="1" />
            <line x1="15" y1="11.5" x2="17" y2="11.5" stroke="#f59e0b" strokeWidth="1" />
            {/* Intelligent Inquisitive Green Eyes */}
            <rect x="12" y="11" width="2" height="2" fill="#15803d" />
            <rect x="19" y="11" width="2" height="2" fill="#15803d" />
            <rect x="12" y="11" width="1" height="1" fill="#ffffff" />
            <rect x="19" y="11" width="1" height="1" fill="#ffffff" />
            {/* Pink Snout & Whiskers */}
            <rect x="15" y="13" width="2" height="1" fill="#f43f5e" />
            <line x1="8" y1="13" x2="13" y2="13" stroke="#fef3c7" strokeWidth="0.8" />
            <line x1="19" y1="13" x2="24" y2="13" stroke="#fef3c7" strokeWidth="0.8" />
            {/* Aristocratic Velvet Crimson Bow Tie with Clock Key Charm */}
            <rect x="13" y="15" width="6" height="3" fill="#991b1b" />
            <rect x="15" y="16" width="2" height="3" fill="#facc15" /> {/* Key charm */}
            {/* Open Antique Fairytale Tome in front of paws */}
            <rect x="22" y="21" width="8" height="6" fill="#1d4ed8" />
            <rect x="23" y="22" width="6" height="4" fill="#fef3c7" />
          </svg>
        </div>
      );

    // 9. PAK JOKO - PETANI KEBUN HARAPAN (HOPE FARMER)
    case 'farmer':
      return (
        <div
          className={`${sizeClasses} bg-[#191404] rounded-xl flex items-center justify-center border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Shadow */}
            <ellipse cx="16" cy="29" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />
            {/* Farm Boots */}
            <rect x="10" y="25" width="4" height="4" fill="#451a03" />
            <rect x="18" y="25" width="4" height="4" fill="#451a03" />
            {/* Traditional Indigo Lurik Tunic */}
            <rect x="9" y="14" width="14" height="12" fill="#1e3a8a" />
            <rect x="11" y="14" width="2" height="12" fill="#172554" />
            <rect x="15" y="14" width="2" height="12" fill="#172554" />
            <rect x="19" y="14" width="2" height="12" fill="#172554" />
            {/* Checkered Red-and-White Sweat Towel around Neck */}
            <rect x="11" y="13" width="10" height="3" fill="#ef4444" />
            <rect x="12" y="14" width="2" height="2" fill="#ffffff" />
            <rect x="16" y="14" width="2" height="2" fill="#ffffff" />
            {/* Weathered Sun-Kissed Face */}
            <rect x="10" y="6" width="12" height="9" fill="#fed7aa" />
            {/* Bushy Friendly Mustache & Straw in Mouth */}
            <rect x="11" y="12" width="10" height="2" fill="#78350f" />
            <line x1="17" y1="13" x2="23" y2="11" stroke="#fde047" strokeWidth="1" /> {/* Straw */}
            {/* Crinkling Warm Eyes */}
            <rect x="11" y="8" width="2" height="2" fill="#0f172a" />
            <rect x="19" y="8" width="2" height="2" fill="#0f172a" />
            {/* Woven Bamboo Caping Sun Hat with Batik Ribbon Band */}
            <polygon points="16,0 4,6 28,6" fill="#f59e0b" />
            <polygon points="16,1 6,6 26,6" fill="#d97706" />
            <polygon points="16,0 12,6 20,6" fill="#fef08a" />
            <rect x="5" y="5" width="22" height="2" fill="#b91c1c" /> {/* Batik Band */}
            <rect x="7" y="5" width="2" height="2" fill="#fbbf24" />
            <rect x="15" y="5" width="2" height="2" fill="#fbbf24" />
            <rect x="23" y="5" width="2" height="2" fill="#fbbf24" />
            {/* Hammered Copper Watering Can */}
            <rect x="21" y="15" width="7" height="7" fill="#c2410c" rx="1" />
            <rect x="22" y="16" width="5" height="2" fill="#fed7aa" />
            <rect x="20" y="13" width="2" height="5" fill="#9a3412" /> {/* Handle */}
            <polygon points="28,17 31,15 31,18" fill="#f59e0b" /> {/* Spout */}
            {/* Sparkling Water Drops */}
            <circle cx="31" cy="21" r="0.8" fill="#7dd3fc" />
            <circle cx="30" cy="24" r="0.8" fill="#38bdf8" />
          </svg>
        </div>
      );

    // 10. DIDI - PENGELANA CILIK DESA (WANDERING SCOUT - OFFICIAL MODEL SHEET)
    case 'wandering_scout':
      return (
        <div
          className={`${sizeClasses} bg-[#0c1322] rounded-xl flex items-center justify-center border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] overflow-hidden relative ${className}`}
        >
          {/* Official Explorer Compass Medal Emblem badge on top corner */}
          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#d97706] flex items-center justify-center border border-amber-300 shadow-sm z-10 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-[#1e293b] flex items-center justify-center">
              <div className="w-1 h-1 bg-[#10b981] rounded-xs" />
            </div>
          </div>

          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Ground Shadow */}
            <ellipse cx="16" cy="28.5" rx="10" ry="2.5" fill="rgba(0,0,0,0.45)" />

            {/* Canvas Expedition Backpack & Rolled Bedroll (peeking on viewer's left) */}
            <rect x="4" y="9" width="6" height="4" fill="#b45309" />
            <rect x="5" y="10" width="4" height="2" fill="#d97706" />
            <rect x="4" y="13" width="6" height="9" fill="#14532d" />
            <rect x="5" y="14" width="4" height="7" fill="#16a34a" />

            {/* Slate Gray Cargo Trousers */}
            <rect x="9" y="19" width="14" height="5" fill="#475569" />
            <rect x="15" y="20" width="2" height="4" fill="#1e293b" /> {/* Inseam gap */}

            {/* Caramel Leather Hiking Boots */}
            <rect x="9" y="24" width="6" height="4" fill="#c2410c" />
            <rect x="17" y="24" width="6" height="4" fill="#c2410c" />
            <rect x="9" y="27" width="6" height="1.5" fill="#9a3412" />
            <rect x="17" y="27" width="6" height="1.5" fill="#9a3412" />

            {/* Orange Explorer Jacket */}
            <rect x="9" y="12" width="14" height="8" fill="#ea580c" />
            <rect x="14" y="12" width="4" height="2" fill="#c2410c" /> {/* Inner collar */}

            {/* Green Backpack Harness Straps */}
            <rect x="10" y="12" width="2" height="8" fill="#15803d" />
            <rect x="20" y="12" width="2" height="8" fill="#15803d" />

            {/* Chest Badges & Pockets (Official Model Sheet) */}
            {/* Green Walkie-Talkie Clip */}
            <rect x="11" y="13" width="2" height="3" fill="#15803d" />
            <rect x="11" y="13" width="2" height="1" fill="#86efac" />
            {/* Blue Pocket */}
            <rect x="13" y="15" width="3" height="2" fill="#0284c7" />
            {/* Dark Red Badge */}
            <rect x="17" y="15" width="2" height="2" fill="#991b1b" />
            {/* Green Badge */}
            <rect x="15" y="17" width="3" height="2" fill="#16a34a" />

            {/* Arms & Hands */}
            {/* Right Arm hanging down */}
            <rect x="6" y="13" width="3" height="5" fill="#ea580c" />
            <rect x="6" y="18" width="3" height="3" fill="#fcd3a7" />
            {/* Left Arm holding staff */}
            <rect x="23" y="13" width="3" height="5" fill="#ea580c" />
            <rect x="23" y="14" width="4" height="3" fill="#fcd3a7" />

            {/* Tall Wooden Walking Staff */}
            <rect x="24" y="7" width="4" height="4" fill="#b45309" />
            <rect x="25" y="8" width="2" height="2" fill="#d97706" />
            <rect x="25" y="10" width="2" height="18" fill="#78350f" />
            <rect x="25" y="10" width="1" height="18" fill="#92400e" />

            {/* Square Peach Head */}
            <rect x="9" y="6" width="14" height="7" fill="#fcd3a7" />
            {/* Solid Black Square Eyes */}
            <rect x="11" y="7" width="2" height="2" fill="#000000" />
            <rect x="19" y="7" width="2" height="2" fill="#000000" />
            {/* Gentle Black Smile */}
            <rect x="14" y="10" width="4" height="1" fill="#000000" />
            <rect x="13" y="9.5" width="1" height="1" fill="#000000" />
            <rect x="18" y="9.5" width="1" height="1" fill="#000000" />

            {/* Green Scout Fedora Hat with Center Crease */}
            <rect x="5" y="5" width="22" height="2" fill="#14532d" />
            <rect x="6" y="4" width="20" height="1" fill="#16a34a" />
            <rect x="9" y="0" width="14" height="5" fill="#16a34a" />
            <rect x="14" y="-1" width="4" height="2" fill="#14532d" /> {/* Center Crease */}
            <rect x="10" y="-1" width="4" height="1" fill="#22c55e" /> {/* Left peak */}
            <rect x="18" y="-1" width="4" height="1" fill="#22c55e" /> {/* Right peak */}
          </svg>
        </div>
      );

    // 11. PAK TEGUH - PENEBANG POHON HUTAN BIJAK (WISE WOODSMAN)
    case 'woodcutter':
      return (
        <div
          className={`${sizeClasses} bg-[#280c0c] rounded-xl flex items-center justify-center border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Shadow */}
            <ellipse cx="16" cy="29" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />
            {/* Boots & Work Jeans */}
            <rect x="9" y="24" width="5" height="5" fill="#1e3a8a" />
            <rect x="18" y="24" width="5" height="5" fill="#1e3a8a" />
            <rect x="8" y="27" width="6" height="3" fill="#451a03" />
            <rect x="18" y="27" width="6" height="3" fill="#451a03" />
            {/* Buffalo-Plaid Red-and-Black Flannel Shirt */}
            <rect x="8" y="13" width="16" height="11" fill="#dc2626" />
            <rect x="8" y="15" width="16" height="2" fill="#0f172a" />
            <rect x="8" y="19" width="16" height="2" fill="#0f172a" />
            <rect x="12" y="13" width="2" height="11" fill="#0f172a" />
            <rect x="18" y="13" width="2" height="11" fill="#0f172a" />
            {/* Split-Leather Work Apron with Brass Rivets */}
            <rect x="10" y="15" width="12" height="10" fill="#78350f" />
            <rect x="11" y="16" width="1" height="1" fill="#facc15" />
            <rect x="20" y="16" width="1" height="1" fill="#facc15" />
            {/* Tough Woodsman Face */}
            <rect x="10" y="6" width="12" height="8" fill="#fed7aa" />
            {/* Braided Chestnut Beard & Mustache */}
            <rect x="9" y="10" width="14" height="6" fill="#542d13" />
            <rect x="12" y="16" width="8" height="3" fill="#451a03" />
            <rect x="15" y="18" width="2" height="2" fill="#ca8a04" /> {/* Beard Ring */}
            {/* Kind Eyes */}
            <rect x="11" y="8" width="2" height="2" fill="#0f172a" />
            <rect x="19" y="8" width="2" height="2" fill="#0f172a" />
            {/* Forest Wool Ushanka Knit Watch Cap */}
            <rect x="8" y="3" width="16" height="4" fill="#065f46" />
            <rect x="10" y="1" width="12" height="3" fill="#047857" />
            <rect x="7" y="5" width="3" height="5" fill="#065f46" /> {/* Ear flap */}
            <rect x="22" y="5" width="3" height="5" fill="#065f46" />
            {/* Felling Axe with Carved Heart Rune */}
            <rect x="23" y="9" width="2" height="18" fill="#b45309" />
            <rect x="21" y="7" width="6" height="4" fill="#94a3b8" rx="0.5" />
            <rect x="21" y="7" width="2" height="4" fill="#f1f5f9" /> {/* Razor edge */}
            <rect x="23.5" y="14" width="1" height="1" fill="#f43f5e" /> {/* Heart rune */}
          </svg>
        </div>
      );

    // 12. IBU SARI - PETANI KEBUN BUAH (FRUIT ORCHARD FARMER)
    case 'fruit_farmer':
      return (
        <div
          className={`${sizeClasses} bg-[#192404] rounded-xl flex items-center justify-center border-2 border-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.3)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Shadow */}
            <ellipse cx="16" cy="29" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />
            {/* Rose-Red Farm Dress with Puff Sleeves */}
            <rect x="8" y="14" width="16" height="13" fill="#f43f5e" />
            {/* Emerald Gardener Apron with Strawberry Embroidery */}
            <rect x="10" y="15" width="12" height="11" fill="#10b981" />
            <rect x="14" y="20" width="4" height="4" fill="#059669" /> {/* Pocket */}
            <circle cx="16" cy="22" r="1.2" fill="#ef4444" /> {/* Strawberry */}
            <rect x="15.5" y="20.5" width="1" height="1" fill="#22c55e" />
            {/* Maternal Radiant Face & Silver Earrings */}
            <rect x="10" y="6" width="12" height="8" fill="#fed7aa" />
            <rect x="9" y="11" width="1" height="2" fill="#cbd5e1" /> {/* Earring */}
            <rect x="22" y="11" width="1" height="2" fill="#cbd5e1" />
            {/* Warm Rosy Cheeks & Smiling Eyes */}
            <rect x="9" y="11" width="3" height="2" fill="#fca5a5" />
            <rect x="20" y="11" width="3" height="2" fill="#fca5a5" />
            <rect x="11" y="8" width="2" height="2" fill="#0f172a" />
            <rect x="19" y="8" width="2" height="2" fill="#0f172a" />
            <rect x="14" y="12" width="4" height="1" fill="#e11d48" />
            {/* Woven Straw Sun Hat with Fluttering Scarlet Ribbon */}
            <polygon points="16,0 5,5 27,5" fill="#facc15" />
            <polygon points="16,1 7,5 25,5" fill="#eab308" />
            <rect x="6" y="4" width="20" height="2" fill="#dc2626" /> {/* Red ribbon */}
            <path d="M 24,5 Q 28,9 26,13" fill="none" stroke="#dc2626" strokeWidth="1.5" />
            {/* Willow Wicker Basket Overflowing with Fruit */}
            <rect x="2" y="16" width="8" height="8" fill="#78350f" rx="1" />
            <circle cx="4.5" cy="15.5" r="2" fill="#ef4444" /> {/* Red Apple */}
            <circle cx="7.5" cy="15.5" r="1.8" fill="#f59e0b" /> {/* Pear */}
            <circle cx="6" cy="14" r="1.5" fill="#8b5cf6" /> {/* Grape */}
          </svg>
        </div>
      );

    // 13. BUNG JALA - PEMANCING SABAR TEPI SUNGAI (RIVER ANGLER)
    case 'fisherman':
      return (
        <div
          className={`${sizeClasses} bg-[#041d28] rounded-xl flex items-center justify-center border-2 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)] overflow-hidden relative ${className}`}
        >
          <svg viewBox="0 0 32 32" className="w-full h-full p-0.5" style={svgStyle}>
            {/* Shadow */}
            <ellipse cx="16" cy="29" rx="10" ry="3.5" fill="rgba(0,0,0,0.4)" />
            {/* High Wading Rubber Boots */}
            <rect x="9" y="24" width="5" height="5" fill="#334155" />
            <rect x="18" y="24" width="5" height="5" fill="#334155" />
            {/* Sky Blue Linen Shirt */}
            <rect x="8" y="13" width="16" height="11" fill="#0284c7" />
            {/* Multi-Pocket Olive River Tackle Vest */}
            <rect x="8" y="13" width="5" height="9" fill="#65a30d" />
            <rect x="19" y="13" width="5" height="9" fill="#65a30d" />
            <rect x="9" y="15" width="3" height="3" fill="#4d7c0f" /> {/* Pockets */}
            <rect x="20" y="15" width="3" height="3" fill="#4d7c0f" />
            {/* Calm Sun-Tanned Face */}
            <rect x="10" y="6" width="12" height="8" fill="#fed7aa" />
            {/* Peaceful Meditative Half-Closed Eyes */}
            <line x1="11" y1="8.5" x2="14" y2="8.5" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="18" y1="8.5" x2="21" y2="8.5" stroke="#0f172a" strokeWidth="1.2" />
            {/* Olive Angler Bucket Hat with Colorful Fly Lures */}
            <rect x="6" y="3" width="20" height="3" fill="#ca8a04" />
            <rect x="9" y="0" width="14" height="4" fill="#a16207" />
            <rect x="20" y="1" width="2" height="2" fill="#ec4899" /> {/* Pink Lure */}
            <rect x="17" y="1" width="2" height="2" fill="#06b6d4" /> {/* Cyan Lure */}
            {/* Split-Bamboo Fishing Rod & Bobber */}
            <line x1="18" y1="18" x2="28" y2="4" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="20" cy="18" r="1.5" fill="#facc15" /> {/* Brass Reel */}
            {/* Red & White Float with Concentric Water Ripples */}
            <rect x="27" y="24" width="3" height="2" fill="#ef4444" />
            <rect x="27" y="26" width="3" height="2" fill="#ffffff" />
            <circle cx="28.5" cy="26" r="3.5" fill="none" stroke="rgba(56,189,248,0.5)" strokeWidth="0.8" />
          </svg>
        </div>
      );

    // =========================================================================
    // ANIMAL & ITEM SPRITES
    // =========================================================================
    case 'deer':
      return (
        <div
          className={`${sizeClasses} bg-[#2c1808] rounded-xl flex items-center justify-center border-2 border-amber-400 shadow-md ${className}`}
        >
          <span className="text-2xl select-none">🦌</span>
        </div>
      );

    case 'rabbit':
      return (
        <div
          className={`${sizeClasses} bg-[#062919] rounded-xl flex items-center justify-center border-2 border-emerald-400 shadow-md ${className}`}
        >
          <span className="text-2xl select-none">🐇</span>
        </div>
      );

    case 'cow':
      return (
        <div
          className={`${sizeClasses} bg-[#082032] rounded-xl flex items-center justify-center border-2 border-sky-400 shadow-md ${className}`}
        >
          <span className="text-2xl select-none">🐄</span>
        </div>
      );

    case 'sheep':
    case 'lamb':
      return (
        <div
          className={`${sizeClasses} bg-[#1e293b] rounded-xl flex items-center justify-center border-2 border-slate-300 shadow-md ${className}`}
        >
          <span className="text-2xl select-none">🐑</span>
        </div>
      );

    case 'compass_item':
      return (
        <div
          className={`${sizeClasses} bg-[#291703] rounded-xl flex items-center justify-center border-2 border-amber-300 shadow-md animate-pulse ${className}`}
        >
          <span className="text-2xl select-none">🧭</span>
        </div>
      );

    default:
      return (
        <div
          className={`${sizeClasses} bg-slate-800 rounded-xl flex items-center justify-center text-xl border-2 border-slate-600 shadow-md ${className}`}
        >
          <span>👤</span>
        </div>
      );
  }
};
