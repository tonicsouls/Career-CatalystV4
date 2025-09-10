
import React, { useState } from 'react';
import { ProjectDetails, TimelineEvent } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { summarizeProjectDetails } from '../services/geminiService';
import { MoneySaveIcon } from './icons/MoneySaveIcon';
import { ProcessIcon } from './icons/ProcessIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { UserMinusIcon } from './icons/UserMinusIcon';
import { OrganizeIcon } from './icons/OrganizeIcon';
import { ValueIcon } from './icons/ValueIcon';
import { PlusIcon } from './icons/PlusIcon';

interface ProjectWizardProps {
  onComplete: (storyText: string, details: ProjectDetails) => void;
  timelineEvents: TimelineEvent[];
}

const initialDetails: ProjectDetails = {
  category: 'Operations',
  who: [],
  what: [],
  where: '',
  when: '',
  outcome: '',
};

const steps = ['Category', 'Basics', 'Value', 'Stakeholders', 'Impact', 'AI Review'];
const projectCategories = ['Operations', 'Sales', 'Finance', 'Engineering', 'Marketing', 'Product Management', 'Human Resources', 'Other'];

const valueOptions = [
    { text: 'Saved Money', icon: <MoneySaveIcon className="h-5 w-5" /> },
    { text: 'Created a Process', icon: <ProcessIcon className="h-5 w-5" /> },
    { text: 'Hired/Expanded Team', icon: <UserPlusIcon className="h-5 w-5" /> },
    { text: 'Downsized/Restructured Team', icon: <UserMinusIcon className="h-5 w-5" /> },
    { text: 'Organized Project/Team', icon: <OrganizeIcon className="h-5 w-5" /> },
    { text: 'Created Value', icon: <ValueIcon className="h-5 w-5" /> },
];

const stakeholderOptions = [ 'My Team', 'My Manager', 'Cross-functional Partners', 'Executive Leadership', 'External Vendors', 'Clients / Customers'];

