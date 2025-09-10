import React from 'react';

export const CVIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <filter id="cv-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <text
      x="50"
      y="60"
      fontFamily="Arial, sans-serif"
      fontSize="50"
      fontWeight="bold"
      fill="currentColor"
      textAnchor="middle"
      filter="url(#cv-glow)"
    >
      <tspan>C</tspan>
      <tspan dx="-5">V</tspan>
    </text>
  </svg>
);
