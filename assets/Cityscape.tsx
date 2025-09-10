import React from 'react';

export const Cityscape: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 1440 450" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <style>{`
        .sky { fill: #f5f5f5; } /* neutral-100 */
        .city-far { fill: #e5e5e5; } /* neutral-200 */
        .city-mid { fill: #d4d4d4; } /* neutral-300 */
        .city-near { fill: #a3a3a3; } /* neutral-400 */

        #stars {
            animation: twinkle 60s linear infinite;
        }
        #cityFar {
            animation: pan 90s linear infinite alternate;
            transform-origin: 50% 100%;
        }
        #cityMid {
            animation: pan 60s linear infinite alternate;
            transform-origin: 50% 100%;
        }
        #cityNear {
            animation: pan 40s linear infinite alternate;
            transform-origin: 50% 100%;
        }

        @keyframes twinkle {
            0% { opacity: 0.8; }
            50% { opacity: 0.4; }
            100% { opacity: 0.8; }
        }
        @keyframes pan {
            from { transform: translateX(-5%); }
            to { transform: translateX(5%); }
        }
    `}</style>
    <rect width="1440" height="450" className="sky"/>
    <g id="stars" opacity="0.8">
        <circle cx="150" cy="50" r="1" fill="#a3a3a3"/>
        <circle cx="250" cy="80" r="0.5" fill="#a3a3a3"/>
        <circle cx="350" cy="30" r="1" fill="#a3a3a3"/>
        <circle cx="450" cy="90" r="0.7" fill="#a3a3a3"/>
        <circle cx="550" cy="60" r="1" fill="#a3a3a3"/>
        <circle cx="650" cy="20" r="0.5" fill="#a3a3a3"/>
        <circle cx="750" cy="70" r="1" fill="#a3a3a3"/>
        <circle cx="850" cy="40" r="0.7" fill="#a3a3a3"/>
        <circle cx="950" cy="100" r="1" fill="#a3a3a3"/>
        <circle cx="1050" cy="50" r="0.5" fill="#a3a3a3"/>
        <circle cx="1150" cy="80" r="1" fill="#a3a3a3"/>
        <circle cx="1250" cy="30" r="0.7" fill="#a3a3a3"/>
        <circle cx="1350" cy="90" r="1" fill="#a3a3a3"/>
        <circle cx="50" cy="120" r="0.5" fill="#a3a3a3"/>
        <circle cx="100" cy="150" r="1" fill="#a3a3a3"/>
        <circle cx="200" cy="110" r="0.7" fill="#a3a3a3"/>
    </g>
    <g id="cityFar" className="city-far">
        <rect x="200" y="250" width="100" height="200"/>
        <rect x="310" y="300" width="50" height="150"/>
        <rect x="500" y="220" width="120" height="230"/>
        <rect x="630" y="280" width="80" height="170"/>
        <rect x="800" y="260" width="90" height="190"/>
        <rect x="900" y="310" width="60" height="140"/>
        <rect x="1100" y="240" width="110" height="210"/>
        <rect x="1220" y="290" width="70" height="160"/>
    </g>
    <g id="cityMid" className="city-mid">
        <rect x="100" y="300" width="150" height="150"/>
        <rect x="260" y="350" width="80" height="100"/>
        <rect x="400" y="280" width="180" height="170"/>
        <rect x="590" y="320" width="120" height="130"/>
        <rect x="750" y="300" width="160" height="150"/>
        <rect x="920" y="360" width="100" height="90"/>
        <rect x="1050" y="290" width="170" height="160"/>
        <rect x="1230" y="340" width="90" height="110"/>
    </g>
    <g id="cityNear" className="city-near">
        <rect x="-50" y="350" width="200" height="100"/>
        <rect x="160" y="400" width="100" height="50"/>
        <rect x="300" y="320" width="250" height="130"/>
        <rect x="560" y="380" width="150" height="70"/>
        <rect x="720" y="340" width="220" height="110"/>
        <rect x="950" y="410" width="120" height="40"/>
        <rect x="1100" y="330" width="230" height="120"/>
        <rect x="1340" y="390" width="150" height="60"/>
    g>
  </svg>
);