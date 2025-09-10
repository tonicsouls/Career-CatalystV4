import React from 'react';

export const TimelineIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <filter id="timeline-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Wavy Line */}
    <path
      d="M10 50 C 30 70, 40 30, 60 50 S 80 80, 100 50 S 120 20, 140 50 S 160 70, 180 50"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeOpacity="0.7"
    />

    {/* Nodes */}
    <g fill="currentColor" filter="url(#timeline-glow)">
      <circle cx="10" cy="50" r="5" />
      <circle cx="35" cy="58" r="5" />
      <circle cx="60" cy="50" r="5" />
      <circle cx="80" cy="70" r="5" />
      <circle cx="100" cy="50" r="5" />
      <circle cx="120" cy="30" r="5" />
      <circle cx="140" cy="50" r="5" />
      <circle cx="160" cy="62" r="5" />
      <circle cx="180" cy="50" r="5" />
    </g>
  </svg>
);