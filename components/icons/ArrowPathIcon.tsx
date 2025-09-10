import React from 'react';

export const ArrowPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 10l3 3-3 3"></path>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 14l-3-3 3-3"></path>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20a7 7 0 01-10 0"></path>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4a7 7 0 0110 0"></path>
  </svg>
);