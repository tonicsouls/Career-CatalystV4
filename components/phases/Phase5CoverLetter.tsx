
import React, { useState, useEffect } from 'react';
import { BrainDumpModule, GeneratedResumeData } from '../../types';
import { generateCoverLetter, adjustCoverLetterTone } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';
import { WandIcon } from '../icons/WandIcon';
import { CopyIcon } from '../icons/CopyIcon';
import { FileDownloadIcon } from '../icons/FileDownloadIcon';

interface Phase5CoverLetterProps {
    generatedResume: GeneratedResumeData | null;
    brainDumpModules: BrainDumpModule[];
    jobDescription: string;
    generatedCoverLetter: string | null;
    setGeneratedCoverLetter: (letter: string | null) => void;
    onComplete: () => void;
}

const Phase5CoverLetter: React.FC<Phase5CoverLetterProps> = ({
    generatedResume,
    brainDumpModules,
    jobDescription,
    generatedCoverLetter,
    setGeneratedCoverLetter,
    onComplete,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hiringManager, setHiringManager] = useState('');
    const [coverLetterText, setCoverLetterText] = useState(generatedCoverLetter || '');

    useEffect(() => {
        setCoverLetterText(generatedCoverLetter || '');
    }, [generatedCoverLetter]);

    const handleGenerate = async () => {
        if (!generatedResume) {
            setError("Cannot generate a cover letter without a resume. Please complete the previous step.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const letter = await generateCoverLetter(generatedResume, brainDumpModules, jobDescription, { hiringManager });
            setGeneratedCoverLetter(letter);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAdjustTone = async (instruction: string) => {
        setIsRefining(true);
        setError(null);
        try {
            const newLetter = await adjustCoverLetterTone(coverLetterText, instruction);
            setCoverLetterText(newLetter); // Update local state for immediate feedback
            setGeneratedCoverLetter(newLetter); // Persist to main state
        } catch (e: any)
        {
            setError(e.message || "Failed to adjust tone.");
        } finally {
            setIsRefining(false);
        }
    }

    const handleDownloadTxt = () => {
        const blob = new Blob([coverLetterText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Cover_Letter.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!generatedCoverLetter) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-neutral-200 max-w-3xl mx-auto text-center p-8">
                <SparklesIcon className="mx-auto h-12 w-12 text-neutral-800" />
                <h2 className="mt-4 text-2xl font-bold text-neutral-800">Generate Your Cover Letter</h2>
                <p className="mt-2 text-neutral-600">
                    The AI will now analyze your final resume and brain dump stories to learn your unique "voice," then craft a compelling letter tailored to the target job description.
                </p>
                
                <div className="mt-6 text-left max-w-sm mx-auto">
                    <label htmlFor="hiringManager" className="block text-sm font-medium text-neutral-700">Hiring Manager's Name (Optional)</label>
                    <input type="text" id="hiringManager" value={hiringManager} onChange={(e) => setHiringManager(e.target.value)}
                           className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md focus:ring-1 focus:ring-amber-500"
                           placeholder="e.g., Jane Doe" />
                </div>
                
                {error && (
                    <div className="mt-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-left">
                        <strong className="font-bold">Error: </strong>{error}
                    </div>
                )}
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="mt-6 w-full sm:w-auto flex items-center justify-center mx-auto px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Writing...' : 'Generate Cover Letter'}
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">Review & Refine Your Cover Letter</h2>
                <textarea
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                    onBlur={() => setGeneratedCoverLetter(coverLetterText)}
                    className="w-full h-[65vh] p-4 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-800 whitespace-pre-wrap"
                />
            </div>
             <aside className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl p-6 border border-neutral-200">
                    <h3 className="font-bold text-neutral-800 flex items-center"><WandIcon className="h-5 w-5 mr-2 text-neutral-800"/> AI Tone Adjustment</h3>
                    <p className="text-xs text-neutral-500 mt-1 mb-3">Instantly fine-tune the letter to your needs.</p>
                     {isRefining && <p className="text-sm text-neutral-800 animate-pulse">Refining tone...</p>}
                     <div className="space-y-2">
                        {["More Formal", "More Enthusiastic", "More Concise", "Slightly More Casual"].map(tone => (
                            <button key={tone} onClick={() => handleAdjustTone(tone)} disabled={isRefining}
                                className="w-full text-left p-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors disabled:opacity-50">
                                Adjust Tone: {tone}
                            </button>
                        ))}
                    </div>
                </div>
                 <div className="bg-white rounded-xl p-6 border border-neutral-200">
                    <h3 className="font-bold text-neutral-800">Actions</h3>
                    <div className="mt-4 space-y-2">
                         <button onClick={() => navigator.clipboard.writeText(coverLetterText)} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-neutral-700 bg-neutral-100 hover:bg-neutral-200">
                            <CopyIcon className="h-4 w-4 mr-2" /> Copy Text
                        </button>
                         <button onClick={handleDownloadTxt} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-neutral-700 bg-neutral-100 hover:bg-neutral-200">
                            <FileDownloadIcon className="h-4 w-4 mr-2" /> Download as .txt
                        </button>
                         <button onClick={onComplete} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">
                            Finish & Continue
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default Phase5CoverLetter;
