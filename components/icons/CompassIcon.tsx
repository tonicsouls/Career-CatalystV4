import React from 'react';

export const CompassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="compass-needle-grad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#A5B4FC" />
      </linearGradient>
      <filter id="compass-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" strokeOpacity="0.7" />
    <path
      d="M50 15 L60 50 L50 85 L40 50 Z"
      fill="url(#compass-needle-grad)"
      stroke="#E0E7FF"
      strokeWidth="1"
      filter="url(#compass-glow)"
    />
    <text x="46" y="12" fontSize="10" fill="currentColor" fontFamily="sans-serif">N</text>
    <text x="46" y="94" fontSize="10" fill="currentColor" fontFamily="sans-serif">S</text>
    <text x="88" y="54" fontSize="10" fill="currentColor" fontFamily="sans-serif">E</text>
    <text x="5"  y="54" fontSize="10" fill="currentColor" fontFamily="sans-serif">W</text>
  </svg>
);