
import React from 'react';
import { GeneratedResumeData } from '../types';

type EditPath = 
    | ['contactInfo', keyof GeneratedResumeData['contactInfo']]
    | ['executiveSummaries', number]
    | ['experience', number, 'title' | 'company' | 'location' | 'dates']
    | ['experience', number, 'achievements', number]
    | ['education', number, 'degree' | 'institution']
    | ['coreCompetencies', number, 'categories', number, 'details'];

interface CvViewerProps {
    resumeData: GeneratedResumeData;
    selectedSummaryIndex: number;
    selectedCompetencyIndex: number;
    isEditable?: boolean;
    onEdit?: (path: EditPath, value: string) => void;
}

const CvViewer: React.FC<CvViewerProps> = ({ resumeData, selectedSummaryIndex, selectedCompetencyIndex, isEditable = false, onEdit = () => {} }) => {
    const { contactInfo, executiveSummaries, coreCompetencies, experience, education } = resumeData;
    const selectedSummary = executiveSummaries[selectedSummaryIndex];
    const selectedCompetencyVersion = coreCompetencies?.[selectedCompetencyIndex] || coreCompetencies?.[0];

    const handleBlur = (path: EditPath, e: React.FocusEvent<HTMLElement>) => {
        onEdit(path, e.currentTarget.innerText);
    };

    return (
        <div className="p-8 bg-white text-gray-800 font-serif text-sm">
            {/* Header */}
            <div className="text-center border-b pb-4">
                <h1 className="text-4xl font-bold tracking-wider" suppressContentEditableWarning contentEditable={isEditable} onBlur={(e) => handleBlur(['contactInfo', 'name'], e)}>{contactInfo.name}</h1>
                <p className="mt-2 text-xs" suppressContentEditableWarning contentEditable={isEditable} onBlur={(e) => handleBlur(['contactInfo', 'location'], e)}>
                    {contactInfo.location} | {contactInfo.phone} | {contactInfo.email} | {contactInfo.linkedin}
                </p>
            </div>

            {/* Summary */}
            <div className="mt-6">
                <h2 className="text-lg font-bold uppercase border-b pb-1">Executive Summary</h2>
                <p className="mt-2 text-justify" suppressContentEditableWarning contentEditable={isEditable} onBlur={(e) => handleBlur(['executiveSummaries', selectedSummaryIndex], e)}>{selectedSummary}</p>
            </div>
            
            {/* Core Competencies */}
             <div className="mt-6">
                <h2 className="text-lg font-bold uppercase border-b pb-1">Core Competencies</h2>
                <div className="mt-2 text-sm space-y-1">
                    {(selectedCompetencyVersion?.categories || []).map((cat, index) => (
                        <div key={index} className="flex items-start">
                           <span className="font-bold w-1/4 shrink-0">{cat.category}:</span>
                           <span className="ml-2" suppressContentEditableWarning contentEditable={isEditable} onBlur={(e) => handleBlur(['coreCompetencies', selectedCompetencyIndex, 'categories', index, 'details'], e)}>{cat.details}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Experience */}
            <div className="mt-6">
                <h2 className="text-lg font-bold uppercase border-b pb-1">Professional Experience</h2>
                <div className="mt-2 space-y-4">
                    {experience.map((job, jobIndex) => (
                        <div key={jobIndex}>
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-md font-bold" suppressContentEditableWarning contentEditable={isEditable} onBlur={(e) => handleBlur(['experience', jobIndex, 'title'], e)}>{job.title}</h3>
                                <p className="text-xs font-semibold" suppressContentEditableWarning contentEditable={isEditable} onBlur={(e) => handleBlur(['experience', jobIndex, 'dates'], e)}>{job.dates}</p>
                            </div>
                            <p className="text-sm font-semibold italic" suppressContentEditableWarning contentEditable={isEditable} onBlur={(e) => handleBlur(['experience', jobIndex, 'company'], e)}>{job.company}, {job.location}</p>
                            <ul className="list-disc list-inside mt-1 space-y-1 pl-2">
                                {job.achievements.map((ach, achIndex) => <li key={achIndex} suppressContentEditableWarning contentEditable={isEditable} onBlur={(e) => handleBlur(['experience', jobIndex, 'achievements', achIndex], e)}>{ach}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Education */}
            <div className="mt-6">
                <h2 className="text-lg font-bold uppercase border-b pb-1">Education</h2>
                <div className="mt-2">
                    {education.map((edu, index) => (
                        <div key={index}>
                           <h3 className="text-md font-bold" suppressContentEditableWarning contentEditable={isEditable} onBlur={(e) => handleBlur(['education', index, 'institution'], e)}>{edu.institution}</h3>
                           <p className="italic" suppressContentEditableWarning contentEditable={isEditable} onBlur={(e) => handleBlur(['education', index, 'degree'], e)}>{edu.degree}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CvViewer;
