import React from 'react';
import { Logo } from './Logo';

interface LoadingOverlayProps {
    isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
            <Logo className="h-16 w-16 text-neutral-800 animate-pulse" />
            <p className="mt-4 text-lg font-semibold text-neutral-700">AI is preparing the next step...</p>
        </div>
    );
};

export default LoadingOverlay;
