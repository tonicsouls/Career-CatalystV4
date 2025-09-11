import React from 'react';

// FIX: Added title prop to component props to allow passing a title for accessibility.
export const JourneyIcon: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }> = ({ title, ...props }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    {title && <title>{title}</title>}
    <defs>
      <filter id="journey-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path
      d="M15 85 C 30 70, 25 30, 50 50 S 70 15, 85 15"
      stroke="currentColor"
      strokeOpacity="0.5"
      strokeWidth="4"
      strokeLinecap="round"
      filter="url(#journey-glow)"
    />
    <circle cx="15" cy="85" r="7" fill="white" />
    <circle cx="50" cy="50" r="7" fill="white" />
    <circle cx="85" cy="15" r="7" fill="white" />
  </svg>
);