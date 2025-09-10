

import React from 'react';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { CameraIcon } from './icons/CameraIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { JourneyIcon } from './icons/JourneyIcon';
import { CVIcon } from './icons/CVIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { GlobeIcon } from './icons/GlobeIcon';

interface DashboardProps {
  onStartCatalyst: () => void;
  onGoToContinuousImprovement: () => void;
  onStartLinkedInOptimizer: () => void;
  onStartHeadshotGenerator: () => void;
  onStartProjectWizard: () => void;
  onStartAssetHub: () => void;
  onStartElevatorPitch: () => void;
  onStartWebsiteBuilder: () => void;
  isCIUnlocked: boolean;
}

const MajorAppCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isRecommended?: boolean;
  tag?: string;
  tagColor?: string;
}> = ({ icon, title, description, onClick, isRecommended = false, tag, tagColor = 'bg-amber-600' }) => (
  <button 
    onClick={onClick}
    className={`p-8 bg-white rounded-xl border-2 border-neutral-200 hover:border-neutral-800 hover:bg-white transition-all text-left group flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 shadow-lg hover:shadow-xl`}
  >
    <div className={`p-4 rounded-lg bg-neutral-100 w-fit`}>
        {icon}
    </div>
    <div className="flex-1">
        <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-neutral-800 group-hover:text-neutral-900 transition-colors">{title}</h3>
            {isRecommended && <span className="text-xs font-semibold bg-neutral-800 text-white px-2 py-0.5 rounded-full">Recommended Start</span>}
            {tag && <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded-full ${tagColor}`}>{tag}</span>}
        </div>
        <p className="mt-2 text-neutral-600">{description}</p>
    </div>
  </button>
);


const MinorAppCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, title, description, onClick, disabled = false }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`p-6 bg-white rounded-xl border border-neutral-200 hover:border-neutral-800 hover:bg-white transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-200 shadow-lg hover:shadow-xl`}
  >
    <div className={`p-3 rounded-lg bg-neutral-100 w-fit mb-4`}>
        {icon}
    </div>
    <div>
        <h3 className="text-lg font-bold text-neutral-800 group-hover:text-neutral-900 transition-colors">{title}</h3>
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
    </div>
  </button>
);

const Dashboard: React.FC<DashboardProps> = ({
    onStartCatalyst,
    onGoToContinuousImprovement,
    onStartLinkedInOptimizer,
    onStartHeadshotGenerator,
    onStartProjectWizard,
    onStartAssetHub,
    onStartElevatorPitch,
    onStartWebsiteBuilder,
    isCIUnlocked
}) => {
    return (
       <div className="max-w-5xl mx-auto my-10 p-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-neutral-800">The Career Catalyst Suite</h2>
                <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">Your all-in-one platform for professional development. Choose an application below to begin.</p>
            </div>
            <div className="space-y-6">
                <MajorAppCard 
                    icon={<JourneyIcon className="h-10 w-10 text-neutral-800" />}
                    title="Career Catalyst Journey"
                    description="The core experience. A guided, step-by-step process to build your foundational career assets from the ground up."
                    onClick={onStartCatalyst}
                    isRecommended={true}
                />
                 <MajorAppCard 
                    icon={<CVIcon className="h-10 w-10 text-neutral-800" />}
                    title="Project Breakdown Assistant"
                    description="Fast-track your story discovery. Use our guided, low-typing assistant to unpack your projects and accomplishments."
                    onClick={onStartProjectWizard}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                     <MinorAppCard 
                        icon={<ArrowPathIcon className="h-8 w-8 text-neutral-800" />}
                        title="Continuous Improvement"
                        description="Tailor assets, practice for interviews, and keep your materials sharp."
                        onClick={onGoToContinuousImprovement}
                        disabled={!isCIUnlocked}
                    />
                     <MinorAppCard 
                        icon={<LinkedInIcon className="h-8 w-8 text-neutral-800" />}
                        title="LinkedIn Optimizer"
                        description="Generate compelling headlines, summaries, and more."
                        onClick={onStartLinkedInOptimizer}
                    />
                    <MinorAppCard 
                        icon={<MegaphoneIcon className="h-8 w-8 text-neutral-800" />}
                        title="Elevator Pitch"
                        description="Craft and practice your 10-second and 2-minute elevator pitches."
                        onClick={onStartElevatorPitch}
                    />
                     <MinorAppCard 
                        icon={<CameraIcon className="h-8 w-8 text-neutral-800" />}
                        title="AI Headshot Generator"
                        description="Create a professional headshot from an existing photo."
                        onClick={onStartHeadshotGenerator}
                    />
                </div>
                 <MajorAppCard 
                    icon={<ArchiveBoxIcon className="h-10 w-10 text-neutral-800" />}
                    title="Asset Hub"
                    description="View, manage, and download all your saved assets, including resumes, headshots, and LinkedIn content."
                    onClick={onStartAssetHub}
                />
                <MajorAppCard 
                    icon={<GlobeIcon className="h-10 w-10 text-neutral-800" />}
                    title="Personal Website Session"
                    description="Take your drafts and projects to the next level with a personal website session. 90 minutes with an expert for only $50. Email to inquire."
                    onClick={() => { window.location.href = "mailto:Darryl.Erby@gmail.com?subject=Personal Website Builder Session Inquiry"; }}
                    tag="$50 Session"
                />
            </div>
       </div>
    );
};

export default Dashboard;