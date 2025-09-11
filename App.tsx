

import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './components/icons/SparklesIcon';
import PhasedWizard from './components/PhasedWizard';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TimelineEvent, Phase, PhaseStatus, BrainDumpModule, GeneratedResumeData, SavedResumeVersion, ChatMessage, SavedLinkedInContent, HistoryState, ActiveApp, InitialAnalysisResult, JobPreset } from './types';
import { sampleTimelineEvents, sampleJobDescription } from './utils/sampleData';
import SideNav from './components/SideNav';
import { MenuIcon } from './components/icons/MenuIcon';
import { regenerateProjections, structureInitialBrainDump, extractJobTitleFromJD } from './services/geminiService';
import LinkedInOptimizer from './components/LinkedInOptimizer';
import HeadshotGenerator from './components/HeadshotGenerator';
import Dashboard from './components/Dashboard';
import LinkedInBannerGenerator from './components/LinkedInBannerGenerator';
import { Logo } from './components/Logo';
import { GoogleGenAI, Chat } from "@google/genai";
import { HelpIcon } from './components/icons/HelpIcon';
import Chatbot from './components/Chatbot';
import { ArrowLeftIcon } from './components/icons/ArrowLeftIcon';
import FooterNav from './components/FooterNav';
import AssetHub from './components/AssetHub';
import ElevatorPitchGenerator from './components/ElevatorPitchGenerator';
import WebsiteBuilderModal from './components/WebsiteBuilderModal';
import LoadingOverlay from './components/LoadingOverlay';
import ToastNotification from './components/ToastNotification';
import WelcomeScreen from './components/WelcomeScreen';


const initialPhases: Phase[] = [
    { id: 'resume_jd', name: 'Upload & Analyze', status: PhaseStatus.Active, section: 'Foundation', step: 1, timeEstimate: 'Est. 2 mins' },
    { id: 'resume_enhancement', name: 'Enhance Resume', status: PhaseStatus.Locked, section: 'Foundation', step: 2, timeEstimate: 'Est. 5-10 mins' },
    { id: 'experience_confirmation', name: 'Confirm & Enhance Experience', status: PhaseStatus.Locked, section: 'Foundation', step: 3, timeEstimate: 'Est. 15-20 mins' },
    { id: 'cv_resume_generate', name: 'Generate Resume', status: PhaseStatus.Locked, section: 'Asset Generation', step: 1, timeEstimate: 'Est. 2 mins' },
    { id: 'cv_resume_review', name: 'Review & Edit Resume', status: PhaseStatus.Locked, section: 'Asset Generation', step: 2, timeEstimate: 'Est. 5-10 mins' },
    { id: 'cover_letter', name: 'Generate Cover Letter', status: PhaseStatus.Locked, section: 'Asset Generation', step: 3, timeEstimate: 'Est. 3-5 mins' },
    { id: 'continuous_improvement', name: 'Improve & Tailor', status: PhaseStatus.Locked, section: 'Continuous Improvement', step: 1, timeEstimate: 'Ongoing' },
];

