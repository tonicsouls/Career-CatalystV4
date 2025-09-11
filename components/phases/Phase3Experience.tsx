import React, { useState, useEffect } from 'react';
// FIX: Import BrainDumpModule and TimelineEvent types for the updated onComplete signature and brain dump generation.
import { InitialAnalysisResult, ResumeSection, BrainDumpModule, TimelineEvent } from '../../types';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
// FIX: Import structureInitialBrainDump service function to generate the brain dump.
import { generateEnhancementSuggestions, AchievementSuggestion, structureInitialBrainDump } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { WandIcon } from '../icons/WandIcon';
import { PencilIcon } from '../icons/PencilIcon';

interface Phase3ExperienceProps {
  initialAnalysis: InitialAnalysisResult | null;
  // FIX: Updated the onComplete prop signature to include finalBrainDump, matching the function passed from PhasedWizard.
  onComplete: (updatedResume: InitialAnalysisResult, finalBrainDump: BrainDumpModule[]) => void;
}

type Step = 'confirm' | 'enhance';

const ConfirmationCard: React.FC<{
    experience: ResumeSection;
    index: number;
    onUpdate: (index: number, field: keyof ResumeSection, value: any) => void;
    onRemove: (index: number) => void;
}> = ({ experience, index, onUpdate, onRemove }) => {
    return (
        <div className="p-4 bg-white rounded-lg border border-neutral-200 space-y-3">
            <div className="flex justify-between items-start">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <div className="font-bold text-lg text-neutral-800 sm:col-span-2">{experience.title}</div>
                    <div className="text-sm text-neutral-600">{experience.company}</div>
                    <div className="text-sm text-neutral-500">{experience.dates}</div>
                </div>
                <div className="flex flex-col space-y-1 ml-2">
                     {/* TODO: Implement edit modal if needed */}
                     <button onClick={() => onRemove(index)} className="p-1.5 rounded-full text-neutral-400 hover:bg-red-100 hover:text-red-500" title="Delete Role">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
             <details className="text-sm">
                <summary className="cursor-pointer text-neutral-500 font-medium">Edit Details</summary>
                <div className="pt-3 mt-2 border-t border-dashed grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-medium text-neutral-500">Job Title</label>
                        <input type="text" value={experience.title} onChange={e => onUpdate(index, 'title', e.target.value)} className="w-full p-1.5 bg-neutral-50 border border-neutral-200 rounded-md" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-neutral-500">Company</label>
                        <input type="text" value={experience.company} onChange={e => onUpdate(index, 'company', e.target.value)} className="w-full p-1.5 bg-neutral-50 border border-neutral-200 rounded-md" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-neutral-500">Location</label>
                        <input type="text" value={experience.location} onChange={e => onUpdate(index, 'location', e.target.value)} className="w-full p-1.5 bg-neutral-50 border border-neutral-200 rounded-md" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-neutral-500">Dates</label>
                        <input type="text" value={experience.dates} onChange={e => onUpdate(index, 'dates', e.target.value)} className="w-full p-1.5 bg-neutral-50 border border-neutral-200 rounded-md" />
                    </div>
                </div>
            </details>
        </div>
    );
};


