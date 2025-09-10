
import React from 'react';
import { JourneyIcon } from './icons/JourneyIcon';
import { CVIcon } from './icons/CVIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { CameraIcon } from './icons/CameraIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { GlobeIcon } from './icons/GlobeIcon';

interface FooterNavProps {
  onStartCatalyst: () => void;
  onStartProjectWizard: () => void;
  onGoToContinuousImprovement: () => void;
  onStartLinkedInOptimizer: () => void;
  onStartLinkedInBannerGenerator: () => void;
  onStartHeadshotGenerator: () => void;
  onStartAssetHub: () => void;
  onStartElevatorPitch: () => void;
  onStartWebsiteBuilder: () => void;
  isCIUnlocked: boolean;
}

const NavItem: React.FC<{
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}> = ({ title, icon, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        aria-label={title}
    >
        {icon}
        <span className="text-xs mt-1 text-center">{title}</span>
    </button>
);

const FooterNav: React.FC<FooterNavProps> = ({
    onStartCatalyst,
    onStartProjectWizard,
    onGoToContinuousImprovement,
    onStartLinkedInOptimizer,
    onStartLinkedInBannerGenerator,
    onStartHeadshotGenerator,
    onStartAssetHub,
    onStartElevatorPitch,
    onStartWebsiteBuilder,
    isCIUnlocked,
}) => {
    const apps = [
        { title: 'Journey', onClick: onStartCatalyst, icon: <JourneyIcon className="h-6 w-6" /> },
        { title: 'Project Wizard', onClick: onStartProjectWizard, icon: <CVIcon className="h-6 w-6" /> },
        { title: 'Improve', onClick: onGoToContinuousImprovement, icon: <ArrowPathIcon className="h-6 w-6" />, disabled: !isCIUnlocked },
        { title: 'LinkedIn', onClick: onStartLinkedInOptimizer, icon: <LinkedInIcon className="h-6 w-6" /> },
        { title: 'Elevator Pitch', onClick: onStartElevatorPitch, icon: <MegaphoneIcon className="h-6 w-6" /> },
        { title: 'Asset Hub', onClick: onStartAssetHub, icon: <ArchiveBoxIcon className="h-6 w-6" /> },
        { title: 'Headshot', onClick: onStartHeadshotGenerator, icon: <CameraIcon className="h-6 w-6" /> },
        { title: 'Website', onClick: onStartWebsiteBuilder, icon: <GlobeIcon className="h-6 w-6" /> },
    ];

    return (
        <footer className="bg-white/80 backdrop-blur-lg border-t border-neutral-200 flex-shrink-0">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-8 gap-1 py-2">
                    {apps.map(app => (
                        <NavItem key={app.title} {...app} />
                    ))}
                </div>
            </nav>
        </footer>
    );
};

export default FooterNav;
