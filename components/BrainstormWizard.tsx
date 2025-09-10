import React, { useState, useEffect } from 'react';

interface BrainstormWizardProps {
  initialText: string;
  onComplete: (newText: string) => void;
}

const steps = [
  'Context',
  'Action',
  'Result',
  'Review',
];

const BrainstormWizard: React.FC<BrainstormWizardProps> = ({ initialText, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [context, setContext] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');
  const [combinedText, setCombinedText] = useState(initialText);

  useEffect(() => {
    // A simple parser to pre-fill fields if the text follows a basic structure
    if (initialText) {
      const contextMatch = initialText.match(/Context: (.*)/);
      const actionMatch = initialText.match(/Action: (.*)/);
      const resultMatch = initialText.match(/Result: (.*)/);

      if (contextMatch && actionMatch && resultMatch) {
        setContext(contextMatch[1]);
        setAction(actionMatch[1]);
        setResult(resultMatch[1]);
      } else {
        // If no structure, put the whole thing in 'Context' to start
        setContext(initialText);
      }
    }
  }, [initialText]);

  const goToNext = () => {
    if (currentStep === steps.length - 1) {
      onComplete(combinedText);
    } else {
      if (currentStep === 2) { // When moving from Result to Review
        const newCombined = `Context: ${context}\nAction: ${action}\nResult: ${result}`;
        setCombinedText(newCombined);
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  const renderStepContent = () => {
    switch(currentStep) {
        case 0:
            return (
                <div>
                    <label htmlFor="context" className="block text-sm font-medium text-slate-300">What was the situation or challenge?</label>
                    <p className="text-xs text-slate-500 mb-2">Describe the context. What was the problem you needed to solve? Who was involved?</p>
                    <textarea 
                        id="context"
                        rows={5}
                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-300"
                        value={context}
                        onChange={e => setContext(e.target.value)}
                    />
                </div>
            );
        case 1:
            return (
                <div>
                    <label htmlFor="action" className="block text-sm font-medium text-slate-300">What specific action did you take?</label>
                    <p className="text-xs text-slate-500 mb-2">Describe what YOU did. Use strong action verbs. What were your responsibilities?</p>
                    <textarea 
                        id="action"
                        rows={5}
                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-300"
                        value={action}
                        onChange={e => setAction(e.target.value)}
                    />
                </div>
            );
        case 2:
            return (
                 <div>
                    <label htmlFor="result" className="block text-sm font-medium text-slate-300">What was the quantifiable result?</label>
                    <p className="text-xs text-slate-500 mb-2">What was the outcome? Use numbers, percentages, or dollar amounts whenever possible. How did it benefit the company?</p>
                    <textarea 
                        id="result"
                        rows={5}
                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-300"
                        value={result}
                        onChange={e => setResult(e.target.value)}
                    />
                </div>
            );
        case 3:
            return (
                 <div>
                    <label htmlFor="review" className="block text-sm font-medium text-slate-300">Review and Edit Your Story</label>
                    <p className="text-xs text-slate-500 mb-2">Here's your combined story. Make any final edits before saving.</p>
                    <textarea 
                        id="review"
                        rows={8}
                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-300"
                        value={combinedText}
                        onChange={e => setCombinedText(e.target.value)}
                    />
                </div>
            );
        default: return null;
    }
  };

  return (
    <div>
      {/* Stepper UI */}
      <div className="mb-6">
        <ol className="flex items-center w-full">
          {steps.map((step, index) => (
            <li key={step} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ''} ${index <= currentStep ? 'after:border-indigo-500' : 'after:border-slate-700'}`}>
              <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${index <= currentStep ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                <span className="text-white">{index + 1}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {renderStepContent()}

      <div className="mt-6 flex justify-between">
        <button
          onClick={goToPrev}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={goToNext}
          className="px-6 py-2 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {currentStep === steps.length - 1 ? 'Save Story' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default BrainstormWizard;