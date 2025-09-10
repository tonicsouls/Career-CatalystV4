

import React, { useState, useEffect } from 'react';
import { BrainDumpModule, BrainDumpStory, ProjectDetails, TimelineEvent } from '../../types';
import AudioRecorder from '../AudioRecorder';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { WandIcon } from '../icons/WandIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import Modal from '../Modal';
import ProjectWizard from '../ProjectWizard';
import { CubeIcon } from '../icons/CubeIcon';
import { BrainDumpIllustration } from '../illustrations/BrainDumpIllustration';

interface Phase3BrainDumpProps {
  modules: BrainDumpModule[];
  setModules: React.Dispatch<React.SetStateAction<BrainDumpModule[]>>;
  onComplete: () => void;
  // FIX: Corrected type from ProjectDetails[] to TimelineEvent[] to resolve type mismatch
  // between PhasedWizard parent and ProjectWizard child component.
  timelineEvents: TimelineEvent[];
  openWizardOnLoad?: boolean;
  setOpenWizardOnLoad?: (isOpen: boolean) => void;
}

const HintTag: React.FC<{ text: string; color: 'green' | 'sky' | 'amber' }> = ({ text, color }) => {
    const colors = {
        green: 'bg-green-100 text-green-800',
        sky: 'bg-sky-100 text-sky-800',
        amber: 'bg-amber-100 text-amber-800',
    };
    return (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[color]}`}>
            {text}
        </span>
    );
}

const StoryCard: React.FC<{
    story: BrainDumpStory;
    moduleId: string;
    onUpdate: (storyId: number, updatedData: Partial<BrainDumpStory>) => void;
    onDelete: (storyId: number) => void;
    onRefine: (story: BrainDumpStory) => void;
}> = ({ story, moduleId, onUpdate, onDelete, onRefine }) => {
    const [text, setText] = useState(story.text);

    const handleMarkAsReviewed = (isPlaceholder: boolean) => {
        onUpdate(story.id, { isPlaceholder });
    };
    
    const isReviewed = !story.isPlaceholder;

    return (
        <div className={`p-4 rounded-lg border space-y-3 transition-all duration-300 ${
            isReviewed 
                ? 'bg-neutral-50/50 border-neutral-200' 
                : 'bg-neutral-100 border-neutral-300 ring-2 ring-neutral-200'
        }`}>
            {story.prompt && (
                <div className="p-3 bg-white rounded-md border border-neutral-200">
                    <p className="text-sm font-semibold text-neutral-700 flex items-center">
                        <SparklesIcon className="h-4 w-4 mr-2 text-amber-500" />
                        AI Prompt:
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">{story.prompt}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <HintTag text="Add Numbers" color="green" />
                        <HintTag text="Describe Impact" color="sky" />
                        <HintTag text="Use Action Verbs" color="amber" />
                    </div>
                </div>
            )}
            <div className="flex items-start space-x-2">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={() => onUpdate(story.id, { text })} // Auto-save on blur
                    rows={3}
                    placeholder="Describe a key project, achievement, or challenge..."
                    className="flex-grow p-2 bg-white border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-800 placeholder-neutral-400 text-sm"
                />
                <div className="flex flex-col space-y-1">
                    <button onClick={() => onDelete(story.id)} className="p-2 rounded-full text-neutral-400 hover:bg-red-100 hover:text-red-600" title="Delete Story">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => onRefine(story)} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-800" title="Refine with AI">
                        <WandIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            <div className='flex items-center justify-between'>
                <AudioRecorder 
                    key={story.id}
                    initialAudioUrl={story.audioRecording}
                    onRecordingComplete={(audioBase64) => onUpdate(story.id, { audioRecording: audioBase64 })}
                />
                 <label className="flex items-center space-x-2 cursor-pointer text-sm text-neutral-600">
                    <input type="checkbox" checked={isReviewed} onChange={(e) => handleMarkAsReviewed(!e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-neutral-800 focus:ring-neutral-800"/>
                    <span>Mark as Reviewed</span>
                </label>
            </div>
        </div>
    );
};

const Phase3BrainDump: React.FC<Phase3BrainDumpProps> = ({ modules, setModules, onComplete, timelineEvents, openWizardOnLoad, setOpenWizardOnLoad }) => {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(modules.length > 0 ? modules[0].id : null);
  const [isProjectWizardOpen, setIsProjectWizardOpen] = useState(false);
  
  useEffect(() => {
    if (openWizardOnLoad && setOpenWizardOnLoad) {
      setIsProjectWizardOpen(true);
      setOpenWizardOnLoad(false); // Reset the trigger
    }
  }, [openWizardOnLoad, setOpenWizardOnLoad]);

  const activeModule = modules.find(m => m.id === activeModuleId);

  const updateModuleStories = (moduleId: string, stories: BrainDumpStory[]) => {
    setModules(prevModules => prevModules.map(m => m.id === moduleId ? { ...m, stories } : m));
  };
  
  const addStory = (moduleId: string) => {
      const newStory: BrainDumpStory = { id: Date.now(), text: '', audioRecording: null, isPlaceholder: false };
      if (activeModule) {
          updateModuleStories(moduleId, [...activeModule.stories, newStory]);
      }
  };
  
    const handleAddProjectStory = (storyText: string, details: ProjectDetails) => {
        if (activeModule) {
            const newStory: BrainDumpStory = {
                id: Date.now(),
                text: storyText,
                audioRecording: null,
                isPlaceholder: false,
                projectDetails: details
            };
            updateModuleStories(activeModule.id, [...activeModule.stories, newStory]);
        }
        setIsProjectWizardOpen(false);
    };


  const updateStory = (moduleId: string, storyId: number, updatedStoryData: Partial<BrainDumpStory>) => {
    if (activeModule) {
        const updatedStories = activeModule.stories.map(s => s.id === storyId ? { ...s, ...updatedStoryData } : s);
        updateModuleStories(moduleId, updatedStories);
    }
  };

  const deleteStory = (moduleId: string, storyId: number) => {
     if (activeModule) {
        const updatedStories = activeModule.stories.filter(s => s.id !== storyId);
        updateModuleStories(moduleId, updatedStories);
     }
  };
  
  const isPhaseComplete = modules.flatMap(m => m.stories).some(s => s.text.trim().length > 0);

  return (
    <>
    <div className="bg-white rounded-xl shadow-xl border border-neutral-200">
        <div className="p-6 border-b border-neutral-200 flex items-center space-x-6">
            <BrainDumpIllustration className="h-24 w-24 text-neutral-800 flex-shrink-0 hidden sm:block" />
            <div>
                <h2 className="text-2xl font-bold text-neutral-800">Phase 3: AI-Assisted Brain Dump</h2>
                <p className="mt-2 text-neutral-600">
                    The AI has structured your resume into key stories. Your task is to review each one, add detail using the AI prompts, and mark them as complete.
                </p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4">
            <aside className="md:col-span-1 border-r border-neutral-200 bg-neutral-50/50">
                <nav className="p-2">
                    <div className="p-2">
                        <p className="text-xs font-semibold text-neutral-500 uppercase">Experience Modules</p>
                        <p className="mt-1 text-xs text-neutral-500">Key stories extracted from your resume. Go through each to add detail and context.</p>
                    </div>
                    <ul>
                        {modules.map((module) => (
                            <li key={module.id}>
                                <button
                                    onClick={() => setActiveModuleId(module.id)}
                                    className={`w-full text-left p-3 rounded-md transition-colors border-l-4 ${activeModuleId === module.id ? 'bg-neutral-200/50 text-neutral-800 border-l-neutral-800' : 'text-neutral-600 hover:bg-neutral-200/50 border-transparent'}`}
                                >
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold">{module.title}</span>
                                      {module.stories.filter(s=>s.isPlaceholder).length > 0 && 
                                        <span className="text-xs font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full animate-pulse">{module.stories.filter(s=>s.isPlaceholder).length}</span>
                                      }
                                    </div>
                                    <span className="block text-xs text-neutral-500">{module.date}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="md:col-span-3 p-6">
                {activeModule ? (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-neutral-800">{activeModule.title}</h3>
                        
                        <div>
                            <h4 className="font-semibold text-neutral-700 mb-3">Key Stories & Outcomes</h4>
                            <div className="space-y-4">
                                {activeModule.stories.map(story => (
                                    <StoryCard
                                        key={story.id}
                                        story={story}
                                        moduleId={activeModule.id}
                                        onUpdate={(storyId, data) => updateStory(activeModule.id, storyId, data)}
                                        onDelete={(storyId) => deleteStory(activeModule.id, storyId)}
                                        onRefine={(s) => { /* TODO: Implement Refine Modal trigger */ }}
                                    />
                                ))}
                            </div>
                            <div className="mt-6 border-t border-neutral-200 pt-4 space-y-3">
                                <button
                                    onClick={() => setIsProjectWizardOpen(true)}
                                    className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
                                >
                                    <CubeIcon className="h-5 w-5 mr-2" />
                                    Launch Project Breakdown Assistant
                                </button>
                                 <button
                                    onClick={() => addStory(activeModule.id)}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-100 transition-colors"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Add a Simple Story
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-neutral-500">Select a module from the left to begin your brain dump.</p>
                        <p className="text-sm text-neutral-400">If no modules appear, please complete Phase 2 first.</p>
                    </div>
                )}
            </main>
        </div>
        <div className="p-4 border-t border-neutral-200 flex justify-end bg-neutral-50/50 rounded-b-xl">
            <button
                onClick={onComplete}
                disabled={!isPhaseComplete}
                className="px-6 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed disabled:text-neutral-500"
            >
                Complete Phase 3 & Proceed
            </button>
        </div>
    </div>
    <Modal isOpen={isProjectWizardOpen} onClose={() => setIsProjectWizardOpen(false)} title="Project Breakdown Assistant">
        <ProjectWizard onComplete={handleAddProjectStory} timelineEvents={timelineEvents} />
    </Modal>
    </>
  );
};

export default Phase3BrainDump;