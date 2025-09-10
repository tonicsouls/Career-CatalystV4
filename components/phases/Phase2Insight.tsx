import React, { useState } from 'react';
import { BrainDumpModule, ProjectDetails, TimelineEvent } from '../../types';
import { structureInitialBrainDump } from '../../services/geminiService';
import TimelineEditor from '../TimelineEditor';
import { SparklesIcon } from '../icons/SparklesIcon';
import { TimelineIllustration } from '../illustrations/TimelineIllustration';
import Modal from '../Modal';
import ProjectWizard from '../ProjectWizard';
import { CubeIcon } from '../icons/CubeIcon';

interface Phase2InsightProps {
  timelineEvents: TimelineEvent[];
  setTimelineEvents: (events: TimelineEvent[]) => void;
  onComplete: (modules: BrainDumpModule[]) => void;
}

const Phase2Insight: React.FC<Phase2InsightProps> = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProjectWizardOpen, setIsProjectWizardOpen] = useState(false);

    const handleAddProjectStory = (storyText: string, details: ProjectDetails) => {
        // Find the timeline event that matches the 'where' from the project details
        const targetEventIndex = props.timelineEvents.findIndex(event => {
            if (!event.title || !details.where) return false;
            const eventTitle = event.title.toLowerCase();
            const detailsWhere = details.where.toLowerCase();
            return eventTitle.includes(detailsWhere) || detailsWhere.includes(eventTitle);
        });

        const appendStory = (index: number, alertMessage?: string) => {
            const updatedEvents = [...props.timelineEvents];
            const targetEvent = updatedEvents[index];
            // Append the new story as a bullet point, ensuring a new line
            const newDescription = `${targetEvent.description.trim()}\n- ${storyText}`;
            updatedEvents[index] = { ...targetEvent, description: newDescription };
            props.setTimelineEvents(updatedEvents);
            if (alertMessage) {
                alert(alertMessage);
            }
        };

        if (targetEventIndex !== -1) {
            appendStory(targetEventIndex);
        } else {
            // If no match found, append to the first event as a fallback
            if (props.timelineEvents.length > 0) {
                 appendStory(0, `Project story added. Could not automatically match to a specific role, so it was added to '${props.timelineEvents[0].title}'. You can move it manually.`);
            }
        }
        setIsProjectWizardOpen(false);
    };


    const handleGenerate = async () => {
        setError(null);
        setIsLoading(true);
        try {
            if (props.timelineEvents.length === 0 || !props.timelineEvents.some(e => e.description.trim())) {
                throw new Error("Your career timeline is empty or lacks detail. Please add job descriptions or key achievements before proceeding.");
            }
            const structuredModules = await structureInitialBrainDump(props.timelineEvents);
            props.onComplete(structuredModules);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
             {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
             <div className="bg-white rounded-xl shadow-xl border border-neutral-200 p-6 mb-8 flex items-center space-x-6">
                <TimelineIllustration className="h-24 w-24 text-neutral-800 flex-shrink-0 hidden sm:block" />
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Phase 2: Build Your Timeline</h2>
                    <p className="mt-2 text-neutral-600">
                        Use the Timeline Editor to build your career story. The AI will use this structure to create an interactive workspace for you in the next step.
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                 <div className="lg:col-span-3">
                     <TimelineEditor 
                        events={props.timelineEvents}
                        setEvents={props.setTimelineEvents}
                        onGenerateReport={handleGenerate} // This now triggers brain dump structuring
                        isLoading={isLoading}
                     />
                 </div>
                 <div className="lg:col-span-2 bg-white rounded-xl shadow-xl border border-neutral-200 p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-neutral-800">Next Step</h3>
                    <p className="mt-2 text-sm text-neutral-500">
                        Once your timeline is complete, click the button below to have the AI analyze it and structure your personalized Brain Dump workspace.
                    </p>
                    <p className="mt-3 text-xs text-neutral-400 italic">
                        Tip: You can copy and paste your entire resume into the description of the first timeline event to get started quickly.
                    </p>
                    <div className="mt-6 space-y-3">
                        <button
                            onClick={() => setIsProjectWizardOpen(true)}
                            className="w-full flex items-center justify-center px-4 py-2.5 border border-neutral-300 text-sm font-medium rounded-md shadow-sm text-neutral-800 bg-white hover:bg-neutral-100 transition-colors"
                        >
                            <CubeIcon className="h-5 w-5 mr-2" />
                            Unpack a Project with AI Wizard
                        </button>
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading || props.timelineEvents.length === 0}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors"
                        >
                             {isLoading ? (
                                <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Structuring Brain Dump...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="h-5 w-5 mr-2" />
                                    Proceed to Brain Dump
                                </>
                            )}
                        </button>
                    </div>
                 </div>
            </div>
             <Modal isOpen={isProjectWizardOpen} onClose={() => setIsProjectWizardOpen(false)} title="Unpack a Project">
                <ProjectWizard onComplete={handleAddProjectStory} timelineEvents={props.timelineEvents} />
            </Modal>
        </div>
    );
};

export default Phase2Insight;