const App: React.FC = () => {
  const [phases, setPhases] = useLocalStorage<Phase[]>('appPhases_v11', initialPhases);
  const [timelineEvents, setTimelineEvents] = useLocalStorage<TimelineEvent[]>('timelineEvents_v4', []);
  const [jobDescription, setJobDescription] = useLocalStorage<string>('jobDescription_v4', '');
  const [brainDumpModules, setBrainDumpModules] = useLocalStorage<BrainDumpModule[]>('brainDumpModules_v5', []);
  const [generatedResume, setGeneratedResume] = useLocalStorage<GeneratedResumeData | null>('generatedResume_v3', null);
  const [savedResumeVersions, setSavedResumeVersions] = useLocalStorage<SavedResumeVersion[]>('savedResumeVersions_v3', []);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useLocalStorage<string | null>('generatedCoverLetter_v3', null);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeApp, setActiveApp] = useState<ActiveApp>('welcome');
  const [openWizardOnLoad, setOpenWizardOnLoad] = useState(false);
  
  const [savedHeadshots, setSavedHeadshots] = useLocalStorage<string[]>('savedHeadshots_v1', []);
  const [savedLinkedInContent, setSavedLinkedInContent] = useLocalStorage<SavedLinkedInContent[]>('savedLinkedInContent_v1', []);
  const [initialAnalysis, setInitialAnalysis] = useLocalStorage<InitialAnalysisResult | null>('initialAnalysis_v2', null);
  const [jobPresets, setJobPresets] = useLocalStorage<JobPreset[]>('jobPresets_v2', []);
  const [activePresetId, setActivePresetId] = useLocalStorage<string | null>('activePresetId_v2', null);


  const [hasSeenCompletionScreen, setHasSeenCompletionScreen] = useLocalStorage('hasSeenCompletionScreen_v1', false);

  const [chat, setChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const [history, setHistory] = useLocalStorage<HistoryState[]>('appHistory_v2', []);
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const systemInstruction = `You are a helpful and encouraging AI assistant for the Career Catalyst Suite. Be concise and helpful. You can answer questions about the app's features or provide general career advice. If the user provides their career data as context, use it to answer their questions about their own career.`;
          const newChat = ai.chats.create({
              model: 'gemini-2.5-flash',
              config: { systemInstruction },
          });
          setChat(newChat);
      } catch(e) {
          console.error("Failed to initialize chatbot:", e);
      }
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!chat) return;

    const userMessage: ChatMessage = { role: 'user', text: message };
    setChatHistory(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    let context = "";
    if (timelineEvents.length > 0) {
        context += "User's Career Timeline:\n" + JSON.stringify(timelineEvents, null, 2) + "\n\n";
    }
    if (brainDumpModules.length > 0) {
        context += "User's Brain Dump Stories:\n" + JSON.stringify(brainDumpModules, null, 2) + "\n\n";
    }
    if (generatedResume) {
        context += "User's Generated Resume Summary:\n" + generatedResume.executiveSummaries[0] + "\n\n";
    }

    const finalMessage = context 
      ? `Based on the following user data:\n\n---\n${context}---\n\nPlease answer the user's question: "${message}"`
      : message;

    try {
        const response = await chat.sendMessage({ message: finalMessage });
        const modelMessage: ChatMessage = { role: 'model', text: response.text };
        setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatLoading(false);
    }
  };
  
  const showToast = (message: string) => {
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3000);
  }

  const pushToHistory = () => {
    setHistory(prev => [...prev, { activeApp, phases }]);
  };

  const handleBack = () => {
    const lastState = history[history.length - 1];
    
    if (!lastState) {
        setActiveApp('welcome');
        return;
    }

    if (lastState.activeApp === 'dashboard' || lastState.activeApp === 'welcome') {
        setActiveApp('welcome');
        setHistory([]);
    } else {
        setActiveApp(lastState.activeApp);
        setPhases(lastState.phases);
        setHistory(prev => prev.slice(0, -1));
    }
  };


  const navigateToPhase = (phaseId: string) => {
    pushToHistory();
    setPhases(prevPhases => {
        const targetPhaseIndex = prevPhases.findIndex(p => p.id === phaseId);
        if (targetPhaseIndex === -1) return prevPhases;
        
        if(prevPhases[targetPhaseIndex].status === PhaseStatus.Locked) return prevPhases;

        return prevPhases.map((phase, index) => {
            if (index === targetPhaseIndex) return { ...phase, status: PhaseStatus.Active };
            return phase;
        });
    });
  };

  const advanceToPhase = (nextPhaseId: string) => {
     setIsTransitioning(true);
     setTimeout(() => {
        setPhases(prevPhases => {
            const nextPhaseIndex = prevPhases.findIndex(p => p.id === nextPhaseId);
            if (nextPhaseIndex === -1) {
                // If next phase doesn't exist, we're at the end.
                return prevPhases.map(p => ({...p, status: PhaseStatus.Complete}));
            }

            return prevPhases.map((phase, index) => {
                if (index < nextPhaseIndex) return { ...phase, status: PhaseStatus.Complete };
                if (index === nextPhaseIndex) return { ...phase, status: PhaseStatus.Active };
                return phase;
            });
        });
        setIsTransitioning(false);
     }, 1000); // Animation duration
  };
  
  const handleStartQuickStart = () => {
    // Reset relevant state for a clean start
    setPhases(initialPhases);
    setInitialAnalysis(null);
    setJobDescription('');
    setActivePresetId(null);
    setBrainDumpModules([]);
    setActiveApp('catalyst');
  };
  
  const handleGoToDashboard = () => {
    setActiveApp('dashboard');
  };

  const handleStartCatalyst = () => {
    pushToHistory();
    setActiveApp('catalyst');
  };
  
  const handleGoToContinuousImprovement = () => {
    pushToHistory();
    setActiveApp('catalyst');
    const ciPhase = phases.find(p => p.id === 'continuous_improvement');
    if (ciPhase && ciPhase.status !== PhaseStatus.Locked) {
        navigateToPhase('continuous_improvement');
    } else {
        alert("Please complete the Career Catalyst Journey first to unlock Continuous Improvement.");
    }
  };

  const handleStartProjectWizard = () => {
    pushToHistory();
    setActiveApp('catalyst');
    const expConfirmPhase = phases.find(p => p.id === 'experience_confirmation');
    
    if (expConfirmPhase && expConfirmPhase.status !== PhaseStatus.Locked) {
        navigateToPhase('experience_confirmation');
        setOpenWizardOnLoad(true);
    } else {
        handleStartCatalyst();
    }
  };
  
  const handleStartLinkedInOptimizer = () => {
    pushToHistory();
    setActiveApp('linkedin');
  };
  const handleStartHeadshotGenerator = () => {
    pushToHistory();
    setActiveApp('headshot');
  };
  const handleStartLinkedInBannerGenerator = () => {
    pushToHistory();
    setActiveApp('linkedin_banner');
  };
  const handleStartAssetHub = () => {
    pushToHistory();
    setActiveApp('asset_hub');
  };
   const handleStartElevatorPitch = () => {
    pushToHistory();
    setActiveApp('elevator_pitch');
  };

  const handleStartWebsiteBuilder = () => {
    setIsWebsiteModalOpen(true);
  };

  const handleGoHome = (shouldPushToHistory = true) => {
      if(shouldPushToHistory) pushToHistory();
      setActiveApp('dashboard');
      setHistory([]);
  };

  const handlePhase1Complete = async (analysisResult: InitialAnalysisResult, jdText: string, presetName: string, destination: 'journey' | 'dashboard') => {
    setIsTransitioning(true);
    setInitialAnalysis(analysisResult);
    setJobDescription(jdText);
    
    const newPreset: JobPreset = {
        id: `preset_${Date.now()}`,
        name: presetName,
        jobDescription: jdText,
        initialAnalysis: analysisResult,
        createdAt: new Date().toISOString()
    };
    
    const updatedPresets = [newPreset, ...jobPresets].slice(0, 10);
    setJobPresets(updatedPresets);
    setActivePresetId(newPreset.id);

    // After Quick Start, unlock foundational journey steps and CI
    const phasesToUnlock = ['resume_jd', 'resume_enhancement', 'experience_confirmation', 'continuous_improvement'];
    setPhases(prevPhases => {
        const phase1Index = prevPhases.findIndex(p => p.id === 'resume_jd');
        const phase2Index = prevPhases.findIndex(p => p.id === 'resume_enhancement');
        
        return prevPhases.map((phase, index) => {
            if (phasesToUnlock.includes(phase.id)) {
                // If it's a phase to unlock, check its new status
                 if (destination === 'journey' && index === phase2Index) {
                    return { ...phase, status: PhaseStatus.Active };
                 }
                 if (index === phase1Index) {
                     return { ...phase, status: PhaseStatus.Complete };
                 }
                 return { ...phase, status: PhaseStatus.Complete }; // Unlock CI and other foundational steps
            }
            return phase;
        });
    });

    setTimeout(() => {
        setActiveApp(destination === 'journey' ? 'catalyst' : 'dashboard');
        setIsTransitioning(false);
        showToast(`Preset "${presetName}" saved successfully!`);
    }, 500);
  };
  
  const handleResumeEnhancementComplete = (updatedResume: InitialAnalysisResult) => {
      setInitialAnalysis(updatedResume);
      showToast('Resume enhancements saved to Asset Hub.');
      advanceToPhase('experience_confirmation');
  };

  const handleExperienceConfirmationComplete = async (updatedResume: InitialAnalysisResult, finalBrainDump: BrainDumpModule[]) => {
    setInitialAnalysis(updatedResume);
    setBrainDumpModules(finalBrainDump);
    showToast('Experience section saved to Asset Hub.');
    advanceToPhase('cv_resume_generate');
  };

  const handlePhase4Complete = () => {
    advanceToPhase('cover_letter');
  };

  const handlePhase5Complete = () => {
    advanceToPhase('continuous_improvement');
  };

  const handleRefineProjections = async (customInput: string): Promise<GeneratedResumeData['careerProjections']> => {
    if (!generatedResume) throw new Error("No resume data available to refine.");
    const newProjections = await regenerateProjections(generatedResume, customInput);
    setGeneratedResume(prev => prev ? { ...prev, careerProjections: newProjections } : null);
    return newProjections;
  };
  
  const handleSetActivePreset = (id: string | null) => {
    setActivePresetId(id);
    const preset = jobPresets.find(p => p.id === id);
    if (preset) {
        setIsTransitioning(true);
        setTimeout(() => {
            setInitialAnalysis(preset.initialAnalysis);
            setJobDescription(preset.jobDescription);
            // Reset phases to the beginning of the journey for this preset
            setPhases(initialPhases.map(p => p.id === 'resume_jd' ? {...p, status: PhaseStatus.Complete} : p.id === 'resume_enhancement' ? {...p, status: PhaseStatus.Active} : p));
            setActiveApp('catalyst');
            setIsTransitioning(false);
        }, 500);
    }
  };

  const handleDeletePreset = (id: string) => {
      setJobPresets(prev => prev.filter(p => p.id !== id));
      if (activePresetId === id) {
          setActivePresetId(null);
          setJobDescription('');
          setInitialAnalysis(null);
      }
  };

  const ciPhase = phases.find(p => p.id === 'continuous_improvement');
  const isCIUnlocked = ciPhase?.status !== PhaseStatus.Locked;

  const activePreset = jobPresets.find(p => p.id === activePresetId) || null;

  const dashboardProps = {
    onStartCatalyst: handleStartCatalyst,
    onGoToContinuousImprovement: handleGoToContinuousImprovement,
    onStartLinkedInOptimizer: handleStartLinkedInOptimizer,
    onStartHeadshotGenerator: handleStartHeadshotGenerator,
    onStartProjectWizard: handleStartProjectWizard,
    onStartAssetHub: handleStartAssetHub,
    onStartElevatorPitch: handleStartElevatorPitch,
    onStartWebsiteBuilder: handleStartWebsiteBuilder,
    isCIUnlocked,
    activePreset: activePreset,
  };

  const renderActiveApp = () => {
    const wizardProps = {
        phases,
        advanceToPhase,
        onPhase1Complete: handlePhase1Complete,
        openWizardOnLoad,
        setOpenWizardOnLoad,
        activePreset: activePreset,
        initialAnalysis,
        setInitialAnalysis,
        jobDescription,
        onResumeEnhancementComplete: handleResumeEnhancementComplete,
        onExperienceConfirmationComplete: handleExperienceConfirmationComplete,
        timelineEvents,
        brainDumpModules,
        setBrainDumpModules,
        onPhase4Complete: handlePhase4Complete,
        generatedResume,
        setGeneratedResume,
        onRefineProjections: handleRefineProjections,
        savedResumeVersions,
        setSavedResumeVersions,
        generatedCoverLetter,
        setGeneratedCoverLetter,
        onPhase5Complete: handlePhase5Complete,
        hasSeenCompletionScreen,
        setHasSeenCompletionScreen,
        onGoHome: handleGoHome,
    };

    switch(activeApp) {
        case 'welcome':
             return (
                <main className="flex-1 overflow-y-auto">
                   <WelcomeScreen 
                        onStartQuickStart={handleStartQuickStart} 
                        onGoToDashboard={handleGoToDashboard}
                        onStartHeadshotGenerator={handleStartHeadshotGenerator}
                        onStartJourney={handleStartCatalyst}
                        onStartAssetHub={handleStartAssetHub}
                    />
                </main>
            );
        case 'dashboard':
            return (
                <main className="flex-1 overflow-y-auto">
                    <Dashboard {...dashboardProps} />
                </main>
            );
        case 'catalyst':
            return (
                <main className="flex-1 overflow-y-auto">
                    <PhasedWizard {...wizardProps} />
                </main>
            );
        case 'linkedin':
             return (
                <main className="flex-1 overflow-y-auto">
                    <LinkedInOptimizer savedResumeVersions={savedResumeVersions} savedLinkedInContent={savedLinkedInContent} setSavedLinkedInContent={setSavedLinkedInContent} />
                </main>
            );
        case 'headshot':
             return (
                <main className="flex-1 overflow-y-auto">
                    <HeadshotGenerator
                        savedHeadshots={savedHeadshots}
                        setSavedHeadshots={setSavedHeadshots}
                        initialAnalysis={initialAnalysis}
                    />
                </main>
            );
        case 'linkedin_banner':
            return (
                <main className="flex-1 overflow-y-auto">
                    <LinkedInBannerGenerator />
                </main>
            );
        case 'asset_hub':
            return (
                <main className="flex-1 overflow-y-auto">
                    <AssetHub
                        savedResumeVersions={savedResumeVersions}
                        savedHeadshots={savedHeadshots}
                        savedLinkedInContent={savedLinkedInContent}
                        jobPresets={jobPresets}
                        activePresetId={activePresetId}
                        onActivatePreset={handleSetActivePreset}
                        onDeletePreset={handleDeletePreset}
                        onStartQuickStart={handleStartQuickStart}
                    />
                </main>
            );
        case 'elevator_pitch':
            return (
                <main className="flex-1 overflow-y-auto">
                    <ElevatorPitchGenerator savedResumeVersions={savedResumeVersions} />
                </main>
            );
        default:
            return (
                <main className="flex-1 overflow-y-auto">
                    <Dashboard {...dashboardProps} />
                </main>
            );
    }
  }


  return (
    <div className="h-screen bg-white font-sans flex flex-col max-w-screen-2xl mx-auto w-full my-4 rounded-xl shadow-2xl shadow-neutral-300 border border-neutral-200 overflow-hidden relative">
      <LoadingOverlay isVisible={isTransitioning} />
      <ToastNotification message={toastMessage} />
      <header className="bg-white/80 backdrop-blur-lg border-b border-neutral-200 sticky top-0 z-20 flex-shrink-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
               {activeApp !== 'dashboard' && activeApp !== 'welcome' && (
                <button onClick={handleBack} className="p-2 rounded-md hover:bg-neutral-200 text-neutral-500" title="Go Back">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
               )}
              <button onClick={() => activeApp === 'dashboard' ? setActiveApp('welcome') : handleGoHome(true)} className="flex items-center space-x-3 group" title="Go to Home Screen">
                <Logo className="h-8 w-8 text-neutral-800" />
                <h1 className="text-2xl font-bold text-neutral-800 tracking-tight group-hover:text-neutral-600 transition-colors">
                  Career Catalyst
                </h1>
              </button>
              {activePreset && activeApp === 'catalyst' && (
                  <div className="bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full hidden sm:block truncate">{activePreset.name}</div>
              )}
            </div>
            <div className="flex items-center space-x-4">
               {chat && (
                 <button onClick={() => setIsChatOpen(true)} className="p-2 rounded-md hover:bg-neutral-200 text-neutral-500" title="Open AI Assistant">
                    <HelpIcon className="h-6 w-6"/>
                 </button>
               )}
               <img className="h-8 w-8 rounded-full" src="https://i.pravatar.cc/100" alt="User Avatar" />
            </div>
          </div>
        </div>
      </header>
      {renderActiveApp()}

      {activeApp !== 'dashboard' && activeApp !== 'catalyst' && activeApp !== 'welcome' && (
        <FooterNav
          onStartCatalyst={handleStartCatalyst}
          onStartProjectWizard={handleStartProjectWizard}
          onGoToContinuousImprovement={handleGoToContinuousImprovement}
          onStartLinkedInOptimizer={handleStartLinkedInOptimizer}
          onStartLinkedInBannerGenerator={handleStartLinkedInBannerGenerator}
          onStartHeadshotGenerator={handleStartHeadshotGenerator}
          onStartAssetHub={handleStartAssetHub}
          onStartElevatorPitch={handleStartElevatorPitch}
          onStartWebsiteBuilder={handleStartWebsiteBuilder}
          isCIUnlocked={isCIUnlocked}
        />
      )}

       <Chatbot 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatHistory}
          onSendMessage={handleSendMessage}
          isLoading={isChatLoading}
       />

       <WebsiteBuilderModal
          isOpen={isWebsiteModalOpen}
          onClose={() => setIsWebsiteModalOpen(false)}
       />
    </div>
  );
};

export default App;