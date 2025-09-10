import React from 'react';

export const BrainDumpIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 170" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <filter id="brain-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="stream-grad" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0"/>
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.8"/>
      </linearGradient>
    </defs>

    {/* Head Outline */}
    <path
      d="M85.5 169C57.5 169 52 148.5 50.5 137C44.5 120.5 24 116 12 100C-3.5 80.5 1.57813 42.5 24.5 21C47.4219 -0.5 82.5 2.5 97.5 22.5C112.5 42.5 106 63 93 78C89.5 82.5 87.5 88.5 87.5 94.5C87.5 107.5 91.5 116 99.5 121.5C108.5 127.5 109 148.5 85.5 169Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeOpacity="0.7"
    />

    {/* Particles */}
    <g opacity="0.8" filter="url(#brain-glow)" fill="currentColor">
      <circle cx="70" cy="50" r="2.5" />
      <circle cx="85" cy="35" r="1.5" />
      <circle cx="65" cy="70" r="2" />
      <circle cx="95" cy="60" r="1" />
      <circle cx="110" cy="45" r="2.5" />
      <circle cx="125" cy="30" r="1.5" />
      <circle cx="140" cy="20" r="2" />
      <circle cx="155" cy="15" r="1.5" />
      <rect x="120" y="55" width="4" height="4" rx="1" />
      <rect x="135" y="40" width="3" height="3" rx="1" />
      <rect x="150" y="30" width="4" height="4" rx="1" />
    </g>

    {/* Streams */}
    <g stroke="url(#stream-grad)" strokeWidth="2" filter="url(#brain-glow)">
      <path d="M75 80 C 100 75, 120 70, 150 60" />
      <path d="M80 95 C 110 90, 130 85, 160 70" />
    </g>

    {/* Structured Blocks */}
    <g fill="currentColor" opacity="0.7">
      <rect x="165" y="10" width="30" height="8" rx="2"/>
      <rect x="155" y="22" width="40" height="5" rx="2"/>
      <rect x="170" y="31" width="25" height="5" rx="2"/>

      <rect x="150" y="45" width="15" height="15" rx="2"/>
      <rect x="170" y="48" width="25" height="4" rx="1"/>
      <rect x="170" y="56" width="25" height="4" rx="1"/>

      <rect x="165" y="68" width="30" height="8" rx="2"/>
      <rect x="160" y="80" width="35" height="5" rx="2"/>
    </g>
  </svg>
);