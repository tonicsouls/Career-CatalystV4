import React from 'react';

export const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20 3.33331C10.8333 3.33331 3.33331 10.8333 3.33331 20C3.33331 29.1666 10.8333 36.6666 20 36.6666C29.1666 36.6666 36.6666 29.1666 36.6666 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 3.33331L25.4167 8.74998" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 36.6666L14.5833 31.25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.33331 20L8.74998 14.5833" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M36.6666 20L31.25 25.4167" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="20" cy="20" r="3.33333" fill="currentColor"/>
  </svg>
);