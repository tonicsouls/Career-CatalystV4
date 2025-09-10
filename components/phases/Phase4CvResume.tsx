
import React, { useState, useRef } from 'react';
import { generateResume, regenerateProjections } from '../../services/geminiService';
import { BrainDumpModule, GeneratedResumeData, SavedResumeVersion, TimelineEvent } from '../../types';
import { SparklesIcon } from '../icons/SparklesIcon';
import { CopyIcon } from '../icons/CopyIcon';
import { PencilIcon } from '../icons/PencilIcon';
import CvViewer from '../CvViewer';
import { FileDownloadIcon } from '../icons/FileDownloadIcon';
import { ArchiveBoxArrowDownIcon } from '../icons/ArchiveBoxArrowDownIcon';
import Modal from '../Modal';
import { TrashIcon } from '../icons/TrashIcon';
import { DocumentDuplicateIcon } from '../icons/DocumentDuplicateIcon';
import { CompassIcon } from '../icons/CompassIcon';

// Declare globals from CDN scripts
declare const jspdf: any;
declare const html2canvas: any;

interface Phase4CvResumeProps {
    timelineEvents: TimelineEvent[];
    brainDumpModules: BrainDumpModule[];
    jobDescription: string;
    generatedResume: GeneratedResumeData | null;
    setGeneratedResume: (resume: GeneratedResumeData | null) => void;
    advanceToPhase: (phaseId: string) => void;
    onPhase4Complete: () => void;
    onRefineProjections: (customInput: string) => Promise<GeneratedResumeData['careerProjections']>;
    savedResumeVersions: SavedResumeVersion[];
    setSavedResumeVersions: React.Dispatch<React.SetStateAction<SavedResumeVersion[]>>;
}

