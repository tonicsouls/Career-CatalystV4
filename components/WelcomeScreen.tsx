
import React from 'react';
import { RocketLaunchIcon } from './icons/RocketLaunchIcon';
import { Cityscape } from '../assets/Cityscape';
import { CameraIcon } from './icons/CameraIcon';
import { JourneyIcon } from './icons/JourneyIcon';
import { CVIcon } from './icons/CVIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';

interface WelcomeScreenProps {
  onStartQuickStart: () => void;
  onGoToDashboard: () => void;
  onStartHeadshotGenerator: () => void;
  onStartJourney: () => void;
  onStartAssetHub: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartQuickStart, onGoToDashboard, onStartHeadshotGenerator, onStartJourney, onStartAssetHub }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 w-full opacity-80 z-0">
            <Cityscape />
        </div>
        <div className="relative z-10 bg-white/50 backdrop-blur-sm p-8 rounded-xl max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-800">Welcome to Career Catalyst</h1>
            <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
                Your AI-powered suite for accelerating your career transition. Let's build your standout professional assets.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={onStartQuickStart}
                    className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-lg text-white bg-neutral-800 hover:bg-neutral-700 shadow-lg hover:shadow-xl transition-all"
                >
                    <RocketLaunchIcon className="h-6 w-6" />
                    Quick Start (Recommended)
                </button>
                 <button
                    onClick={onStartHeadshotGenerator}
                    className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-lg text-neutral-800 bg-white border-2 border-neutral-800 hover:bg-neutral-100 shadow-lg hover:shadow-xl transition-all"
                >
                    <CameraIcon className="h-6 w-6" />
                    AI Headshot Generator
                </button>
            </div>
             <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                <button onClick={onStartJourney} className="text-md font-semibold text-neutral-700 hover:text-neutral-900 transition-colors">
                    Full Journey
                </button>
                 <button onClick={onStartAssetHub} className="text-md font-semibold text-neutral-700 hover:text-neutral-900 transition-colors">
                    Asset Hub
                </button>
                <button onClick={onGoToDashboard} className="text-md font-semibold text-neutral-700 hover:text-neutral-900 transition-colors">
                    All Tools
                </button>
             </div>
        </div>
         <div className="absolute bottom-10 left-0 right-0 z-20">
            <p className="text-neutral-500 text-sm mb-4">Featuring tools for every step of your journey:</p>
            <div className="flex justify-center items-center space-x-6 text-neutral-400">
                <JourneyIcon className="h-7 w-7" title="Career Catalyst Journey"/>
                <CVIcon className="h-7 w-7" title="Project Breakdown Assistant"/>
                <LinkedInIcon className="h-7 w-7" title="LinkedIn Optimizer"/>
                <MegaphoneIcon className="h-7 w-7" title="Elevator Pitch Generator"/>
                <ArchiveBoxIcon className="h-7 w-7" title="Asset Hub"/>
            </div>
        </div>
    </div>
  );
};

export default WelcomeScreen;