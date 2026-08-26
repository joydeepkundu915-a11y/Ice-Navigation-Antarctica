import React from 'react';

interface IcebergLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const IcebergLogo: React.FC<IcebergLogoProps> = ({
  className = '',
  size = 40,
  glow = true
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div 
          className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md pointer-events-none animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-md"
      >
        <defs>
          {/* Gradients for Iceberg Facets */}
          <linearGradient id="iceTipGrad" x1="50" y1="10" x2="35" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="iceTipGradRight" x1="50" y1="10" x2="70" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="50%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="iceKeelGradLeft" x1="50" y1="46" x2="25" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          <linearGradient id="iceKeelGradRight" x1="50" y1="46" x2="75" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="60%" stopColor="#0c4a6e" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>

          <linearGradient id="waterlineGrad" x1="10" y1="46" x2="90" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f2fe" stopOpacity="0" />
            <stop offset="20%" stopColor="#00f2fe" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="80%" stopColor="#00f2fe" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
          </linearGradient>

          <filter id="iceGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Submerged Iceberg Keel (Massive Deep Structure below Waterline) */}
        {/* Keel Left Facet */}
        <polygon
          points="50,46 22,46 16,68 34,92 50,88"
          fill="url(#iceKeelGradLeft)"
          opacity="0.85"
        />
        {/* Keel Right Facet */}
        <polygon
          points="50,46 78,46 84,66 68,92 50,88"
          fill="url(#iceKeelGradRight)"
          opacity="0.9"
        />
        {/* Keel Center Crevasse line */}
        <polyline
          points="50,46 46,65 50,88"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Exposed Iceberg Tip (Above Waterline 10-15%) */}
        {/* Left Sunlit Peak */}
        <polygon
          points="50,12 30,46 50,46"
          fill="url(#iceTipGrad)"
        />
        {/* Right Shaded Peak */}
        <polygon
          points="50,12 70,46 50,46"
          fill="url(#iceTipGradRight)"
        />
        {/* Secondary Left Needle Peak */}
        <polygon
          points="35,26 22,46 36,46"
          fill="#e0f2fe"
          opacity="0.9"
        />
        {/* Secondary Right Ridge */}
        <polygon
          points="62,28 78,46 62,46"
          fill="#38bdf8"
          opacity="0.85"
        />

        {/* Crystalline Highlight Ridges on Peak */}
        <polyline
          points="50,12 48,30 50,46"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <polyline
          points="35,26 38,36 36,46"
          stroke="#ffffff"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Water Surface Line */}
        <line
          x1="8"
          y1="46"
          x2="92"
          y2="46"
          stroke="url(#waterlineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Subtle Water Ripples */}
        <path
          d="M 14 50 Q 24 48 34 50 Q 44 52 54 50 Q 64 48 74 50 Q 84 52 88 50"
          stroke="#38bdf8"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
          fill="none"
        />
      </svg>
    </div>
  );
};