const Phase4CvResume: React.FC<Phase4CvResumeProps> = (props) => {
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSummaryIndex, setSelectedSummaryIndex] = useState(0);
    const [selectedCompetencyIndex, setSelectedCompetencyIndex] = useState(0);
    const [isEditingOptions, setIsEditingOptions] = useState(true); 
    const [editableResume, setEditableResume] = useState<GeneratedResumeData | null>(props.generatedResume);
    const [customProjectionInput, setCustomProjectionInput] = useState('');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [versionName, setVersionName] = useState('');

    const cvPreviewRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setEditableResume(props.generatedResume);
    }, [props.generatedResume]);

    const handleRefine = async () => {
        if (!customProjectionInput.trim()) return;
        setIsRefining(true);
        setError(null);
        try {
            await props.onRefineProjections(customProjectionInput);
        } catch (e: any) {
            setError(e.message || "Failed to refine projections.");
        } finally {
            setIsRefining(false);
        }
    };
    
    const handleDirectEdit = (path: any[], value: string) => {
        setEditableResume(prev => {
            if (!prev) return null;
            // A simple immutable update for nested properties
            const newResume = JSON.parse(JSON.stringify(prev));
            let current = newResume;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = value;
            return newResume;
        });
    };

    const handleSaveVersion = () => {
        if (!versionName.trim() || !editableResume) return;
        const newVersion: SavedResumeVersion = {
            id: Date.now().toString(),
            name: versionName,
            resumeData: {
                ...editableResume,
                executiveSummaries: [editableResume.executiveSummaries[selectedSummaryIndex]],
                coreCompetencies: [editableResume.coreCompetencies[selectedCompetencyIndex]],
            },
            jobDescription: props.jobDescription,
            createdAt: new Date().toISOString(),
        };
        props.setSavedResumeVersions(prev => [newVersion, ...prev].slice(0, 10));
        props.setGeneratedResume(editableResume); // Save the edited version as the main one
        setIsSaveModalOpen(false);
        setVersionName('');
    };

    const handleLoadVersion = (version: SavedResumeVersion) => {
        props.setGeneratedResume(version.resumeData);
        setEditableResume(version.resumeData);
        setSelectedSummaryIndex(0);
        setSelectedCompetencyIndex(0);
    };
    
    const handleDeleteVersion = (versionId: string) => {
        if (window.confirm("Are you sure you want to delete this version?")) {
            props.setSavedResumeVersions(prev => prev.filter(v => v.id !== versionId));
        }
    };


    const handleDownloadPdf = async () => {
        const element = cvPreviewRef.current;
        if (!element) return;

        try {
            const { jsPDF } = jspdf;
            const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            pdf.save("CareerCatalyst_CV.pdf");

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Sorry, there was an error generating the PDF.");
        }
    };

    const handleCopyToClipboard = () => {
        if (!editableResume) return;
        
        const selectedSummary = editableResume.executiveSummaries[selectedSummaryIndex];
        const selectedCompetencies = editableResume.coreCompetencies[selectedCompetencyIndex];
        const competenciesText = (selectedCompetencies.categories || []).map(cat => 
            `**${cat.category}:** ${cat.details}`
        ).join('\n');

        const experienceText = editableResume.experience.map(exp => 
            `**${exp.title}** | ${exp.company}\n${exp.dates}\n` + exp.achievements.map(a => `- ${a}`).join('\n')
        ).join('\n\n');
        
        const textToCopy = `
# ${editableResume.contactInfo.name}
${editableResume.contactInfo.location} | ${editableResume.contactInfo.phone} | ${editableResume.contactInfo.email} | ${editableResume.contactInfo.linkedin}

## Summary
${selectedSummary}

## Core Competencies
${competenciesText}

## Experience
${experienceText}

## Education
${editableResume.education.map(edu => `${edu.degree}, ${edu.institution}`).join('\n')}
        `;
        
        navigator.clipboard.writeText(textToCopy.trim())
            .then(() => alert('Resume content copied to clipboard!'))
            .catch(err => console.error('Failed to copy text: ', err));
    };

    if (!editableResume) {
        return <div className="text-center p-8">Loading or no resume data available... Please go back to the 'Generate Resume' step.</div>;
    }
    
    const { executiveSummaries, coreCompetencies, careerProjections } = editableResume;

    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-neutral-800">{isEditingOptions ? 'Customize Your AI-Generated Resume' : 'Live Edit Your Resume'}</h2>
                    <div className="flex items-center space-x-2">
                         <button onClick={() => setIsEditingOptions(!isEditingOptions)} className="flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700">
                            <PencilIcon className="h-4 w-4"/>
                            <span>{isEditingOptions ? 'Preview & Edit Text' : 'Choose Options'}</span>
                        </button>
                    </div>
                </div>

                {isEditingOptions ? (
                    <>
                        <p className="text-neutral-600 -mt-4 mb-6">The AI has generated multiple options for key sections. Select the ones that best fit your style.</p>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Executive Summary Options</h3>
                                <div className="space-y-2">
                                    {executiveSummaries.map((summary, index) => (
                                        <label key={index} className="flex items-start p-3 rounded-md bg-neutral-50 border border-neutral-200 has-[:checked]:bg-amber-50 has-[:checked]:border-amber-500 cursor-pointer">
                                            <input type="radio" name="summary-option" className="mt-1 h-4 w-4 text-amber-600 bg-neutral-100 border-neutral-300 focus:ring-amber-500"
                                                checked={selectedSummaryIndex === index} onChange={() => setSelectedSummaryIndex(index)} />
                                            <span className="ml-3 text-sm text-neutral-600">{summary}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                             <div>
                                <h3 className="text-lg font-semibold text-neutral-700 mb-2">Core Competency Options</h3>
                                <div className="space-y-2">
                                    {coreCompetencies.map((version, index) => (
                                        <label key={version.id} className="flex items-start p-3 rounded-md bg-neutral-50 border border-neutral-200 has-[:checked]:bg-amber-50 has-[:checked]:border-amber-500 cursor-pointer">
                                            <input type="radio" name="competency-option" className="mt-1 h-4 w-4 text-amber-600 bg-neutral-100 border-neutral-300 focus:ring-amber-500"
                                                checked={selectedCompetencyIndex === index} onChange={() => setSelectedCompetencyIndex(index)} />
                                            <div className="ml-3">
                                                <span className="text-sm font-semibold text-neutral-800">{version.title}</span>
                                                <div className="text-xs text-neutral-500 mt-1">
                                                    {(version.categories || []).map(c => c.category).join(', ')}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </>
                ) : (
                    <div className="bg-amber-50 border border-amber-300 text-amber-800 p-3 rounded-md text-sm mb-4">
                        <strong>Live Edit Mode:</strong> Click on any text in the preview below to edit it directly. Your changes will be saved when you save a version.
                    </div>
                   <div ref={cvPreviewRef} className="bg-white p-2 rounded ring-1 ring-neutral-200">
                     <CvViewer resumeData={editableResume} selectedSummaryIndex={selectedSummaryIndex} selectedCompetencyIndex={selectedCompetencyIndex} isEditable={true} onEdit={handleDirectEdit} />
                   </div>
                )}
            </div>
            <aside className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl p-6 border border-neutral-200">
                    <h3 className="font-bold text-neutral-800">Actions</h3>
                    <div className="mt-4 space-y-2">
                         <button onClick={() => setIsSaveModalOpen(true)} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">
                            <ArchiveBoxArrowDownIcon className="h-4 w-4 mr-2" /> Save Current Version
                        </button>
                         <button onClick={handleDownloadPdf} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600">
                            <FileDownloadIcon className="h-4 w-4 mr-2" /> Download as PDF
                        </button>
                        <button onClick={handleCopyToClipboard} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-amber-500 hover:bg-amber-600">
                            <CopyIcon className="h-4 w-4 mr-2" /> Copy as Text
                        </button>
                         <button onClick={props.onPhase4Complete} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">
                            Next: Generate Cover Letter
                        </button>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-neutral-200">
                    <h3 className="font-bold text-neutral-800">Saved Versions</h3>
                    <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
                        {props.savedResumeVersions.length > 0 ? props.savedResumeVersions.map(v => (
                            <div key={v.id} className="text-sm p-3 bg-neutral-50 rounded-md border border-neutral-200">
                                <p className="font-semibold text-neutral-800">{v.name}</p>
                                <p className="text-xs text-neutral-500">Saved: {new Date(v.createdAt).toLocaleDateString()}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                    <button onClick={() => handleLoadVersion(v)} className="flex-1 text-xs px-2 py-1 rounded bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center"><DocumentDuplicateIcon className="h-3 w-3 mr-1"/> Load</button>
                                    <button onClick={() => handleDeleteVersion(v.id)} className="p-1 rounded text-neutral-400 hover:bg-red-100 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                                </div>
                            </div>
                        )) : <p className="text-sm text-neutral-500">No versions saved yet.</p>}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-neutral-200">
                    <h3 className="font-bold text-neutral-800 flex items-center"><CompassIcon className="h-5 w-5 mr-2 text-neutral-800"/> AI Career Projections</h3>
                     <div className="mt-4 space-y-3">
                        {careerProjections.map((proj, index) => (
                            <div key={index} className="pb-3 border-b border-neutral-200 last:border-b-0">
                                <p className="font-semibold text-neutral-700">{proj.role}</p>
                                <p className="text-sm text-neutral-500">{proj.reason}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <label htmlFor="custom-projection" className="block text-sm font-medium text-neutral-700">Lean towards something else?</label>
                        <textarea
                            id="custom-projection"
                            rows={3}
                            maxLength={150}
                            value={customProjectionInput}
                            onChange={(e) => setCustomProjectionInput(e.target.value)}
                            className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md text-sm text-neutral-800"
                            placeholder="e.g., 'a role with more leadership' or 'transitioning into the AI/ML space'"
                        />
                        <button onClick={handleRefine} disabled={isRefining} className="mt-2 w-full text-center px-4 py-2 text-sm font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-300">
                            {isRefining ? 'Refining...' : 'Refine Projections'}
                        </button>
                    </div>
                </div>
            </aside>
        </div>
        <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title="Save Resume Version">
            <div className="space-y-4">
                <p className="text-neutral-600">Give this version a descriptive name to remember why you tailored it (e.g., "Version for Cloud Services Role").</p>
                <div>
                    <label htmlFor="versionName" className="block text-sm font-medium text-neutral-700">Version Name</label>
                    <input type="text" id="versionName" value={versionName} onChange={e => setVersionName(e.target.value)}
                        className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md focus:ring-1 focus:ring-amber-500"/>
                </div>
                <div className="flex justify-end space-x-3">
                    <button onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 rounded-md bg-neutral-200 hover:bg-neutral-300">Cancel</button>
                    <button onClick={handleSaveVersion} className="px-4 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white">Save</button>
                </div>
            </div>
        </Modal>
        </>
    );
};

export default Phase4CvResume;
