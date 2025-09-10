

import React from 'react';
import { BrainDumpModule, GeneratedResumeData, Phase, PhaseStatus, SavedResumeVersion, TimelineEvent } from '../types';
import Phase1Foundation from './phases/Phase1Foundation';
import Phase2Insight from './phases/Phase2Insight';
import Phase3BrainDump from './phases/Phase3BrainDump';
import Phase4CvResume from './phases/Phase4CvResume';
import Phase5CoverLetter from './phases/Phase5CoverLetter';
import Phase6ContinuousImprovement from './phases/Phase6ContinuousImprovement';
import Phase4CvResumeGenerate from './phases/Phase4CvResumeGenerate';

interface PhasedWizardProps {
  phases: Phase[];
  advanceToPhase: (phaseId: string) => void;
  // Phase 1 props
  onPhase1Complete: (resumeTexts: string[], jdText: string) => void;
  onFillWithSampleData: () => void;
  openWizardOnLoad: boolean;
  setOpenWizardOnLoad: React.Dispatch<React.SetStateAction<boolean>>;
  // Phase 2 props
  timelineEvents: TimelineEvent[];
  setTimelineEvents: (events: TimelineEvent[]) => void;
  jobDescription: string;
  onPhase2Complete: (modules: BrainDumpModule[]) => void;
  // Phase 3 props
  brainDumpModules: BrainDumpModule[];
  setBrainDumpModules: React.Dispatch<React.SetStateAction<BrainDumpModule[]>>;
  onPhase3Complete: () => void;
  // Phase 4 & 5 props
  generatedResume: GeneratedResumeData | null;
  setGeneratedResume: (resume: GeneratedResumeData | null) => void;
  onPhase4Complete: () => void;
  onRefineProjections: (customInput: string) => Promise<GeneratedResumeData['careerProjections']>;
  savedResumeVersions: SavedResumeVersion[];
  setSavedResumeVersions: React.Dispatch<React.SetStateAction<SavedResumeVersion[]>>;
  generatedCoverLetter: string | null;
  setGeneratedCoverLetter: (letter: string | null) => void;
  onPhase5Complete: () => void;
  // Phase 6 props
  hasSeenCompletionScreen: boolean;
  setHasSeenCompletionScreen: (hasSeen: boolean) => void;
}

const PhasedWizard: React.FC<PhasedWizardProps> = (props) => {
  const activePhase = props.phases.find(p => p.status === PhaseStatus.Active);

  const renderActivePhase = () => {
    if (!activePhase) {
      return (
        <div className="text-center p-12 bg-slate-800 rounded-lg">
            <h2 className="text-2xl font-bold text-slate-100">Journey Complete!</h2>
            <p className="mt-2 text-slate-400">You have completed all available steps. More features are coming soon!</p>
        </div>
      );
    }
    
    // FIX: Corrected a type mismatch where PhasedWizard passed TimelineEvent[] to Phase3BrainDump,
    // which was incorrectly expecting ProjectDetails[]. The props are now explicitly passed to ensure
    // the correct types are used, resolving the error.
    const phaseMap: { [key: string]: JSX.Element | null } = {
      'resume_jd': <Phase1Foundation {...props} onComplete={props.onPhase1Complete} />,
      'timeline': <Phase2Insight {...props} onComplete={props.onPhase2Complete} />,
      'braindump': <Phase3BrainDump 
                      modules={props.brainDumpModules} 
                      setModules={props.setBrainDumpModules} 
                      onComplete={props.onPhase3Complete} 
                      timelineEvents={props.timelineEvents}
                      openWizardOnLoad={props.openWizardOnLoad}
                      setOpenWizardOnLoad={props.setOpenWizardOnLoad}
                   />,
      'cv_resume_generate': <Phase4CvResumeGenerate {...props} />,
      'cv_resume_review': <Phase4CvResume {...props} />,
      'cover_letter': <Phase5CoverLetter {...props} onComplete={props.onPhase5Complete} />,
      'continuous_improvement': (
        <Phase6ContinuousImprovement
            {...props}
            isInitialCompletion={!props.hasSeenCompletionScreen}
            onAcknowledgeCompletion={() => props.setHasSeenCompletionScreen(true)}
        />
      ),
    };

    return phaseMap[activePhase.id] || <div className="text-center p-8">Unknown phase.</div>;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {renderActivePhase()}
    </div>
  );
};

export default PhasedWizard;