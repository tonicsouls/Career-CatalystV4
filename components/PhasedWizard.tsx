

import React from 'react';
import { BrainDumpModule, GeneratedResumeData, InitialAnalysisResult, Phase, PhaseStatus, SavedResumeVersion, TimelineEvent, JobPreset } from '../types';
import Phase1Foundation from './phases/Phase1Foundation';
import Phase2ResumeEnhancement from './phases/Phase2ResumeEnhancement';
import Phase3Experience from './phases/Phase3Experience';
import Phase4CvResume from './phases/Phase4CvResume';
import Phase5CoverLetter from './phases/Phase5CoverLetter';
import Phase6ContinuousImprovement from './phases/Phase6ContinuousImprovement';
import Phase4CvResumeGenerate from './phases/Phase4CvResumeGenerate';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import JourneyCompleteScreen from './JourneyCompleteScreen';

interface PhasedWizardProps {
  phases: Phase[];
  advanceToPhase: (phaseId: string) => void;
  onPhase1Complete: (analysisResult: InitialAnalysisResult, jdText: string, presetName: string, destination: 'journey' | 'dashboard') => void;
  openWizardOnLoad: boolean;
  setOpenWizardOnLoad: React.Dispatch<React.SetStateAction<boolean>>;
  activePreset: JobPreset | null;
  initialAnalysis: InitialAnalysisResult | null;
  setInitialAnalysis: (analysis: InitialAnalysisResult | null) => void;
  jobDescription: string;
  onResumeEnhancementComplete: (updatedResume: InitialAnalysisResult) => void;
  onExperienceConfirmationComplete: (updatedResume: InitialAnalysisResult, finalBrainDump: BrainDumpModule[]) => void;
  timelineEvents: TimelineEvent[];
  brainDumpModules: BrainDumpModule[];
  setBrainDumpModules: React.Dispatch<React.SetStateAction<BrainDumpModule[]>>;
  onPhase4Complete: () => void;
  generatedResume: GeneratedResumeData | null;
  setGeneratedResume: (resume: GeneratedResumeData | null) => void;
  onRefineProjections: (customInput: string) => Promise<GeneratedResumeData['careerProjections']>;
  savedResumeVersions: SavedResumeVersion[];
  setSavedResumeVersions: React.Dispatch<React.SetStateAction<SavedResumeVersion[]>>;
  generatedCoverLetter: string | null;
  setGeneratedCoverLetter: (letter: string | null) => void;
  onPhase5Complete: () => void;
  hasSeenCompletionScreen: boolean;
  setHasSeenCompletionScreen: (hasSeen: boolean) => void;
  onGoHome: () => void;
}

const PhasedWizard: React.FC<PhasedWizardProps> = (props) => {
  const activePhase = props.phases.find(p => p.status === PhaseStatus.Active);

  const renderActivePhase = () => {
    if (!activePhase) {
      return (
         <JourneyCompleteScreen onContinue={() => props.onGoHome()} />
      );
    }
    
    const phaseMap: { [key: string]: JSX.Element | null } = {
      'resume_jd': <Phase1Foundation onComplete={props.onPhase1Complete} initialAnalysis={props.initialAnalysis} activePreset={props.activePreset} />,
      'resume_enhancement': <Phase2ResumeEnhancement 
                              initialAnalysis={props.initialAnalysis}
                              jobDescription={props.jobDescription}
                              onComplete={props.onResumeEnhancementComplete}
                            />,
      'experience_confirmation': <Phase3Experience 
                                  initialAnalysis={props.initialAnalysis} 
                                  onComplete={props.onExperienceConfirmationComplete}
                                />,
      'cv_resume_generate': <Phase4CvResumeGenerate {...props} jobDescription={props.jobDescription} />,
      'cv_resume_review': <Phase4CvResume {...props} jobDescription={props.jobDescription} />,
      'cover_letter': <Phase5CoverLetter {...props} jobDescription={props.jobDescription} onComplete={props.onPhase5Complete} />,
      'continuous_improvement': (
        <Phase6ContinuousImprovement
            {...props}
            jobDescription={props.jobDescription}
            isInitialCompletion={!props.hasSeenCompletionScreen}
            onAcknowledgeCompletion={() => props.setHasSeenCompletionScreen(true)}
        />
      ),
    };

    return phaseMap[activePhase.id] || <div className="text-center p-8">Unknown phase.</div>;
  };

  const getPresetName = () => {
      if (props.activePreset) {
          return props.activePreset.name;
      }
      if (props.jobDescription) {
          return 'Current Session';
      }
      return null;
  };

  const presetName = getPresetName();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {presetName && activePhase?.id !== 'resume_jd' && (
         <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center space-x-3">
            <BriefcaseIcon className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">You are currently working on the application for:</p>
              <p className="font-bold text-lg">{presetName}</p>
            </div>
          </div>
      )}
      {renderActivePhase()}
    </div>
  );
};

export default PhasedWizard;