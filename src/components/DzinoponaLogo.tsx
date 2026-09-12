import React from 'react';

export interface DzinoponaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'emblem' | 'vector' | 'image' | 'dark' | 'light';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: { box: 'w-7 h-7', px: 28, text: 'text-xs', sub: 'text-[9px]' },
  sm: { box: 'w-9 h-9 sm:w-10 sm:h-10', px: 40, text: 'text-base sm:text-lg', sub: 'text-[10px]' },
  md: { box: 'w-12 h-12 sm:w-14 sm:h-14', px: 56, text: 'text-lg sm:text-xl', sub: 'text-xs' },
  lg: { box: 'w-16 h-16 sm:w-20 sm:h-20', px: 80, text: 'text-xl sm:text-2xl', sub: 'text-xs' },
  xl: { box: 'w-24 h-24 sm:w-28 sm:h-28', px: 112, text: 'text-2xl sm:text-3xl', sub: 'text-sm' },
  hero: { box: 'w-32 h-32 sm:w-40 sm:h-40', px: 160, text: 'text-3xl sm:text-4xl', sub: 'text-base' },
};

export const DzinoponaLogo: React.FC<DzinoponaLogoProps> = ({
  size = 'sm',
  variant = 'emblem',
  showText = false,
  className = '',
  onClick,
}) => {
  const currentSize = sizeMap[size];

  // Render SVG Vector Emblem (True to the uploaded seal with circular arched text, DF monogram, sun rays, mountains, furrowed fields, and wheat stalks)
  const renderSvgEmblem = (isDark = false) => (
    <svg
      viewBox="0 0 400 400"
      className={`${currentSize.box} shrink-0 transition-transform duration-300 group-hover:scale-105`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dzinopona Farms Official Seal"
    >
      <defs>
        {/* Gradients for metallic gold luster */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D061" />
          <stop offset="25%" stopColor="#E5A952" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="75%" stopColor="#C48A39" />
          <stop offset="100%" stopColor="#F3CA54" />
        </linearGradient>

        <linearGradient id="goldDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E5A952" />
          <stop offset="100%" stopColor="#996F2A" />
        </linearGradient>

        <radialGradient id="sealBackground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#142417" />
          <stop offset="70%" stopColor="#0B130D" />
          <stop offset="100%" stopColor="#050906" />
        </radialGradient>

        {/* Circular Text Paths for Arched Typography */}
        {/* Top Arc for "DZINOPONA" */}
        <path
          id="topArcPath"
          d="M 58,200 A 142,142 0 0,1 342,200"
          fill="none"
        />

        {/* Bottom Arc for "FARMS PRIVATE" */}
        <path
          id="bottomArcPath"
          d="M 342,200 A 142,142 0 0,1 58,200"
          fill="none"
        />
      </defs>

      {/* Main Medallion Background */}
      <circle cx="200" cy="200" r="195" fill="url(#sealBackground)" />

      {/* Outer Thick Golden Rim with Beaded Accent */}
      <circle
        cx="200"
        cy="200"
        r="192"
        stroke="url(#goldGradient)"
        strokeWidth="6"
      />
      <circle
        cx="200"
        cy="200"
        r="184"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
        strokeDasharray="4, 3"
        opacity="0.8"
      />

      {/* Inner Concentric Dividing Ring for Text Band */}
      <circle
        cx="200"
        cy="200"
        r="138"
        stroke="url(#goldGradient)"
        strokeWidth="4"
      />
      <circle
        cx="200"
        cy="200"
        r="134"
        stroke="url(#goldGradient)"
        strokeWidth="1"
      />

      {/* Arched Top Text: "DZINOPONA" */}
      <text
        fill="url(#goldGradient)"
        fontSize="31"
        fontWeight="800"
        fontFamily="Cinzel, 'Playfair Display', Georgia, serif"
        letterSpacing="0.28em"
        dominantBaseline="central"
      >
        <textPath
          href="#topArcPath"
          startOffset="50%"
          textAnchor="middle"
        >
          DZINOPONA
        </textPath>
      </text>

      {/* Arched Bottom Text: "FARMS PRIVATE" */}
      <text
        fill="url(#goldGradient)"
        fontSize="24"
        fontWeight="700"
        fontFamily="Cinzel, 'Playfair Display', Georgia, serif"
        letterSpacing="0.22em"
        dominantBaseline="central"
      >
        <textPath
          href="#bottomArcPath"
          startOffset="50%"
          textAnchor="middle"
        >
          FARMS PRIVATE
        </textPath>
      </text>

      {/* Decorative Star/Diamond Separators on Sides */}
      <g fill="url(#goldGradient)">
        <polygon points="46,200 52,195 58,200 52,205" />
        <polygon points="342,200 348,195 354,200 348,205" />
      </g>

      {/* ================= INNER ARTWORK ================= */}
      <g id="centerArtwork">
        {/* Clip inner circle for landscape */}
        <clipPath id="innerCircleClip">
          <circle cx="200" cy="200" r="132" />
        </clipPath>

        <g clipPath="url(#innerCircleClip)">
          {/* Inner Sky with Sunrays */}
          <rect x="68" y="68" width="264" height="264" fill="#0c160e" />

          {/* Radiating Golden Sunbeams */}
          <g stroke="url(#goldGradient)" strokeWidth="1.2" opacity="0.45">
            {/* Center sun position approx (200, 180) */}
            <line x1="200" y1="175" x2="200" y2="70" />
            <line x1="200" y1="175" x2="160" y2="76" />
            <line x1="200" y1="175" x2="240" y2="76" />
            <line x1="200" y1="175" x2="125" y2="95" />
            <line x1="200" y1="175" x2="275" y2="95" />
            <line x1="200" y1="175" x2="95" y2="125" />
            <line x1="200" y1="175" x2="305" y2="125" />
            <line x1="200" y1="175" x2="78" y2="160" />
            <line x1="200" y1="175" x2="322" y2="160" />
          </g>

          {/* Golden Sun Disc Rising */}
          <circle cx="200" cy="178" r="28" fill="url(#goldGradient)" opacity="0.3" />
          <circle cx="200" cy="178" r="20" stroke="url(#goldGradient)" strokeWidth="1.5" fill="none" opacity="0.8" />

          {/* Bold Central "DF" Monogram */}
          <text
            x="200"
            y="126"
            textAnchor="middle"
            fill="url(#goldGradient)"
            fontSize="34"
            fontWeight="900"
            fontFamily="'Cinzel', 'Playfair Display', Georgia, serif"
            letterSpacing="0.1em"
          >
            DF
          </text>

          {/* Majestic Mountain Peaks (Layered) */}
          {/* Back Range */}
          <path
            d="M 80,215 L 140,165 L 175,190 L 210,155 L 250,185 L 290,162 L 320,215 Z"
            fill="#09120b"
            stroke="url(#goldGradient)"
            strokeWidth="1"
            opacity="0.7"
          />

          {/* Front Mountain Range with ridge hachures */}
          <path
            d="M 75,225 L 135,172 L 180,205 L 200,168 L 225,200 L 265,168 L 325,225 Z"
            fill="#050a06"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
          />
          {/* Mountain Ridge Detail Lines */}
          <path
            d="M 135,172 L 145,225 M 200,168 L 198,225 M 265,168 L 255,225"
            stroke="url(#goldGradient)"
            strokeWidth="1"
            opacity="0.6"
          />
          <path
            d="M 135,172 L 120,225 M 200,168 L 212,225 M 265,168 L 280,225"
            stroke="url(#goldGradient)"
            strokeWidth="1"
            opacity="0.4"
          />

          {/* Agricultural Furrowed Field Rows Radiating Down */}
          <path
            d="M 70,225 Q 200,210 330,225 L 330,330 L 70,330 Z"
            fill="#08100a"
          />
          {/* Furrow Lines */}
          <g stroke="url(#goldGradient)" strokeWidth="1.2" opacity="0.65">
            <line x1="200" y1="215" x2="200" y2="330" />
            <line x1="200" y1="215" x2="165" y2="330" />
            <line x1="200" y1="215" x2="235" y2="330" />
            <line x1="200" y1="215" x2="130" y2="330" />
            <line x1="200" y1="215" x2="270" y2="330" />
            <line x1="200" y1="215" x2="95" y2="330" />
            <line x1="200" y1="215" x2="305" y2="330" />
          </g>

          {/* Foreground Golden Wheat / Maize Grain Stalks Rising Up */}
          <g id="wheatSheaves">
            {/* Center Wheat Ear */}
            <g transform="translate(200, 245)">
              <line x1="0" y1="0" x2="0" y2="70" stroke="url(#goldGradient)" strokeWidth="2.5" />
              {/* Grain Kernels Center */}
              {[-30, -20, -10, 0, 10, 20].map((y, idx) => (
                <g key={idx} fill="url(#goldGradient)">
                  <ellipse cx="-5" cy={y} rx="5" ry="3.5" transform={`rotate(-25, -5, ${y})`} />
                  <ellipse cx="5" cy={y} rx="5" ry="3.5" transform={`rotate(25, 5, ${y})`} />
                  <line x1="-5" y1={y} x2="-14" y2={y - 8} stroke="url(#goldGradient)" strokeWidth="0.8" />
                  <line x1="5" y1={y} x2="14" y2={y - 8} stroke="url(#goldGradient)" strokeWidth="0.8" />
                </g>
              ))}
              <ellipse cx="0" cy="-36" rx="4" ry="6" fill="url(#goldGradient)" />
              <line x1="0" y1="-36" x2="0" y2="-50" stroke="url(#goldGradient)" strokeWidth="0.8" />
            </g>

            {/* Left Wheat Ear (Angled) */}
            <g transform="translate(172, 255) rotate(-14)">
              <line x1="0" y1="0" x2="0" y2="60" stroke="url(#goldGradient)" strokeWidth="2" />
              {[-25, -15, -5, 5, 15].map((y, idx) => (
                <g key={idx} fill="url(#goldGradient)">
                  <ellipse cx="-4" cy={y} rx="4.5" ry="3" transform={`rotate(-25, -4, ${y})`} />
                  <ellipse cx="4" cy={y} rx="4.5" ry="3" transform={`rotate(25, 4, ${y})`} />
                  <line x1="-4" y1={y} x2="-12" y2={y - 6} stroke="url(#goldGradient)" strokeWidth="0.7" />
                  <line x1="4" y1={y} x2="12" y2={y - 6} stroke="url(#goldGradient)" strokeWidth="0.7" />
                </g>
              ))}
              <ellipse cx="0" cy="-30" rx="3.5" ry="5" fill="url(#goldGradient)" />
            </g>

            {/* Right Wheat Ear (Angled) */}
            <g transform="translate(228, 255) rotate(14)">
              <line x1="0" y1="0" x2="0" y2="60" stroke="url(#goldGradient)" strokeWidth="2" />
              {[-25, -15, -5, 5, 15].map((y, idx) => (
                <g key={idx} fill="url(#goldGradient)">
                  <ellipse cx="-4" cy={y} rx="4.5" ry="3" transform={`rotate(-25, -4, ${y})`} />
                  <ellipse cx="4" cy={y} rx="4.5" ry="3" transform={`rotate(25, 4, ${y})`} />
                  <line x1="-4" y1={y} x2="-12" y2={y - 6} stroke="url(#goldGradient)" strokeWidth="0.7" />
                  <line x1="4" y1={y} x2="12" y2={y - 6} stroke="url(#goldGradient)" strokeWidth="0.7" />
                </g>
              ))}
              <ellipse cx="0" cy="-30" rx="3.5" ry="5" fill="url(#goldGradient)" />
            </g>

            {/* Bottom Laurel Frame Leaves */}
            <path
              d="M 120,290 C 145,315 175,325 200,325 C 225,325 255,315 280,290"
              stroke="url(#goldGradient)"
              strokeWidth="2.5"
              fill="none"
            />
          </g>
        </g>
      </g>
    </svg>
  );

  // Render Image Version if user specifically asks for raster
  const renderImage = () => (
    <div
      className={`${currentSize.box} rounded-full overflow-hidden border-2 border-[#d4af37] shadow-lg bg-[#0b130d] shrink-0 group-hover:border-[#f3ca54] transition-colors`}
    >
      <img
        src="/assets/dzinopona_farms_logo.jpg"
        alt="Dzinopona Farms Official Logo"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to SVG if image file is loading
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    </div>
  );

  const emblemNode = variant === 'image' ? renderImage() : renderSvgEmblem();

  if (!showText) {
    return (
      <div
        className={`inline-flex items-center justify-center ${className}`}
        onClick={onClick}
      >
        {emblemNode}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {emblemNode}
      <div className="flex flex-col text-left">
        <span
          className={`font-serif font-bold tracking-tight text-[#162419] dark:text-[#faf9f5] leading-none ${currentSize.text}`}
        >
          DZINOPONA FARMS
        </span>
        <span
          className={`tracking-[0.18em] uppercase font-semibold text-[#8b6527] dark:text-[#d4af37] mt-1 ${currentSize.sub}`}
        >
          Private Limited • Zimbabwe
        </span>
      </div>
    </div>
  );
};
