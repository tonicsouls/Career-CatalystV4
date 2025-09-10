import React, { useState } from 'react';
import { generateRecommendationRequest } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { CopyIcon } from './icons/CopyIcon';

const steps = ['Recipient', 'Context', 'Generate'];

const RecommendationWizard: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [recipientName, setRecipientName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [keyPoints, setKeyPoints] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedMessage, setGeneratedMessage] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        try {
            const message = await generateRecommendationRequest(recipientName, relationship, keyPoints);
            setGeneratedMessage(message);
            setCurrentStep(prev => prev + 1);
        } catch (e: any) {
            setError(e.message || "Failed to generate message.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="recipientName" className="block text-sm font-medium text-neutral-700">Who are you asking?</label>
                            <input type="text" id="recipientName" value={recipientName} onChange={e => setRecipientName(e.target.value)}
                                className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"
                                placeholder="e.g., Jane Doe" />
                        </div>
                        <div>
                            <label htmlFor="relationship" className="block text-sm font-medium text-neutral-700">How do you know them?</label>
                            <input type="text" id="relationship" value={relationship} onChange={e => setRelationship(e.target.value)}
                                className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"
                                placeholder="e.g., She was my direct manager at TechCorp" />
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div>
                        <label htmlFor="keyPoints" className="block text-sm font-medium text-neutral-700">What key skills or projects should they highlight?</label>
                        <p className="text-xs text-neutral-500 mb-2">Provide a few bullet points to guide them.</p>
                        <textarea id="keyPoints" rows={6} value={keyPoints} onChange={e => setKeyPoints(e.target.value)}
                            className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"
                            placeholder="- Leadership on the Project X migration&#10;- My skills in Python and data analysis&#10;- My ability to collaborate with cross-functional teams" />
                    </div>
                );
            case 2:
                 return (
                    <div className="text-center">
                        <p className="text-neutral-600">You've provided all the necessary details. Ready to generate your personalized request?</p>
                        {error && <p className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                        <button onClick={handleGenerate} disabled={isLoading}
                             className="mt-6 w-full sm:w-auto flex items-center justify-center mx-auto px-6 py-2.5 font-semibold rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-300 disabled:text-neutral-500">
                             <SparklesIcon className="h-5 w-5 mr-2" />
                            {isLoading ? 'Generating...' : 'Generate Request'}
                        </button>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-3">Generated Message</h3>
                        <div className="relative p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                            <button onClick={() => navigator.clipboard.writeText(generatedMessage)} className="absolute top-2 right-2 p-2 rounded-full hover:bg-neutral-200" title="Copy">
                                <CopyIcon className="h-4 w-4 text-neutral-500" />
                            </button>
                            <p className="text-neutral-700 whitespace-pre-wrap">{generatedMessage}</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="mt-6">
            <div className="mb-6">
                <ol className="flex items-center w-full">
                    {steps.map((step, index) => (
                        <li key={step} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-neutral-300 after:border-4 after:inline-block" : ''} ${index <= currentStep ? 'after:border-neutral-800' : 'after:border-neutral-300'}`}>
                            <span className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${index <= currentStep ? 'bg-neutral-800' : 'bg-neutral-200'}`}>
                                <span className={`${index <= currentStep ? 'text-white' : 'text-neutral-500'} font-bold`}>{index + 1}</span>
                            </span>
                        </li>
                    ))}
                </ol>
            </div>
            
            <div className="p-6 bg-white border border-neutral-200 rounded-lg min-h-[250px] flex flex-col justify-center">
                {renderStepContent()}
            </div>
            
            <div className="mt-6 flex justify-between">
                <button onClick={() => setCurrentStep(p => p - 1)} disabled={currentStep === 0 || currentStep === 3}
                    className="px-4 py-2 text-sm font-medium rounded-md text-neutral-700 bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    Back
                </button>
                {currentStep < 2 && (
                    <button onClick={() => setCurrentStep(p => p + 1)} disabled={currentStep > 1}
                        className="px-6 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50">
                        Next
                    </button>
                )}
                 {currentStep === 3 && (
                     <button onClick={() => { setCurrentStep(0); setGeneratedMessage(''); }} className="px-6 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">
                        Start Over
                    </button>
                 )}
            </div>
        </div>
    );
};

export default RecommendationWizard;