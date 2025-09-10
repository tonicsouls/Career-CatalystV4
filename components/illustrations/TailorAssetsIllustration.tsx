import React from 'react';

export const TailorAssetsIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="tailor-path-grad" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="white" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.8" />
            </linearGradient>
            <filter id="tailor-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        {/* Main Path */}
        <path 
            d="M10 80 C 50 20, 150 20, 190 80"
            stroke="url(#tailor-path-grad)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#tailor-glow)"
        />

        {/* Data Points and Lines */}
        <g stroke="currentColor" strokeOpacity="0.6" strokeWidth="1">
            {/* Left side */}
            <line x1="25" y1="20" x2="35" y2="52" />
            <line x1="45" y1="10" x2="52" y2="38" />
            <line x1="60" y1="60" x2="68" y2="31" />
            <line x1="80" y1="5" x2="85" y2="25" />
            
            {/* Right side */}
            <line x1="120" y1="5" x2="115" y2="25" />
            <line x1="140" y1="60" x2="132" y2="31" />
            <line x1="160" y1="15" x2="150" y2="36" />
            <line x1="180" y1="40" x2="168" y2="58" />
             <line x1="185" y1="10" x2="175" y2="50" />
        </g>
        
        <g fill="currentColor" fillOpacity="0.8">
            <circle cx="25" cy="20" r="2.5" />
            <circle cx="45" cy="10" r="2" />
            <circle cx="60" cy="60" r="3" />
            <circle cx="80" cy="5" r="2.5" />
            <circle cx="75" cy="75" r="2" />
            
            <circle cx="120" cy="5" r="2.5" />
            <circle cx="140" cy="60" r="3" />
            <circle cx="160" cy="15" r="2" />
            <circle cx="180" cy="40" r="2.5" />
            <circle cx="125" cy="78" r="2" />
            <circle cx="185" cy="10" r="2" />
        </g>
    </svg>
);