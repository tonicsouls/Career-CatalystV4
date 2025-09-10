import React, { useState, useEffect } from 'react';
import { InitialAnalysisResult, CategorizedSkills, ResumeSection, EducationSection } from '../../types';
import { improveSummary, categorizeSkills, transcribeAndSummarizeAudio } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';
import { TimelineIllustration } from '../illustrations/TimelineIllustration';
import Modal from '../Modal';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { WandIcon } from '../icons/WandIcon';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import AudioRecorder from '../AudioRecorder';
import { XMarkIcon } from '../icons/XMarkIcon';
import { PlusIcon } from '../icons/PlusIcon';

interface Phase2InsightProps {
  initialAnalysis: InitialAnalysisResult | null;
  onComplete: (updatedResume: InitialAnalysisResult) => void;
}

const AccordionSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-white rounded-xl border border-neutral-200">
            <button
                className="w-full flex justify-between items-center p-4 text-left"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="flex items-center space-x-3">
                    <div className="bg-neutral-100 p-2 rounded-lg">{icon}</div>
                    <h3 className="text-lg font-bold text-neutral-800">{title}</h3>
                </div>
                <ChevronDownIcon className={`h-6 w-6 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="p-6 border-t border-neutral-200">
                    {children}
                </div>
            </div>
        </div>
    );
};


const Phase2Insight: React.FC<Phase2InsightProps> = ({ initialAnalysis, onComplete }) => {
    const [editableResume, setEditableResume] = useState<InitialAnalysisResult | null>(initialAnalysis);
    const [categorizedSkills, setCategorizedSkills] = useState<CategorizedSkills[]>([]);
    const [isLoading, setIsLoading] = useState({ summary: false, skills: false, voice: false });
    const [error, setError] = useState<string | null>(null);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

    useEffect(() => {
        if (initialAnalysis && initialAnalysis.keySkills.length > 0) {
            handleCategorizeSkills(initialAnalysis.keySkills);
        }
    }, [initialAnalysis]);

    const handleCategorizeSkills = async (skills: string[]) => {
        setIsLoading(prev => ({ ...prev, skills: true }));
        try {
            const categories = await categorizeSkills(skills);
            setCategorizedSkills(categories);
        } catch (e: any) {
            setError(e.message || "Failed to categorize skills.");
        } finally {
            setIsLoading(prev => ({ ...prev, skills: false }));
        }
    };

    const handleImproveSummary = async () => {
        if (!editableResume?.summary) return;
        setIsLoading(prev => ({ ...prev, summary: true }));
        try {
            const improved = await improveSummary(editableResume.summary);
            setEditableResume(prev => prev ? { ...prev, summary: improved } : null);
        } catch (e: any) {
            setError(e.message || "Failed to improve summary.");
        } finally {
            setIsLoading(prev => ({ ...prev, summary: false }));
        }
    };

    const handleVoiceSummary = async (audioDataUrl: string) => {
        if (!audioDataUrl) {
            setIsVoiceModalOpen(false);
            return;
        }
        setIsLoading(prev => ({ ...prev, voice: true }));
        setIsVoiceModalOpen(false);
        try {
            const [meta, base64] = audioDataUrl.split(',');
            const mimeType = meta.match(/:(.*?);/)?.[1];
            if (!mimeType || !base64) throw new Error("Invalid audio data format.");
            
            const summary = await transcribeAndSummarizeAudio(base64, mimeType);
            setEditableResume(prev => prev ? { ...prev, summary } : null);
        } catch (e: any) {
            setError(e.message || "Failed to process audio summary.");
        } finally {
            setIsLoading(prev => ({ ...prev, voice: false }));
        }
    };

    const handleInputChange = (section: keyof InitialAnalysisResult, field: string, value: string) => {
        setEditableResume(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [section]: {
                    // @ts-ignore
                    ...prev[section],
                    [field]: value,
                }
            };
        });
    };
    
    const handleExperienceChange = (index: number, field: keyof ResumeSection, value: string | string[]) => {
        setEditableResume(prev => {
            if (!prev) return null;
            const newExperience = [...prev.experience];
            // @ts-ignore
            newExperience[index][field] = value;
            return { ...prev, experience: newExperience };
        });
    }

    const handleEducationChange = (index: number, field: keyof EducationSection, value: string) => {
        setEditableResume(prev => {
            if (!prev) return null;
            const newEducation = [...prev.education];
            // @ts-ignore
            newEducation[index][field] = value;
            return { ...prev, education: newEducation };
        });
    }

    const handleSkillChange = (catIndex: number, skillIndex: number, value: string) => {
        const newCats = [...categorizedSkills];
        newCats[catIndex].skills[skillIndex] = value;
        setCategorizedSkills(newCats);
    };

    const addSkill = (catIndex: number) => {
        const newCats = [...categorizedSkills];
        newCats[catIndex].skills.push('New Skill');
        setCategorizedSkills(newCats);
    }
    
    const removeSkill = (catIndex: number, skillIndex: number) => {
        const newCats = [...categorizedSkills];
        newCats[catIndex].skills.splice(skillIndex, 1);
        setCategorizedSkills(newCats);
    }
    
    const handleFinish = () => {
        if (editableResume) {
            // Re-flatten skills before passing on
            const flatSkills = categorizedSkills.flatMap(c => c.skills);
            onComplete({ ...editableResume, keySkills: flatSkills });
        }
    };

    if (!editableResume) {
        return <div className="text-center p-8">Loading analysis... If this persists, please go back and re-upload your documents.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl border border-neutral-200 p-6 flex items-center space-x-6">
                <TimelineIllustration className="h-24 w-24 text-neutral-800 flex-shrink-0 hidden sm:block" />
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Phase 2: Resume Enhancement Wizard</h2>
                    <p className="mt-2 text-neutral-600">
                        The AI has structured your resume. Review and enhance each section using the interactive editors and AI tools.
                    </p>
                </div>
            </div>
            
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

            <AccordionSection title="Contact Information" icon={<UserCircleIcon className="h-6 w-6 text-neutral-500" />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input value={editableResume.contactInfo.name} onChange={e => handleInputChange('contactInfo', 'name', e.target.value)} placeholder="Full Name" className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md" />
                    <input value={editableResume.contactInfo.email} onChange={e => handleInputChange('contactInfo', 'email', e.target.value)} placeholder="Email Address" className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md" />
                    <input value={editableResume.contactInfo.phone || ''} onChange={e => handleInputChange('contactInfo', 'phone', e.target.value)} placeholder="Phone Number" className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md" />
                    <input value={editableResume.contactInfo.linkedin || ''} onChange={e => handleInputChange('contactInfo', 'linkedin', e.target.value)} placeholder="LinkedIn URL" className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md" />
                    <input value={editableResume.contactInfo.location || ''} onChange={e => handleInputChange('contactInfo', 'location', e.target.value)} placeholder="City, State" className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md sm:col-span-2" />
                </div>
            </AccordionSection>

            <AccordionSection title="Professional Summary" icon={<DocumentTextIcon className="h-6 w-6 text-neutral-500" />}>
                <textarea
                    rows={4}
                    value={editableResume.summary}
                    onChange={(e) => setEditableResume(prev => prev ? { ...prev, summary: e.target.value } : null)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md mb-3"
                />
                <div className="flex flex-wrap gap-2">
                    <button onClick={handleImproveSummary} disabled={isLoading.summary} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-400">
                        <WandIcon className="h-4 w-4" /> <span>{isLoading.summary ? 'Improving...' : 'Improve with AI'}</span>
                    </button>
                    <button onClick={() => setIsVoiceModalOpen(true)} disabled={isLoading.voice} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300">
                        <MicrophoneIcon className="h-4 w-4" /> <span>{isLoading.voice ? 'Processing...' : 'Improve with Voice'}</span>
                    </button>
                </div>
            </AccordionSection>
            
            <AccordionSection title="Skills Organizer" icon={<SparklesIcon className="h-6 w-6 text-neutral-500" />}>
                 {isLoading.skills ? <p>Categorizing skills...</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {categorizedSkills.map((cat, catIndex) => (
                            <div key={cat.category} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                <h4 className="font-bold text-neutral-800 mb-3">{cat.category}</h4>
                                <div className="space-y-2">
                                    {cat.skills.map((skill, skillIndex) => (
                                        <div key={skillIndex} className="flex items-center space-x-2">
                                            <input value={skill} onChange={e => handleSkillChange(catIndex, skillIndex, e.target.value)} className="flex-grow p-1.5 text-sm bg-white border border-neutral-300 rounded-md" />
                                            <button onClick={() => removeSkill(catIndex, skillIndex)} className="p-1 rounded-full hover:bg-red-100 text-neutral-400 hover:text-red-500"><XMarkIcon className="h-4 w-4" /></button>
                                        </div>
                                    ))}
                                     <button onClick={() => addSkill(catIndex)} className="w-full flex items-center justify-center space-x-1 p-1.5 text-xs text-neutral-500 hover:bg-neutral-200 rounded-md"><PlusIcon className="h-3 w-3" /><span>Add Skill</span></button>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
            </AccordionSection>

            <AccordionSection title="Experience" icon={<BriefcaseIcon className="h-6 w-6 text-neutral-500" />}>
                <div className="space-y-6">
                    {editableResume.experience.map((exp, index) => (
                        <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                            <input value={exp.title} onChange={e => handleExperienceChange(index, 'title', e.target.value)} className="font-bold text-lg w-full p-1 -ml-1 rounded hover:bg-neutral-100" />
                            <div className="flex space-x-2 text-sm text-neutral-600">
                                <input value={exp.company} onChange={e => handleExperienceChange(index, 'company', e.target.value)} className="w-full p-1 -ml-1 rounded hover:bg-neutral-100" />
                                <span>|</span>
                                <input value={exp.dates} onChange={e => handleExperienceChange(index, 'dates', e.target.value)} className="w-full p-1 rounded hover:bg-neutral-100" />
                            </div>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                                {exp.achievements.map((ach, achIndex) => (
                                    <li key={achIndex}><input value={ach} onChange={e => {
                                        const newAchievements = [...exp.achievements];
                                        newAchievements[achIndex] = e.target.value;
                                        handleExperienceChange(index, 'achievements', newAchievements);
                                    }} className="w-full p-1 rounded hover:bg-neutral-100" /></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </AccordionSection>

            <AccordionSection title="Education" icon={<AcademicCapIcon className="h-6 w-6 text-neutral-500" />}>
                <div className="space-y-4">
                    {editableResume.education.map((edu, index) => (
                        <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                             <input value={edu.institution} onChange={e => handleEducationChange(index, 'institution', e.target.value)} className="font-bold text-lg w-full p-1 -ml-1 rounded hover:bg-neutral-100" />
                             <input value={edu.degree} onChange={e => handleEducationChange(index, 'degree', e.target.value)} className="text-sm italic text-neutral-600 w-full p-1 -ml-1 rounded hover:bg-neutral-100" />
                        </div>
                    ))}
                </div>
            </AccordionSection>
            
            <div className="flex justify-end pt-6 border-t border-neutral-200">
                <button onClick={handleFinish} className="px-8 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">
                    Next: Experience Deep Dive
                </button>
            </div>
             <Modal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} title="Improve Summary with Voice">
                <p className="text-neutral-600 mb-4">Record yourself giving a 1-2 minute summary of your background. The AI will transcribe and polish it into a professional resume summary.</p>
                <AudioRecorder initialAudioUrl={null} onRecordingComplete={handleVoiceSummary} />
            </Modal>
        </div>
    );
};

export default Phase2Insight;
