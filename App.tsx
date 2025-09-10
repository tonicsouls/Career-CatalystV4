

import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './components/icons/SparklesIcon';
import PhasedWizard from './components/PhasedWizard';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TimelineEvent, Phase, PhaseStatus, BrainDumpModule, BrainDumpStory, GeneratedResumeData, SavedResumeVersion, ChatMessage, SavedLinkedInContent, HistoryState, ActiveApp } from './types';
import { sampleTimelineEvents, sampleJobDescription } from './utils/sampleData';
import SideNav from './components/SideNav';
import { MenuIcon } from './components/icons/MenuIcon';
import { regenerateProjections } from './services/geminiService';
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


const initialPhases: Phase[] = [
    { id: 'resume_jd', name: 'Upload Docs', status: PhaseStatus.Active, section: 'Foundation', step: 1, timeEstimate: 'Est. 2 mins' },
    { id: 'timeline', name: 'Build Timeline', status: PhaseStatus.Locked, section: 'AI Insight Report', step: 1, timeEstimate: 'Est. 10-15 mins' },
    { id: 'braindump', name: 'Brain Dump', status: PhaseStatus.Locked, section: 'Deep Dive', step: 1, timeEstimate: 'Est. 15-20 mins' },
    { id: 'cv_resume_generate', name: 'Generate Resume', status: PhaseStatus.Locked, section: 'Asset Generation', step: 1, timeEstimate: 'Est. 2 mins' },
    { id: 'cv_resume_review', name: 'Review & Edit Resume', status: PhaseStatus.Locked, section: 'Asset Generation', step: 2, timeEstimate: 'Est. 5-10 mins' },
    { id: 'cover_letter', name: 'Generate Cover Letter', status: PhaseStatus.Locked, section: 'Asset Generation', step: 3, timeEstimate: 'Est. 3-5 mins' },
    { id: 'continuous_improvement', name: 'Improve & Tailor', status: PhaseStatus.Locked, section: 'Continuous Improvement', step: 1, timeEstimate: 'Ongoing' },
];

