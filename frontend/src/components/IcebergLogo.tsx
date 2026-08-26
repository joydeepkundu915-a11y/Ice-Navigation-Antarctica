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
          className="absolute inset-0 rounded-full bg-amber-400/25 blur-md pointer-events-none animate-pulse"
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
          {/* Gradients for Iceberg Peak */}
          <linearGradient id="iceTipGrad" x1="50" y1="10" x2="35" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="80%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="iceTipGradRight" x1="50" y1="10" x2="70" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="40%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Gradients for Deep Submerged Keel */}
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

          {/* Radiant Golden-Cyan Auroral Waterline Line */}
          <linearGradient id="goldWaterlineGrad" x1="5" y1="46" x2="95" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="20%" stopColor="#00f2fe" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#fef08a" stopOpacity="1" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
            <stop offset="60%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="80%" stopColor="#00f2fe" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>

          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Submerged Keel (Massive Deep Structure below Waterline) */}
        <polygon
          points="50,46 22,46 16,68 34,92 50,88"
          fill="url(#iceKeelGradLeft)"
          opacity="0.85"
        />
        <polygon
          points="50,46 78,46 84,66 68,92 50,88"
          fill="url(#iceKeelGradRight)"
          opacity="0.9"
        />
        <polyline
          points="50,46 46,65 50,88"
          stroke="#38bdf8"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Exposed Peak (Above Waterline) with Golden Shimmer Highlights */}
        <polygon
          points="50,12 30,46 50,46"
          fill="url(#iceTipGrad)"
        />
        <polygon
          points="50,12 70,46 50,46"
          fill="url(#iceTipGradRight)"
        />
        <polygon
          points="35,26 22,46 36,46"
          fill="#fef9c3"
          opacity="0.85"
        />
        <polygon
          points="62,28 78,46 62,46"
          fill="#38bdf8"
          opacity="0.85"
        />

        {/* Crystalline Golden Highlight Ridges */}
        <polyline
          points="50,12 48,30 50,46"
          stroke="#fef08a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <polyline
          points="35,26 38,36 36,46"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Attractive Radiant Golden Water Surface Line with Outer Halo */}
        <line
          x1="6"
          y1="46"
          x2="94"
          y2="46"
          stroke="#fbbf24"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.4"
        />
        <line
          x1="6"
          y1="46"
          x2="94"
          y2="46"
          stroke="url(#goldWaterlineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Soft Golden Water Ripples */}
        <path
          d="M 12 50 Q 22 48 32 50 Q 42 52 52 50 Q 62 48 72 50 Q 82 52 88 50"
          stroke="#fef08a"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
          fill="none"
        />
      </svg>
    </div>
  );
};