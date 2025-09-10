import React from 'react';
import { Phase, PhaseStatus } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { LockIcon } from './icons/LockIcon';
import { ClockIcon } from './icons/ClockIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CubeIcon } from './icons/CubeIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { ChevronDoubleLeftIcon } from './icons/ChevronDoubleLeftIcon';

interface SideNavProps {
  phases: Phase[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onNavigate: (phaseId: string) => void;
}

const getStatusStyles = (status: PhaseStatus, isActive: boolean) => {
  let bgClass = '';
  let textClass = 'text-neutral-500';
  let iconContainerClass = 'bg-neutral-200 border-neutral-300';

  if (isActive) {
      bgClass = 'bg-amber-50';
      textClass = 'text-amber-800 font-semibold';
      iconContainerClass = 'border-amber-500 border-2 bg-white';
  } else {
    switch (status) {
      case PhaseStatus.Complete:
        textClass = 'text-neutral-700';
        iconContainerClass = 'bg-neutral-300 border-neutral-400';
        break;
      case PhaseStatus.Locked:
        textClass = 'text-neutral-400';
        iconContainerClass = 'bg-neutral-100 border-neutral-200';
        break;
    }
  }
  return { bgClass, textClass, iconContainerClass };
};

const getSectionIcon = (sectionName: string): React.ReactNode => {
    const iconClass = "h-6 w-6 text-neutral-500";
    switch(sectionName) {
        case 'Foundation': return <DocumentTextIcon className={iconClass} />;
        case 'AI Insight Report': return <SparklesIcon className={iconClass} />;
        case 'Deep Dive': return <CubeIcon className={iconClass} />;
        case 'Asset Generation': return <BriefcaseIcon className={iconClass} />;
        case 'Continuous Improvement': return <ArrowPathIcon className={iconClass} />;
        default: return <div className="h-6 w-6" />;
    }
}

const SideNav: React.FC<SideNavProps> = ({ phases, isOpen, setIsOpen, onNavigate }) => {
  const activePhase = phases.find(p => p.status === PhaseStatus.Active);

  const sections = phases.reduce((acc, phase) => {
    if (!acc[phase.section]) {
      acc[phase.section] = [];
    }
    acc[phase.section].push(phase);
    return acc;
  }, {} as Record<string, Phase[]>);
  
  const sectionKeys = Object.keys(sections);

  return (
    <aside className={`flex-shrink-0 bg-neutral-50 border-r border-neutral-200 transition-all duration-300 overflow-y-auto flex flex-col justify-between ${isOpen ? 'w-72' : 'w-20'}`}>
      <nav className={`transition-opacity duration-200 ${isOpen ? 'p-4 opacity-100' : 'p-2 opacity-100'}`}>
        <div className="space-y-4">
          {sectionKeys.map((sectionName, index) => {
            const sectionPhases = sections[sectionName];
            const isSectionComplete = sectionPhases.every(p => p.status === PhaseStatus.Complete);

            return (
              <div key={sectionName}>
                {isOpen ? (
                    <h2 className="px-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center">
                        Stage {index + 1}
                        {isSectionComplete && <CheckIcon className="h-4 w-4 ml-2 text-green-500" />}
                    </h2>
                ) : (
                    <div className="relative group flex justify-center">
                         <button onClick={() => setIsOpen(true)} className="p-3 rounded-lg hover:bg-neutral-200">
                             {getSectionIcon(sectionName)}
                         </button>
                         <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                             Stage {index + 1}: {sectionName}
                         </div>
                    </div>
                )}
                {isOpen && (
                    <ul className="mt-2 space-y-1">
                    {sectionPhases.map(phase => {
                        const isActive = activePhase?.id === phase.id;
                        const isLocked = phase.status === PhaseStatus.Locked;
                        const { bgClass, textClass, iconContainerClass } = getStatusStyles(phase.status, isActive);

                        return (
                        <li key={phase.id}>
                            <button 
                            onClick={() => onNavigate(phase.id)}
                            disabled={isLocked}
                            className={`w-full flex items-center p-2 rounded-md text-left transition-colors ${isActive ? bgClass : 'hover:bg-neutral-200/50'} disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${iconContainerClass}`}>
                                {phase.status === PhaseStatus.Complete && <CheckIcon className="h-5 w-5 text-neutral-600" />}
                                {isLocked && <LockIcon className="h-4 w-4 text-neutral-400" />}
                                {phase.status === PhaseStatus.Active && <span className="text-amber-700 font-bold">{phase.step}</span>}
                            </div>
                            <div className="ml-3">
                                <p className={`text-sm font-medium ${textClass}`}>{phase.name}</p>
                                {phase.timeEstimate && (
                                    <p className={`flex items-center text-xs ${isLocked ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                        <ClockIcon className="h-3 w-3 mr-1" />
                                        {phase.timeEstimate}
                                    </p>
                                )}
                            </div>
                            </button>
                        </li>
                        );
                    })}
                    </ul>
                )}
              </div>
            );
          })}
        </div>
      </nav>
      {isOpen && (
          <div className="p-2 border-t border-neutral-200 mt-4">
              <button onClick={() => setIsOpen(false)} className="w-full flex items-center space-x-3 p-2 text-neutral-600 hover:bg-neutral-200 rounded-md transition-colors">
                  <ChevronDoubleLeftIcon className="h-5 w-5" />
                  <span className="text-sm">Collapse Menu</span>
              </button>
          </div>
      )}
    </aside>
  );
};

export default SideNav;