const Phase3Experience: React.FC<Phase3ExperienceProps> = ({ initialAnalysis, onComplete }) => {
    const [step, setStep] = useState<Step>('confirm');
    const [editableResume, setEditableResume] = useState<InitialAnalysisResult | null>(initialAnalysis);
    const [suggestions, setSuggestions] = useState<AchievementSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openAccordion, setOpenAccordion] = useState<number | null>(0);

    useEffect(() => {
        setEditableResume(initialAnalysis);
    }, [initialAnalysis]);

    const handleUpdateExperience = (index: number, field: keyof ResumeSection, value: any) => {
        setEditableResume(prev => {
            if (!prev) return null;
            const newExperience = [...prev.experience];
            // @ts-ignore
            newExperience[index][field] = value;
            return { ...prev, experience: newExperience };
        });
    };
    
    const handleAddExperience = () => {
        setEditableResume(prev => {
            if (!prev) return null;
            const newExperienceEntry: ResumeSection = { title: 'New Role', company: 'Company Name', location: 'City, State', dates: 'Year - Year', achievements: ['- Achievement 1']};
            return { ...prev, experience: [newExperienceEntry, ...prev.experience] };
        });
    };
    
    const handleRemoveExperience = (index: number) => {
        setEditableResume(prev => {
            if (!prev) return null;
            return { ...prev, experience: prev.experience.filter((_, i) => i !== index) };
        });
    };

    const handleConfirmAndEnhance = async () => {
        if (!editableResume) return;
        setIsLoading(true);
        setError(null);
        try {
            const allAchievements = editableResume.experience.flatMap(exp => exp.achievements);
            const generatedSuggestions = await generateEnhancementSuggestions(allAchievements);
            setSuggestions(generatedSuggestions);
            setStep('enhance');
        } catch (e: any) {
            setError(e.message || "Failed to get AI suggestions.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const applySuggestion = (expIndex: number, achIndex: number, newText: string) => {
        setEditableResume(prev => {
            if (!prev) return null;
            const newExperience = [...prev.experience];
            const newAchievements = [...newExperience[expIndex].achievements];
            newAchievements[achIndex] = newText;
            newExperience[expIndex].achievements = newAchievements;
            return {...prev, experience: newExperience};
        })
    };


    // FIX: Updated handleFinish to be async and generate the brain dump before calling onComplete.
    const handleFinish = async () => {
        if (editableResume) {
            setIsLoading(true);
            setError(null);
            try {
                // Convert experience sections to timeline events for brain dump generation
                const timelineEventsFromResume: TimelineEvent[] = editableResume.experience.map((exp, i) => ({
                    id: Date.now() + i, // Simple unique ID
                    title: exp.title,
                    company: exp.company,
                    date: exp.dates,
                    description: exp.achievements.join('\n'),
                }));

                const finalBrainDump = await structureInitialBrainDump(timelineEventsFromResume);
                onComplete(editableResume, finalBrainDump);
            } catch(e: any) {
                setError(e.message || "Failed to finalize experience and create brain dump.");
                setIsLoading(false); // Only set loading to false on error
            }
        }
    };
    
    if (!editableResume) {
        return <div className="text-center p-8">Loading experience data...</div>;
    }

    const renderConfirmationStep = () => (
        <>
            <div className="space-y-4">
                {editableResume.experience.map((exp, index) => (
                    <ConfirmationCard
                        key={index}
                        experience={exp}
                        index={index}
                        onUpdate={handleUpdateExperience}
                        onRemove={handleRemoveExperience}
                    />
                ))}
            </div>
            <div className="pt-4 mt-4 border-t border-neutral-200">
                <button onClick={handleAddExperience} className="w-full flex items-center justify-center p-3 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-600 hover:border-neutral-800 hover:text-neutral-800 transition-colors">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Another Role
                </button>
            </div>
            <div className="flex justify-end pt-6">
                <button onClick={handleConfirmAndEnhance} disabled={isLoading} className="px-8 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-400">
                    {isLoading ? 'Analyzing...' : 'Confirm & Enhance with AI'}
                </button>
            </div>
        </>
    );

    const renderEnhancementStep = () => (
        <div className="space-y-4">
            {editableResume.experience.map((exp, expIndex) => {
                const jobSuggestions = exp.achievements.map(ach => suggestions.find(s => s.original === ach)).filter(Boolean) as AchievementSuggestion[];
                const suggestionCount = jobSuggestions.reduce((acc, s) => acc + s.enhancements.length, 0);

                return (
                    <div key={expIndex} className="bg-white rounded-xl border border-neutral-200">
                        <button className="w-full flex justify-between items-center p-4 text-left" onClick={() => setOpenAccordion(openAccordion === expIndex ? null : expIndex)}>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-neutral-800">{exp.title}</h3>
                                <p className="text-sm text-neutral-500">{exp.company}</p>
                            </div>
                             {suggestionCount > 0 && <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex items-center"><SparklesIcon className="h-3 w-3 mr-1"/>{suggestionCount} Suggestions</span>}
                             <ChevronDownIcon className={`h-6 w-6 text-neutral-500 transition-transform ml-4 ${openAccordion === expIndex ? 'rotate-180' : ''}`} />
                        </button>
                        {openAccordion === expIndex && (
                            <div className="p-4 border-t border-neutral-200 space-y-4">
                                {exp.achievements.map((ach, achIndex) => {
                                    const achSuggestions = suggestions.find(s => s.original === ach);
                                    return (
                                        <div key={achIndex} className="p-3 bg-neutral-50 rounded-lg">
                                            <p className="text-sm text-neutral-800 mb-2">{ach}</p>
                                            {achSuggestions && achSuggestions.enhancements.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed">
                                                    {achSuggestions.enhancements.map((sugg, suggIndex) => (
                                                        <button key={suggIndex} onClick={() => applySuggestion(expIndex, achIndex, sugg.text)}
                                                            className="flex items-center space-x-2 text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full hover:bg-amber-200"
                                                            title={`Apply suggestion: ${sugg.text}`}>
                                                            <WandIcon className="h-3 w-3" />
                                                            <span>{sugg.type}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
             <div className="flex justify-between pt-6">
                <button onClick={() => setStep('confirm')} className="px-6 py-2 font-medium rounded-md text-neutral-700 bg-neutral-200 hover:bg-neutral-300">
                    Back to Confirmation
                </button>
                {/* FIX: Updated button text to be more accurate and handle loading state. */}
                <button onClick={handleFinish} disabled={isLoading} className="px-8 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-400">
                    {isLoading ? 'Processing...' : 'Next: Generate Resume'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl border border-neutral-200 p-6 flex items-center space-x-6">
                <div className="bg-neutral-100 p-4 rounded-lg">
                    <BriefcaseIcon className="h-10 w-10 text-neutral-800" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Phase 3: Confirm & Enhance Experience</h2>
                    <p className="mt-2 text-neutral-600">
                        {step === 'confirm'
                            ? "Step 1: Confirm your work history is correct. Edit titles, companies, and dates, or add/remove roles as needed."
                            : "Step 2: Review the AI's suggestions to make your achievements more impactful. Click a suggestion chip to apply it."}
                    </p>
                </div>
            </div>
            
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

            {step === 'confirm' ? renderConfirmationStep() : renderEnhancementStep()}
        </div>
    );
};

export default Phase3Experience;
