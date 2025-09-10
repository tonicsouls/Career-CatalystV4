import React from 'react';

export const TimelineEmptyStateIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 400 50" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <filter id="empty-state-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="25" cy="25" r="12" fill="currentColor" filter="url(#empty-state-glow)" />
    <path
      d="M45 25 H 390"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="5 5"
      strokeOpacity="0.6"
    />
    <text
      x="45"
      y="18"
      fontFamily="sans-serif"
      fontSize="12"
      fill="#D1D5DB"
    >
      Start your journey by adding your first career event...
    </text>
  </svg>
);