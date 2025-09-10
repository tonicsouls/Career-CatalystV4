
import React from 'react';
import { RocketLaunchIcon } from './icons/RocketLaunchIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface JourneyCompleteScreenProps {
  onContinue: () => void;
}

const JourneyCompleteScreen: React.FC<JourneyCompleteScreenProps> = ({ onContinue }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-neutral-200 max-w-4xl mx-auto p-8 sm:p-12">
      <style>{`
        @keyframes subtle-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        .float-animation {
            animation: subtle-float 4s ease-in-out infinite;
        }
      `}</style>
      <div className="text-center">
        <div className="inline-block p-4 bg-neutral-800 rounded-full float-animation">
            <RocketLaunchIcon className="h-16 w-16 text-white" />
        </div>
        <h2 className="mt-6 text-3xl sm:text-4xl font-bold text-neutral-800">Congratulations!</h2>
        <p className="mt-4 text-lg text-neutral-600">
          You've successfully completed the core Career Catalyst Journey. You've built a powerful foundation of career assets that will serve you well.
        </p>
      </div>

      <div className="mt-8 text-left bg-neutral-50 p-6 rounded-lg border border-neutral-200 space-y-4">
        <h3 className="text-xl font-semibold text-neutral-800 flex items-center">
             <SparklesIcon className="h-5 w-5 mr-3 text-amber-500" />
            What's Next? Welcome to Continuous Improvement.
        </h3>
        <p className="text-neutral-600">
          Your career doesn't stand still, and neither should your materials. The journey of professional development is ongoing. You've now unlocked the **Continuous Improvement Hub**, where you can:
        </p>
        <ul className="list-disc list-inside text-neutral-700 space-y-2 pl-2">
            <li>**Tailor your new resume** and cover letter for any specific job application in seconds.</li>
            <li>**Practice for interviews** with AI-generated questions based on your resume and the job description.</li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <button
            onClick={onContinue}
            className="w-full sm:w-auto flex items-center justify-center mx-auto px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-neutral-800 hover:bg-neutral-700"
        >
            Enter the Improvement Hub
        </button>
      </div>
    </div>
  );
};

export default JourneyCompleteScreen;
