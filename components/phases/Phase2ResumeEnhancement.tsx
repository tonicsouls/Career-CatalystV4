import React, { useState, useEffect } from 'react';
import { InitialAnalysisResult, CategorizedSkills, EducationSection } from '../../types';
import { improveSummary, categorizeSkills, transcribeAndSummarizeAudio, suggestRelatedSkills, generateSummaryOptions, parseEducationFromText } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';
import { TimelineIllustration } from '../illustrations/TimelineIllustration';
import Modal from '../Modal';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { WandIcon } from '../icons/WandIcon';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import AudioRecorder from '../AudioRecorder';
import { XMarkIcon } from '../icons/XMarkIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { PencilIcon } from '../icons/PencilIcon';

interface Phase2ResumeEnhancementProps {
  initialAnalysis: InitialAnalysisResult | null;
  jobDescription: string;
  onComplete: (updatedResume: InitialAnalysisResult) => void;
}

const wizardSteps = ['Contact Info', 'Professional Summary', 'Skills Organizer', 'Education'];

const Phase2ResumeEnhancement: React.FC<Phase2ResumeEnhancementProps> = ({ initialAnalysis, jobDescription, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [editableResume, setEditableResume] = useState<InitialAnalysisResult | null>(initialAnalysis);
    const [categorizedSkills, setCategorizedSkills] = useState<CategorizedSkills[]>([]);
    const [isLoading, setIsLoading] = useState({ summary: false, skills: false, voice: false, suggestions: false, summaryOptions: false, educationVoice: false });
    const [error, setError] = useState<string | null>(null);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    
    // AI Suggestions State
    const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
    const [suggestionSource, setSuggestionSource] = useState<'jd' | 'general' | null>(null);
    const [summaryOptions, setSummaryOptions] = useState<string[]>([]);
    const [selectedSummaryIndex, setSelectedSummaryIndex] = useState<number | null>(null);

    // State for the new two-step skills organizer
    const [skillsStep, setSkillsStep] = useState<'categories' | 'details'>('categories');

    // State for editing education
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
    const [currentEducation, setCurrentEducation] = useState<EducationSection | null>(null);
    const [isEducationVoiceModalOpen, setIsEducationVoiceModalOpen] = useState(false);


    useEffect(() => {
        if (initialAnalysis) {
            setEditableResume(initialAnalysis);
            if (initialAnalysis.keySkills.length > 0) {
                handleCategorizeSkills(initialAnalysis.keySkills);
            }
            fetchSkillSuggestions();
            fetchSummaryOptions();
        }
    }, [initialAnalysis]);

    const fetchSummaryOptions = async () => {
        if (!initialAnalysis?.summary) return;
        setIsLoading(prev => ({...prev, summaryOptions: true}));
        setError(null);
        try {
            const options = await generateSummaryOptions(initialAnalysis.summary, jobDescription);
            setSummaryOptions(options);
            // Set the first option as the default
            setSelectedSummaryIndex(0);
            setEditableResume(prev => prev ? {...prev, summary: options[0]} : null);
        } catch (e: any) {
            setError(e.message || "Failed to generate summary options.");
            setSummaryOptions([initialAnalysis.summary]); // Fallback
            setSelectedSummaryIndex(0);
        } finally {
            setIsLoading(prev => ({...prev, summaryOptions: false}));
        }
    }
    
    const fetchSkillSuggestions = async () => {
        if (!initialAnalysis) return;
        setIsLoading(prev => ({ ...prev, suggestions: true }));
        try {
            if (initialAnalysis.matchAnalysis?.missingKeywords && initialAnalysis.matchAnalysis.missingKeywords.length > 0) {
                setSuggestedSkills(initialAnalysis.matchAnalysis.missingKeywords);
                setSuggestionSource('jd');
            } else if (initialAnalysis.keySkills.length > 0) {
                const suggestions = await suggestRelatedSkills(initialAnalysis.keySkills);
                setSuggestedSkills(suggestions);
                setSuggestionSource('general');
            }
        } catch (e: any) {
             setError(e.message || "Failed to fetch AI skill suggestions.");
        } finally {
            setIsLoading(prev => ({ ...prev, suggestions: false }));
        }
    };


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
            // Update the selected option text as well
            if (selectedSummaryIndex !== null) {
                const newOptions = [...summaryOptions];
                newOptions[selectedSummaryIndex] = improved;
                setSummaryOptions(newOptions);
            }
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
            if (selectedSummaryIndex !== null) {
                const newOptions = [...summaryOptions];
                newOptions[selectedSummaryIndex] = summary;
                setSummaryOptions(newOptions);
            }
        } catch (e: any) {
            setError(e.message || "Failed to process audio summary.");
        } finally {
            setIsLoading(prev => ({ ...prev, voice: false }));
        }
    };

    const handleInputChange = (section: keyof InitialAnalysisResult, field: string, value: string) => {
        setEditableResume(prev => {
            if (!prev) return null;
            return { ...prev, [section]: { ...prev[section as keyof InitialAnalysisResult] as object, [field]: value } };
        });
    };
    
    const openEducationEditor = (index: number) => {
        if (!editableResume) return;
        setEditingEducationIndex(index);
        setCurrentEducation(editableResume.education[index]);
        setIsEducationModalOpen(true);
    };

    const saveEducationChange = () => {
        if (editableResume && editingEducationIndex !== null && currentEducation) {
            const newEducation = [...editableResume.education];
            newEducation[editingEducationIndex] = currentEducation;
            setEditableResume({ ...editableResume, education: newEducation });
        }
        setIsEducationModalOpen(false);
        setEditingEducationIndex(null);
        setCurrentEducation(null);
    }
    
    const handleAddEducation = () => {
        setEditableResume(prev => {
            if (!prev) return null;
            const newEducation: EducationSection = { institution: 'New University', degree: 'Degree or Certificate', dates: 'Year - Year'};
            return {...prev, education: [...prev.education, newEducation]};
        });
    };

    const handleVoiceEducation = async (audioDataUrl: string) => {
        if (!audioDataUrl) {
            setIsEducationVoiceModalOpen(false);
            return;
        }
        setIsLoading(prev => ({ ...prev, educationVoice: true }));
        setIsEducationVoiceModalOpen(false);
        try {
            const [meta, base64] = audioDataUrl.split(',');
            const mimeType = meta.match(/:(.*?);/)?.[1];
            if (!mimeType || !base64) throw new Error("Invalid audio data format.");
            
            const text = await transcribeAndSummarizeAudio(base64, mimeType);
            const parsedEducation = await parseEducationFromText(text);

            setEditableResume(prev => {
                if (!prev) return null;
                return {...prev, education: [...prev.education, parsedEducation]};
            });

        } catch (e: any) {
            setError(e.message || "Failed to process audio for education.");
        } finally {
            setIsLoading(prev => ({ ...prev, educationVoice: false }));
        }
    };


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

    const handleDragStart = (e: React.DragEvent, catIndex: number, skillIndex: number) => {
        e.dataTransfer.setData('skill', JSON.stringify({ catIndex, skillIndex }));
    };

    const handleDrop = (e: React.DragEvent, targetCatIndex: number) => {
        e.preventDefault();
        const { catIndex: sourceCatIndex, skillIndex: sourceSkillIndex } = JSON.parse(e.dataTransfer.getData('skill'));
        
        if (sourceCatIndex === targetCatIndex) return; // No change if dropped in the same category

        const newCats = [...categorizedSkills];
        const [skillToMove] = newCats[sourceCatIndex].skills.splice(sourceSkillIndex, 1);
        newCats[targetCatIndex].skills.push(skillToMove);
        setCategorizedSkills(newCats);
    };

    
    const handleAddSuggestedSkill = (skillToAdd: string) => {
        if (categorizedSkills.length === 0) {
            setCategorizedSkills([{ category: 'General Skills', skills: [skillToAdd] }]);
        } else {
            const newCats = [...categorizedSkills];
            newCats[0].skills.push(skillToAdd);
            setCategorizedSkills(newCats);
        }
        setSuggestedSkills(prev => prev.filter(s => s !== skillToAdd));
    };

    const handleCategoryNameChange = (index: number, newName: string) => {
        const newCats = [...categorizedSkills];
        newCats[index].category = newName;
        setCategorizedSkills(newCats);
    };
    
    const addCategory = () => {
        setCategorizedSkills(prev => [...prev, { category: 'New Category', skills: [] }]);
    };
    
    const removeCategory = (index: number) => {
        setCategorizedSkills(prev => prev.filter((_, i) => i !== index));
    };

    const handleFinish = () => {
        if (editableResume) {
            const flatSkills = categorizedSkills.flatMap(c => c.skills);
            onComplete({ ...editableResume, keySkills: flatSkills });
        }
    };
    
    const handleNext = () => setCurrentStep(prev => prev + 1);
    const handleBack = () => setCurrentStep(prev => prev - 1);

    const renderContent = () => {
      switch (currentStep) {
        case 0: // Contact Info
          return (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-neutral-800">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input value={editableResume.contactInfo.name} onChange={e => handleInputChange('contactInfo', 'name', e.target.value)} placeholder="Full Name" className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md" />
                    <input value={editableResume.contactInfo.email} onChange={e => handleInputChange('contactInfo', 'email', e.target.value)} placeholder="Email Address" className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md" />
                    <input value={editableResume.contactInfo.phone || ''} onChange={e => handleInputChange('contactInfo', 'phone', e.target.value)} placeholder="Phone Number" className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md" />
                    <input value={editableResume.contactInfo.linkedin || ''} onChange={e => handleInputChange('contactInfo', 'linkedin', e.target.value)} placeholder="LinkedIn URL" className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md" />
                    <input value={editableResume.contactInfo.location || ''} onChange={e => handleInputChange('contactInfo', 'location', e.target.value)} placeholder="City, State" className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-md sm:col-span-2" />
                </div>
            </div>
          );
        case 1: // Professional Summary
            return (
                <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-neutral-800">Professional Summary</h3>
                    {isLoading.summaryOptions ? (
                        <p>Generating AI options...</p>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-neutral-600">The AI has generated a few options. Select the one that fits best, then refine it further.</p>
                            {summaryOptions.map((summary, index) => (
                                <label key={index} className={`flex items-start p-3 rounded-md border-2 cursor-pointer transition-colors ${selectedSummaryIndex === index ? 'bg-amber-50 border-amber-500' : 'bg-neutral-50 border-neutral-200 hover:border-neutral-400'}`}>
                                    <input 
                                        type="radio" name="summary-option" 
                                        className="mt-1 h-4 w-4 text-amber-600 bg-neutral-100 border-neutral-300 focus:ring-amber-500 shrink-0"
                                        checked={selectedSummaryIndex === index} 
                                        onChange={() => {
                                            setSelectedSummaryIndex(index);
                                            setEditableResume(prev => prev ? { ...prev, summary: summaryOptions[index] } : null);
                                        }} 
                                    />
                                    <span className="ml-3 text-sm text-neutral-700">{summary}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    <div className="pt-4 border-t border-dashed">
                         <textarea
                            rows={4}
                            value={editableResume.summary}
                            onChange={(e) => {
                                setEditableResume(prev => prev ? { ...prev, summary: e.target.value } : null);
                                // Update the selected option text as well if user edits manually
                                if (selectedSummaryIndex !== null) {
                                    const newOptions = [...summaryOptions];
                                    newOptions[selectedSummaryIndex] = e.target.value;
                                    setSummaryOptions(newOptions);
                                }
                            }}
                            className="w-full p-2 bg-white border border-neutral-200 rounded-md mb-3"
                        />
                        <div className="flex flex-wrap gap-2">
                            <button onClick={handleImproveSummary} disabled={isLoading.summary} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-400">
                                <WandIcon className="h-4 w-4" /> <span>{isLoading.summary ? 'Improving...' : 'Improve with AI'}</span>
                            </button>
                            <button onClick={() => setIsVoiceModalOpen(true)} disabled={isLoading.voice} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300">
                                <MicrophoneIcon className="h-4 w-4" /> <span>{isLoading.voice ? 'Processing...' : 'Improve with Voice'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        case 2: // Skills
          return (
             <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                 {skillsStep === 'categories' ? (
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800">Step 1: Review Your Skill Categories</h3>
                        <p className="text-sm text-neutral-600 mt-1">The AI has grouped your skills into these buckets. You can rename, add, or remove categories before organizing the individual skills.</p>
                        <p className="text-sm text-neutral-500 mt-1 mb-4">We recommend no more than 5 categories. We will add and enhance your skills on the next screen.</p>
                        <div className="space-y-3 my-4">
                            {categorizedSkills.map((cat, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        value={cat.category}
                                        onChange={(e) => handleCategoryNameChange(index, e.target.value)}
                                        className="flex-grow p-2 bg-neutral-50 border border-neutral-300 rounded-md font-semibold"
                                    />
                                    <button onClick={() => removeCategory(index)} className="p-2 rounded-full text-neutral-400 hover:bg-red-100 hover:text-red-500" title="Delete Category">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addCategory} className="flex items-center space-x-1 text-sm text-neutral-600 hover:text-neutral-800 font-medium">
                            <PlusIcon className="h-4 w-4" /> <span>Add Category</span>
                        </button>
                         <div className="mt-6 flex justify-end">
                            <button onClick={() => setSkillsStep('details')} className="px-6 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">
                                Confirm & Edit Individual Skills
                            </button>
                        </div>
                    </div>
                 ) : (
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4" style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}>
                        <button onClick={() => setSkillsStep('categories')} className="flex items-center space-x-2 text-sm font-medium text-neutral-600 hover:text-neutral-800 mb-4">
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span>Back to Categories</span>
                        </button>
                        <h3 className="text-lg font-bold text-neutral-800">Step 2: Organize Your Skills</h3>
                        <p className="text-sm text-neutral-600 mt-1 mb-4">Drag and drop skills to the correct category. Click on any skill to edit its name.</p>

                        <div className="space-y-4">
                          {(isLoading.suggestions || suggestedSkills.length > 0) && (
                              <div className="pt-2">
                                  <h4 className="font-bold text-neutral-800 mb-3 flex items-center">
                                      <SparklesIcon className="h-5 w-5 mr-2 text-amber-500" />
                                      AI Suggestions
                                      {suggestionSource === 'jd' && <span className="ml-2 text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">From Job Description</span>}
                                  </h4>
                                  {isLoading.suggestions ? <p className="text-sm text-neutral-500">Finding opportunities...</p> : (
                                      <div className="flex flex-wrap gap-2">
                                          {suggestedSkills.map((skill, index) => (
                                              <button key={index} onClick={() => handleAddSuggestedSkill(skill)}
                                                  className="flex items-center space-x-2 bg-amber-100 text-amber-800 text-sm font-medium pl-3 pr-2 py-1.5 rounded-full hover:bg-amber-200"
                                                  title="Add to skills">
                                                  <span>{skill}</span><PlusIcon className="h-4 w-4" />
                                              </button>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          )}
                          {isLoading.skills ? <p>Loading skills...</p> : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  {categorizedSkills.map((cat, catIndex) => (
                                      <details key={cat.category} open className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 group">
                                          <summary className="font-bold text-neutral-800 cursor-pointer list-none flex justify-between items-center">
                                             <input
                                                  value={cat.category}
                                                  onChange={(e) => handleCategoryNameChange(catIndex, e.target.value)}
                                                  onClick={(e) => e.stopPropagation()}
                                                  className="font-bold text-neutral-800 bg-transparent border-0 focus:ring-1 focus:ring-amber-500 rounded -ml-2 p-1 w-full"
                                              />
                                          </summary>
                                          <div 
                                              onDrop={(e) => handleDrop(e, catIndex)}
                                              onDragOver={(e) => e.preventDefault()}
                                              className="space-y-2 min-h-[50px] mt-3"
                                          >
                                              {cat.skills.map((skill, skillIndex) => (
                                                  <div 
                                                      key={skillIndex} 
                                                      draggable="true"
                                                      onDragStart={(e) => handleDragStart(e, catIndex, skillIndex)}
                                                      className="flex items-center space-x-2 bg-white p-1.5 rounded-md border border-neutral-300 cursor-grab"
                                                  >
                                                      <input value={skill} onChange={e => handleSkillChange(catIndex, skillIndex, e.target.value)} className="flex-grow text-sm bg-transparent border-0 focus:ring-0" />
                                                      <button onClick={() => removeSkill(catIndex, skillIndex)} className="p-1 rounded-full hover:bg-red-100 text-neutral-400 hover:text-red-500"><XMarkIcon className="h-4 w-4" /></button>
                                                  </div>
                                              ))}
                                          </div>
                                          <button onClick={() => addSkill(catIndex)} className="w-full mt-2 flex items-center justify-center space-x-1 p-1.5 text-xs text-neutral-500 hover:bg-neutral-200 rounded-md"><PlusIcon className="h-3 w-3" /><span>Add Skill</span></button>
                                      </div>
                                  ))}
                              </div>
                          )}
                        </div>
                    </div>
                 )}
            </div>
          );
        case 3: // Education
          return (
             <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
                 <h3 className="text-lg font-bold text-neutral-800">Education</h3>
                 <div className="space-y-4">
                    {editableResume.education.map((edu, index) => (
                        <div key={index} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg">{edu.institution}</p>
                                <p className="text-sm italic text-neutral-600">{edu.degree}</p>
                                {edu.dates && <p className="text-xs text-neutral-500 mt-1">{edu.dates}</p>}
                            </div>
                            <button onClick={() => openEducationEditor(index)} className="p-1.5 rounded-full text-neutral-500 hover:bg-amber-100 hover:text-amber-700 hover:ring-2 hover:ring-amber-300 transition-all" title="Edit Entry">
                                <PencilIcon className="h-5 w-5"/>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="pt-4 mt-4 border-t border-dashed flex items-center justify-center space-x-4">
                     <button onClick={handleAddEducation} className="flex items-center space-x-2 text-sm font-medium text-neutral-600 hover:text-neutral-800">
                        <PlusIcon className="h-4 w-4"/><span>Add Manually</span>
                     </button>
                     <div className="h-5 w-px bg-neutral-300"></div>
                      <button onClick={() => setIsEducationVoiceModalOpen(true)} disabled={isLoading.educationVoice} className="flex items-center space-x-2 text-sm font-medium text-neutral-600 hover:text-neutral-800">
                        <MicrophoneIcon className="h-4 w-4"/><span>{isLoading.educationVoice ? 'Processing...' : 'Add with Voice'}</span>
                     </button>
                </div>
            </div>
          );
        default: return null;
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
                        The AI has structured your resume. Review and enhance each section using the interactive editors and AI tools. Your work experience will be handled in the next step.
                    </p>
                </div>
            </div>
            
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
            
            {/* Stepper */}
            <div className="p-4 bg-white rounded-xl border border-neutral-200">
                <ol className="flex items-center">
                    {wizardSteps.map((step, index) => (
                        <li key={step} className={`flex-1 ${index < wizardSteps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-neutral-200 after:border-2 after:inline-block" : ''} ${index < currentStep ? 'after:border-amber-500' : ''}`}>
                             <div className="flex items-center font-medium">
                                <span className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${index <= currentStep ? 'bg-amber-500 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                                    {index < currentStep ? <CheckIcon className="w-5 h-5" /> : index + 1}
                                </span>
                                <span className={`ml-3 hidden sm:inline ${index === currentStep ? 'text-neutral-800' : 'text-neutral-500'}`}>{step}</span>
                             </div>
                        </li>
                    ))}
                </ol>
            </div>
            
            {renderContent()}

            <div className="flex justify-between pt-6 border-t border-neutral-200">
                <button onClick={handleBack} disabled={currentStep === 0} className="px-6 py-2 font-medium rounded-md text-neutral-700 bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50">
                    Back
                </button>
                {currentStep < wizardSteps.length - 1 ? (
                    <button onClick={handleNext} className="px-8 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">
                        Next
                    </button>
                ) : (
                    <button onClick={handleFinish} className="px-8 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">
                        Next: Confirm Experience
                    </button>
                )}
            </div>
             <Modal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} title="Improve Summary with Voice">
                <p className="text-neutral-600 mb-4">Record yourself giving a 1-2 minute summary of your background. The AI will transcribe and polish it into a professional resume summary.</p>
                <AudioRecorder initialAudioUrl={null} onRecordingComplete={handleVoiceSummary} />
            </Modal>
             <Modal isOpen={isEducationVoiceModalOpen} onClose={() => setIsEducationVoiceModalOpen(false)} title="Add Education with Voice">
                <p className="text-neutral-600 mb-4">State your degree, institution, and dates. For example: "I received my Master of Business Administration from Louisiana State University in 2024."</p>
                <AudioRecorder initialAudioUrl={null} onRecordingComplete={handleVoiceEducation} />
            </Modal>
             <Modal isOpen={isEducationModalOpen} onClose={() => setIsEducationModalOpen(false)} title="Edit Education">
                {currentEducation && (
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="institution" className="block text-sm font-medium text-neutral-700">Institution</label>
                            <input type="text" id="institution" value={currentEducation.institution}
                                   onChange={e => setCurrentEducation({...currentEducation, institution: e.target.value})}
                                   className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="degree" className="block text-sm font-medium text-neutral-700">Degree</label>
                            <input type="text" id="degree" value={currentEducation.degree}
                                   onChange={e => setCurrentEducation({...currentEducation, degree: e.target.value})}
                                   className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"/>
                        </div>
                         <div>
                            {/* FIX: Corrected typo in closing tag from </glabel> to </label> */}
                            <label htmlFor="dates" className="block text-sm font-medium text-neutral-700">Dates</label>
                            <input type="text" id="dates" value={currentEducation.dates || ''}
                                   onChange={e => setCurrentEducation({...currentEducation, dates: e.target.value})}
                                   className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"/>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button onClick={() => setIsEducationModalOpen(false)} className="px-4 py-2 rounded-md bg-neutral-200 hover:bg-neutral-300">Cancel</button>
                            <button onClick={saveEducationChange} className="px-4 py-2 rounded-md bg-neutral-800 text-white hover:bg-neutral-700">Save</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Phase2ResumeEnhancement;