const App: React.FC = () => {
  const [phases, setPhases] = useLocalStorage<Phase[]>('appPhases_v8', initialPhases);
  const [timelineEvents, setTimelineEvents] = useLocalStorage<TimelineEvent[]>('timelineEvents_v3', []);
  const [jobDescription, setJobDescription] = useLocalStorage<string>('jobDescription_v3', '');
  const [brainDumpModules, setBrainDumpModules] = useLocalStorage<BrainDumpModule[]>('brainDumpModules_v3', []);
  const [generatedResume, setGeneratedResume] = useLocalStorage<GeneratedResumeData | null>('generatedResume_v2', null);
  const [savedResumeVersions, setSavedResumeVersions] = useLocalStorage<SavedResumeVersion[]>('savedResumeVersions_v2', []);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useLocalStorage<string | null>('generatedCoverLetter_v2', null);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeApp, setActiveApp] = useState<ActiveApp>('dashboard');
  const [openWizardOnLoad, setOpenWizardOnLoad] = useState(false);
  
  // Asset Hub State
  const [savedHeadshots, setSavedHeadshots] = useLocalStorage<string[]>('savedHeadshots_v1', []);
  const [savedLinkedInContent, setSavedLinkedInContent] = useLocalStorage<SavedLinkedInContent[]>('savedLinkedInContent_v1', []);

  // Journey Completion State
  const [hasSeenCompletionScreen, setHasSeenCompletionScreen] = useLocalStorage('hasSeenCompletionScreen_v1', false);

  // Chatbot State
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // History state for back button
  const [history, setHistory] = useLocalStorage<HistoryState[]>('appHistory_v2', []);
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);

  // Initialize chatbot on component mount for immediate availability
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

    // Basic RAG: Construct context from user's saved data
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

  const pushToHistory = () => {
    setHistory(prev => [...prev, { activeApp }]);
  };

  const handleBack = () => {
    if (history.length === 0) {
        handleGoHome(false);
        return;
    }

    const lastState = history[history.length - 1];
    setActiveApp(lastState.activeApp);
    setHistory(prev => prev.slice(0, -1));
  };


  const navigateToPhase = (phaseId: string) => {
    pushToHistory();
    setPhases(prevPhases => {
        const targetPhaseIndex = prevPhases.findIndex(p => p.id === phaseId);
        if (targetPhaseIndex === -1) return prevPhases;
        
        if(prevPhases[targetPhaseIndex].status === PhaseStatus.Locked) return prevPhases;

        return prevPhases.map((phase, index) => {
            if (index === targetPhaseIndex) return { ...phase, status: PhaseStatus.Active };
            // Do not complete the active phase on simple navigation, only on advancement
            return phase;
        });
    });
  };

  const advanceToPhase = (nextPhaseId: string) => {
     pushToHistory();
     setPhases(prevPhases => {
        const nextPhaseIndex = prevPhases.findIndex(p => p.id === nextPhaseId);
        if (nextPhaseIndex === -1) return prevPhases;

        return prevPhases.map((phase, index) => {
            if (index < nextPhaseIndex) return { ...phase, status: PhaseStatus.Complete };
            if (index === nextPhaseIndex) return { ...phase, status: PhaseStatus.Active };
            return phase;
        });
    });
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
    const brainDumpPhase = phases.find(p => p.id === 'braindump');
    
    if (brainDumpPhase && brainDumpPhase.status !== PhaseStatus.Locked) {
        navigateToPhase('braindump');
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

  const handlePhase1Complete = (resumeTexts: string[], jdText: string) => {
    const combinedResumeText = resumeTexts.join('\n\n---\n\n');
    if (timelineEvents.length === 0 && combinedResumeText) {
      setTimelineEvents([
        {
          id: Date.now(),
          title: 'My Career Story (from Resumes)',
          date: 'Initial Upload',
          description: combinedResumeText,
        },
      ]);
    }
    if (jdText) {
      setJobDescription(jdText);
    }
    advanceToPhase('timeline');
  };
  
  const handlePhase2Complete = (modules: BrainDumpModule[]) => {
    setBrainDumpModules(modules);
    advanceToPhase('braindump');
  };

  const handlePhase3Complete = () => {
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

  const fillWithSampleData = () => {
    setTimelineEvents(sampleTimelineEvents);
    setJobDescription(sampleJobDescription);
    const sampleModules = sampleTimelineEvents.map(event => ({
        id: event.id.toString(),
        title: event.title,
        date: event.date,
        stories: [
            { id: Date.now(), text: 'Managed a cross-functional team to launch a new product, resulting in a 15% market share increase within the first year.', audioRecording: null, isPlaceholder: false },
            { id: Date.now() + 1, text: 'Led a cost-saving initiative that reduced operational expenses by $250,000 annually through process optimization.', audioRecording: null, isPlaceholder: false }
        ] as BrainDumpStory[]
    }));
    setBrainDumpModules(sampleModules);
    setGeneratedResume(null);
    setActiveApp('catalyst');
    advanceToPhase('braindump');
  };
  
  const ciPhase = phases.find(p => p.id === 'continuous_improvement');
  const isCIUnlocked = ciPhase?.status !== PhaseStatus.Locked;

  // FIX: Corrected variable names from 'onStartCatalyst', etc. to 'handleStartCatalyst', etc.
  // to match the defined handler functions in this component.
  const dashboardProps = {
    onStartCatalyst: handleStartCatalyst,
    onGoToContinuousImprovement: handleGoToContinuousImprovement,
    onStartLinkedInOptimizer: handleStartLinkedInOptimizer,
    onStartHeadshotGenerator: handleStartHeadshotGenerator,
    onStartProjectWizard: handleStartProjectWizard,
    onStartAssetHub: handleStartAssetHub,
    onStartElevatorPitch: handleStartElevatorPitch,
    onStartWebsiteBuilder: handleStartWebsiteBuilder,
    isCIUnlocked
  };

  const renderActiveApp = () => {
    const wizardProps = {
        phases,
        advanceToPhase,
        onPhase1Complete: handlePhase1Complete,
        onFillWithSampleData: fillWithSampleData,
        openWizardOnLoad,
        setOpenWizardOnLoad,
        timelineEvents,
        setTimelineEvents,
        jobDescription,
        onPhase2Complete: handlePhase2Complete,
        brainDumpModules,
        setBrainDumpModules,
        onPhase3Complete: handlePhase3Complete,
        generatedResume,
        setGeneratedResume,
        onPhase4Complete: handlePhase4Complete,
        onRefineProjections: handleRefineProjections,
        savedResumeVersions,
        setSavedResumeVersions,
        generatedCoverLetter,
        setGeneratedCoverLetter,
        onPhase5Complete: handlePhase5Complete,
        hasSeenCompletionScreen,
        setHasSeenCompletionScreen
    };

    switch(activeApp) {
        case 'dashboard':
            return <Dashboard {...dashboardProps} />;
        case 'catalyst':
            return (
                <div className="flex flex-1 overflow-hidden">
                    <SideNav phases={phases} isOpen={isNavOpen} onNavigate={navigateToPhase} />
                    <main className="flex-1 overflow-y-auto">
                        <PhasedWizard {...wizardProps} />
                    </main>
                </div>
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
                    <HeadshotGenerator savedHeadshots={savedHeadshots} setSavedHeadshots={setSavedHeadshots} />
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
            return <Dashboard {...dashboardProps} />;
    }
  }


  return (
    <div className="h-screen bg-white font-sans flex flex-col max-w-7xl mx-auto w-full my-4 rounded-xl shadow-2xl shadow-neutral-300 border border-neutral-200 overflow-hidden relative">
      <header className="bg-white/80 backdrop-blur-lg border-b border-neutral-200 sticky top-0 z-20 flex-shrink-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
               {activeApp !== 'dashboard' && (
                <button onClick={handleBack} disabled={history.length === 0} className="p-2 rounded-md hover:bg-neutral-200 text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed" title="Go Back">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
               )}
               {activeApp === 'catalyst' && (
                <button onClick={() => setIsNavOpen(!isNavOpen)} className="p-2 rounded-md hover:bg-neutral-200 text-neutral-500" title="Toggle Menu">
                    <MenuIcon className="h-6 w-6" />
                </button>
               )}
              <button onClick={() => handleGoHome(true)} className="flex items-center space-x-3 group" title="Go to Home Screen">
                <Logo className="h-8 w-8 text-neutral-800" />
                <h1 className="text-2xl font-bold text-neutral-800 tracking-tight group-hover:text-neutral-600 transition-colors">
                  Career Catalyst
                </h1>
              </button>
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

      {activeApp !== 'dashboard' && (
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