const MultiSelectButton: React.FC<{
    text: string;
    icon?: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
}> = ({ text, icon, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 text-left w-full p-3 rounded-lg border-2 transition-colors ${isSelected ? 'bg-neutral-200/50 border-neutral-800 text-neutral-800' : 'bg-neutral-100 border-neutral-200 hover:border-neutral-400 text-neutral-700'}`}
    >
        {icon && <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">{icon}</div>}
        <span className="font-medium">{text}</span>
    </button>
);


const ProjectWizard: React.FC<ProjectWizardProps> = ({ onComplete, timelineEvents }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [details, setDetails] = useState<ProjectDetails>(initialDetails);
  const [otherWhat, setOtherWhat] = useState('');
  const [otherWho, setOtherWho] = useState('');

  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof Omit<ProjectDetails, 'who' | 'what'>, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };
  
  const handleMultiSelectChange = (field: 'what' | 'who', value: string) => {
    setDetails(prev => {
        const currentSelection = prev[field];
        if (currentSelection.includes(value)) {
            return { ...prev, [field]: currentSelection.filter(item => item !== value) };
        } else {
            return { ...prev, [field]: [...currentSelection, value] };
        }
    });
  };

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const finalDetails: ProjectDetails = {
        ...details,
        what: [...details.what, ...(otherWhat ? [otherWhat] : [])],
        who: [...details.who, ...(otherWho ? [otherWho] : [])],
      };
      const summary = await summarizeProjectDetails(finalDetails);
      setGeneratedSummary(summary);
      goToNext();
    } catch (e: any) {
      setError(e.message || "Failed to generate summary.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = () => {
    const finalDetails: ProjectDetails = {
        ...details,
        what: [...details.what, ...(otherWhat ? [otherWhat] : [])],
        who: [...details.who, ...(otherWho ? [otherWho] : [])],
      };
    onComplete(generatedSummary, finalDetails);
  };

  const goToNext = () => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
  const goToPrev = () => setCurrentStep(prev => Math.max(0, prev - 1));

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Category
        return (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-1">What kind of project was it?</h3>
            <p className="text-sm text-neutral-500 mb-4">Select the primary domain this project falls under.</p>
            <select
              id="category"
              className="w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"
              value={details.category}
              onChange={e => handleInputChange('category', e.target.value)}
            >
              {projectCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        );
      case 1: // Basics
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-neutral-800">Let's get the basics down.</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="where" className="block text-sm font-medium text-neutral-700">Where did this happen?</label>
                    <input list="companies" type="text" id="where" value={details.where} onChange={e => handleInputChange('where', e.target.value)} className="w-full mt-1 p-2 bg-neutral-100 border border-neutral-300 rounded-md" placeholder="e.g., At TechCorp Inc." />
                    <datalist id="companies">
                        {timelineEvents.map(event => event.title.includes('Manager') || event.title.includes('Lead') ? <option key={event.id} value={event.title.split('|')[1]?.trim() || event.title} /> : null)}
                    </datalist>
                </div>
                 <div>
                    <label htmlFor="when" className="block text-sm font-medium text-neutral-700">When did this happen?</label>
                    <input type="text" id="when" value={details.when} onChange={e => handleInputChange('when', e.target.value)} className="w-full mt-1 p-2 bg-neutral-100 border border-neutral-300 rounded-md" placeholder="e.g., Q3 2023" />
                </div>
            </div>
          </div>
        );
    case 2: // Value
        return (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-1">What value did you attempt to create?</h3>
            <p className="text-sm text-neutral-500 mb-4">Select all that apply. This helps the AI understand your primary actions.</p>
            <div className="space-y-3">
                {valueOptions.map(opt => <MultiSelectButton key={opt.text} {...opt} isSelected={details.what.includes(opt.text)} onClick={() => handleMultiSelectChange('what', opt.text)} />)}
                 <div className="relative">
                     <MultiSelectButton text="Something Else..." icon={<PlusIcon className="h-5 w-5"/>} isSelected={details.what.includes('Other')} onClick={() => handleMultiSelectChange('what', 'Other')} />
                     {details.what.includes('Other') && (
                        <input type="text" value={otherWhat} onChange={e => setOtherWhat(e.target.value)} placeholder="Please specify"
                               className="mt-2 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"/>
                     )}
                 </div>
            </div>
          </div>
        );
    case 3: // Stakeholders
        return (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-1">Who was involved?</h3>
            <p className="text-sm text-neutral-500 mb-4">Select the key stakeholders you worked with.</p>
            <div className="space-y-3">
                {stakeholderOptions.map(text => <MultiSelectButton key={text} text={text} isSelected={details.who.includes(text)} onClick={() => handleMultiSelectChange('who', text)} />)}
                <div className="relative">
                     <MultiSelectButton text="Someone Else..." icon={<PlusIcon className="h-5 w-5"/>} isSelected={details.who.includes('Other')} onClick={() => handleMultiSelectChange('who', 'Other')} />
                     {details.who.includes('Other') && (
                        <input type="text" value={otherWho} onChange={e => setOtherWho(e.target.value)} placeholder="Please specify"
                               className="mt-2 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"/>
                     )}
                 </div>
            </div>
          </div>
        );
      case 4: // Impact / Outcome
        return (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-1">What was the final outcome or result?</h3>
            <p className="text-sm text-neutral-500 mb-4">Focus on quantifiable results. Did you save money, improve efficiency, increase sales, boost velocity, ensure compliance?</p>
            <textarea
              id="outcome"
              rows={5}
              className="w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"
              value={details.outcome}
              onChange={e => handleInputChange('outcome', e.target.value)}
              placeholder="e.g., Reduced operational costs by 15% ($250k annually) by automating the reporting process."
            />
          </div>
        );
      case 5: // AI Review
        return (
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-1">Review & Refine Your AI-Generated Story</h3>
            <p className="text-sm text-neutral-500 mb-4">The AI has summarized your inputs into a professional story. Make any final edits below.</p>
            <textarea
              id="review"
              rows={8}
              className="w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md focus:ring-1 focus:ring-amber-500"
              value={generatedSummary}
              onChange={e => setGeneratedSummary(e.target.value)}
            />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div>
        <div className='mb-4 text-center'>
            <p className='text-neutral-600'>This wizard helps you structure your accomplishments using the STAR method (Situation, Task, Action, Result) with simple, guided steps. The AI will then turn your inputs into a powerful resume bullet point.</p>
        </div>
      {/* Stepper UI */}
      <div className="mb-6">
        <ol className="flex items-center w-full">
          {steps.map((step, index) => (
            <li key={step} className={`flex w-full items-center ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ''} ${index < currentStep ? 'after:border-amber-500' : 'after:border-neutral-200'}`}>
              <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 transition-colors ${index <= currentStep ? 'bg-amber-500' : 'bg-neutral-200'}`}>
                {index === steps.length -1 ? <SparklesIcon className="w-6 h-6 text-white" /> : <span className={`font-bold ${index <= currentStep ? 'text-white' : 'text-neutral-500'}`}>{index + 1}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>
      
      <div className="min-h-[320px] flex flex-col justify-center">
        {renderStepContent()}
      </div>

      {error && <p className="mt-4 text-sm text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      
      <div className="mt-6 flex justify-between">
        <button onClick={goToPrev} disabled={currentStep === 0} className="px-4 py-2 text-sm font-medium rounded-md text-neutral-700 bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50">
          Back
        </button>
        {currentStep < 4 && <button onClick={goToNext} className="px-6 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">Next</button>}
        {currentStep === 4 && <button onClick={handleGenerateSummary} disabled={isLoading} className="px-6 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate with AI'}</button>}
        {currentStep === 5 && <button onClick={handleSaveProject} className="px-6 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">Save Project</button>}
      </div>
    </div>
  );
};

export default ProjectWizard;
