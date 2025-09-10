
import React, { useState } from 'react';
import { generateResume } from '../../services/geminiService';
import { BrainDumpModule, GeneratedResumeData, TimelineEvent } from '../../types';
import { SparklesIcon } from '../icons/SparklesIcon';

interface Phase4CvResumeGenerateProps {
    timelineEvents: TimelineEvent[];
    brainDumpModules: BrainDumpModule[];
    jobDescription: string;
    setGeneratedResume: (resume: GeneratedResumeData | null) => void;
    advanceToPhase: (phaseId: string) => void;
}

const Phase4CvResumeGenerate: React.FC<Phase4CvResumeGenerateProps> = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateResume(props.timelineEvents, props.brainDumpModules, props.jobDescription);
            props.setGeneratedResume(result);
            props.advanceToPhase('cv_resume_review');
        } catch (e: any) {
            setError(e.message || "An unknown error occurred during resume generation.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 max-w-3xl mx-auto text-center p-8">
            <SparklesIcon className="mx-auto h-12 w-12 text-neutral-800" />
            <h2 className="mt-4 text-2xl font-bold text-neutral-800">CV & Resume Overhaul</h2>
            <p className="mt-2 text-neutral-600">
                You've provided all the necessary data. Now, let's use AI to synthesize your timeline and stories into a powerful, achievement-oriented resume tailored to your target role.
            </p>
            {error && (
                <div className="mt-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-left">
                    <strong className="font-bold">Error: </strong>{error}
                </div>
            )}
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="mt-6 w-full sm:w-auto flex items-center justify-center mx-auto px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed disabled:text-neutral-500"
            >
                {isLoading ? 'Generating...' : 'Generate Overhauled Resume'}
            </button>
        </div>
    );
};

export default Phase4CvResumeGenerate;
