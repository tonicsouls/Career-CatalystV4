

import React, { useState, useCallback, useEffect } from 'react';
import { extractTextFromFile } from '../../utils/fileParser';
import { analyzeDocuments, extractJobTitleFromJD } from '../../services/geminiService';
import { InitialAnalysisResult, JobPreset } from '../../types';
import { UploadIcon } from '../icons/UploadIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { XMarkIcon } from '../icons/XMarkIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { InformationCircleIcon } from '../icons/InformationCircleIcon';
import { CameraIcon } from '../icons/CameraIcon';
import Modal from '../Modal';
import { RocketLaunchIcon } from '../icons/RocketLaunchIcon';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';


interface Phase1FoundationProps {
  onComplete: (analysisResult: InitialAnalysisResult, jobDescriptionText: string, presetName: string, destination: 'journey' | 'dashboard') => void;
  initialAnalysis: InitialAnalysisResult | null;
  activePreset: JobPreset | null;
}

type UploadedResume = { name: string; text: string };

const FileChip: React.FC<{ name: string; onRemove: () => void }> = ({ name, onRemove }) => (
  <div className="bg-neutral-100 text-neutral-700 text-sm font-medium pl-3 pr-2 py-1.5 rounded-full flex items-center space-x-2 animate-fade-in-up">
    <DocumentTextIcon className="h-4 w-4 text-neutral-500 flex-shrink-0" />
    <span className="truncate flex-1" title={name}>{name}</span>
    <button onClick={onRemove} className="p-0.5 rounded-full hover:bg-neutral-300 flex-shrink-0">
      <XMarkIcon className="h-3.5 w-3.5" />
    </button>
  </div>
);

const Phase1Foundation: React.FC<Phase1FoundationProps> = ({ onComplete, activePreset, initialAnalysis }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumes, setResumes] = useState<UploadedResume[]>([]);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [jobDescriptionPasted, setJobDescriptionPasted] = useState('');
  const [analysisResult, setAnalysisResult] = useState<InitialAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [analysisWarning, setAnalysisWarning] = useState<string | null>(null);


  const startAnalysis = async () => {
      if (resumes.length === 0) {
          setError("Please upload at least one resume to proceed.");
          return;
      }
      setCurrentStep(3); // Analyzing step
      setError(null);
      setAnalysisWarning(null);
      try {
          const resumeContents = resumes.map(r => r.text);
          const jd = jobDescriptionPasted || jobDescriptionText;
          const result = await analyzeDocuments(resumeContents, jd);
          setAnalysisResult(result);
          
          if (jd) {
              const { jobTitle, warning } = await extractJobTitleFromJD(jd);
              setPresetName(jobTitle || 'New Application');
              if (warning) {
                setAnalysisWarning(warning);
              }
          } else {
              setPresetName(`General Analysis - ${new Date().toLocaleDateString()}`);
          }

          setCurrentStep(4); // Results step
      } catch (err: any) {
          setError(err.message || 'Failed to analyze documents.');
          setCurrentStep(2); // Go back to JD step on error
      }
  };

  const finishPhase = (destination: 'journey' | 'dashboard') => {
    if (analysisResult && presetName.trim()) {
      onComplete(analysisResult, jobDescriptionPasted || jobDescriptionText, presetName, destination);
    } else {
        setError("Preset name cannot be empty.");
    }
  };
  
  const handleNext = () => setCurrentStep(s => s + 1);
  const handleBack = () => setCurrentStep(s => s - 1);

  const renderCurrentStep = () => {
      switch(currentStep) {
          case 0: return <IntroStep onNext={handleNext} activePreset={activePreset} />;
          case 1: return <ResumeStep onNext={handleNext} onBack={handleBack} resumes={resumes} setResumes={setResumes} setError={setError} />;
          case 2: return <JobDescriptionStep onNext={startAnalysis} onBack={handleBack} jobDescriptionPasted={jobDescriptionPasted} setJobDescriptionPasted={setJobDescriptionPasted} setJobDescriptionText={setJobDescriptionText} activePreset={activePreset} />;
          case 3: return <AnalyzingStep />;
          case 4: return <ResultsStep analysisResult={analysisResult} onSave={() => setIsSaveModalOpen(true)} />;
          default: return null;
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow-xl border border-neutral-200 p-6">
            <div key={currentStep} className="animate-fade-in-up">
                 {renderCurrentStep()}
            </div>
            {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
        </div>
         <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title="Save Your Session">
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                    <ArchiveBoxIcon className="h-8 w-8 text-amber-600" />
                    <div>
                        <h3 className="text-xl font-bold text-neutral-800">Congratulations!</h3>
                        <p className="text-neutral-600">Your analysis is complete. Save this session as a Job Preset to access it later.</p>
                    </div>
                </div>
                {analysisWarning && (
                    <div className="mb-4 p-3 bg-amber-100 text-amber-800 rounded-md text-sm animate-fade-in">
                        <strong>Note:</strong> {analysisWarning}
                    </div>
                )}
                <div>
                     <label htmlFor="presetName" className="block text-sm font-medium text-neutral-700">Preset Name</label>
                     <input 
                        type="text" 
                        id="presetName" 
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md focus:ring-1 focus:ring-amber-500"
                     />
                </div>
                 {error && <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md text-xs">{error}</div>}
                <p className="mt-6 text-neutral-600 font-semibold text-center">What would you like to do next?</p>
                <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={() => finishPhase('dashboard')} className="w-full sm:w-auto px-6 py-2.5 font-medium rounded-md text-neutral-700 bg-neutral-200 hover:bg-neutral-300">
                        Go to Dashboard
                    </button>
                    <button onClick={() => finishPhase('journey')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 font-semibold rounded-md text-white bg-neutral-800 hover:bg-neutral-700">
                        <RocketLaunchIcon className="h-5 w-5" />
                        Start Guided Journey
                    </button>
                </div>
            </div>
        </Modal>
    </div>
  );
};

// Step Components
const IntroStep: React.FC<{onNext: () => void, activePreset: JobPreset | null}> = ({ onNext, activePreset }) => (
    <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-neutral-800">
             {activePreset ? `Working on: ${activePreset.name}` : 'Welcome to the Quick Start'}
        </h2>
        <p className="mt-2 text-neutral-600 max-w-lg mx-auto">
            {activePreset 
                ? `You've loaded an existing application preset. This wizard will guide you through providing a new resume to analyze for this role.`
                : `This 2-minute guided process will analyze your resume and an optional job description to populate your entire Career Catalyst suite with personalized AI insights.`}
        </p>
        <button onClick={onNext} className="mt-8 px-8 py-3 font-semibold rounded-md text-white bg-neutral-800 hover:bg-neutral-700">Get Started</button>
    </div>
);

const ResumeStep: React.FC<{
    onNext: () => void;
    onBack: () => void;
    resumes: UploadedResume[];
    setResumes: React.Dispatch<React.SetStateAction<UploadedResume[]>>;
    setError: (err: string | null) => void;
}> = ({ onNext, onBack, resumes, setResumes, setError }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleResumeUpload = useCallback(async (files: FileList | null) => {
        if (!files) return;
        if (resumes.length + files.length > 3) {
          setError('You can upload a maximum of 3 resumes.');
          return;
        }
        setIsProcessing(true);
        setError(null);
        try {
            const newResumes: UploadedResume[] = [];
            for (const file of Array.from(files)) {
                const text = await extractTextFromFile(file);
                newResumes.push({ name: file.name, text });
            }
            setResumes(prev => [...prev, ...newResumes]);
        } catch (err: any) {
            setError(err.message || 'Error processing a file.');
        } finally {
            setIsProcessing(false);
        }
    }, [resumes, setResumes, setError]);
  
    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleResumeUpload(e.dataTransfer.files);
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleResumeUpload(e.target.files); e.target.value = '';
    };
    const handleRemoveResume = (index: number) => {
        setResumes(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold text-neutral-800 text-center">Step 1: Upload Your Resume(s)</h2>
            <p className="text-sm text-neutral-500 text-center mb-6">You can upload up to 3 versions (.pdf, .docx, .txt).</p>
            <label onDragEnter={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full min-h-48 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-neutral-400 focus:outline-none ${isDragging ? 'border-amber-500' : 'border-neutral-300'}`}>
                <UploadIcon className="h-8 w-8 text-neutral-400" />
                <span className="font-medium text-sm text-center text-neutral-600 mt-2">{isProcessing ? 'Processing...' : 'Drag & drop files or click to browse'}</span>
                <input type="file" className="hidden" multiple accept=".pdf,.docx,.txt,.md" onChange={handleFileChange} disabled={isProcessing || resumes.length >= 3} />
            </label>
            {resumes.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{resumes.map((resume, index) => <FileChip key={index} name={resume.name} onRemove={() => handleRemoveResume(index)} />)}</div>}
            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="px-6 py-2 font-medium rounded-md text-neutral-700 bg-neutral-200 hover:bg-neutral-300">Back</button>
                <button onClick={onNext} disabled={resumes.length === 0} className="px-8 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed">Next</button>
            </div>
        </div>
    );
};

const JobDescriptionStep: React.FC<{
    onNext: () => void; onBack: () => void;
    jobDescriptionPasted: string; setJobDescriptionPasted: (val: string) => void; setJobDescriptionText: (val: string) => void;
    activePreset: JobPreset | null;
}> = ({ onNext, onBack, jobDescriptionPasted, setJobDescriptionPasted, setJobDescriptionText, activePreset }) => {
    useEffect(() => {
        if (activePreset && !jobDescriptionPasted) {
            setJobDescriptionPasted(activePreset.jobDescription);
            setJobDescriptionText(activePreset.jobDescription);
        }
    }, [activePreset, jobDescriptionPasted, setJobDescriptionPasted, setJobDescriptionText]);

     const handleJdUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; if (!file) return;
        try {
            const text = await extractTextFromFile(file);
            setJobDescriptionText(text); setJobDescriptionPasted('');
        } catch (err: any) { alert(err.message || 'Error processing file.'); } finally { event.target.value = ''; }
    }, [setJobDescriptionText, setJobDescriptionPasted]);
    return (
        <div className="p-4">
             <h2 className="text-xl font-bold text-neutral-800 text-center">Step 2: Add a Job Description (Recommended)</h2>
             <p className="text-sm text-neutral-500 text-center mb-6">Adding a JD provides tailored analysis and unlocks more powerful AI features.</p>
             <textarea rows={8} value={jobDescriptionPasted}
                onChange={(e) => { setJobDescriptionPasted(e.target.value); if (e.target.value) { setJobDescriptionText(''); }}}
                placeholder="Paste job description here..."
                className="w-full p-2 bg-white border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-700 placeholder-neutral-400"
            ></textarea>
            <div className="text-center text-sm text-neutral-500 my-2">or</div>
            <label className={`flex justify-center items-center w-full h-16 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-neutral-400 focus:outline-none border-neutral-300`}>
                <span className="flex items-center space-x-2"><UploadIcon className="h-6 w-6 text-neutral-400" /><span className="font-medium text-neutral-600 text-sm">Upload a file</span></span>
                <input type="file" className="hidden" accept=".pdf,.docx,.txt,.md" onChange={handleJdUpload} />
            </label>
             <div className="flex justify-between mt-8">
                <button onClick={onBack} className="px-6 py-2 font-medium rounded-md text-neutral-700 bg-neutral-200 hover:bg-neutral-300">Back</button>
                <button onClick={onNext} className="px-8 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">Analyze</button>
            </div>
        </div>
    );
};

const AnalyzingStep: React.FC = () => (
     <div className="p-8 min-h-[400px] flex flex-col justify-center items-center">
        <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-neutral-800 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <h2 className="text-xl font-bold text-neutral-800 mt-4">The AI is cooking up your analysis...</h2>
            <p className="mt-2 text-neutral-600">This should only take a moment.</p>
        </div>
        <div className="mt-10 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-4">
            <CameraIcon className="h-8 w-8 text-amber-600 flex-shrink-0" />
            <div>
                <h3 className="font-semibold text-amber-800">While you wait...</h3>
                <p className="text-sm text-amber-700">Find a photo you'd like to improve. After this, you can use the AI Headshot Generator from the dashboard!</p>
            </div>
        </div>
    </div>
);

const ResultsStep: React.FC<{
    analysisResult: InitialAnalysisResult | null;
    onSave: () => void;
}> = ({ analysisResult, onSave }) => {
    if (!analysisResult) return <div className="p-8 text-center">No analysis data to display. Please try again.</div>;
    return (
        <div className="p-4">
             <h2 className="text-xl font-bold text-neutral-800 text-center">Analysis Complete!</h2>
             <p className="text-sm text-neutral-500 text-center mb-6">Here's a snapshot of what the AI found. All of this data has now populated your app.</p>
            <div className="space-y-6">
                 {analysisResult.matchAnalysis && (
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
                         <h4 className="font-semibold text-neutral-700 flex items-center"><InformationCircleIcon className="h-5 w-5 mr-2 text-neutral-500"/>Job Description Match</h4>
                         <p className="text-sm text-neutral-600 italic">{analysisResult.matchAnalysis.matchSummary}</p>
                        <div>
                            <h5 className="text-sm font-semibold text-green-700 mb-2">Matching Keywords</h5>
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.matchAnalysis.matchingKeywords.map(kw => <span key={kw} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center"><CheckIcon className="h-3 w-3 mr-1"/>{kw}</span>)}
                            </div>
                        </div>
                        <div>
                            <h5 className="text-sm font-semibold text-amber-700 mb-2">Potential Gaps (Keywords Missing from Resume)</h5>
                            <div className="flex flex-wrap gap-2">
                                 {analysisResult.matchAnalysis.missingKeywords.map(kw => <span key={kw} className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center"><XMarkIcon className="h-3 w-3 mr-1"/>{kw}</span>)}
                            </div>
                        </div>
                    </div>
                )}
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    <h4 className="font-semibold text-neutral-700 flex items-center"><UserCircleIcon className="h-5 w-5 mr-2 text-neutral-500"/>Profile Snapshot</h4>
                    <p className="mt-2 text-sm text-neutral-600">{analysisResult.summary}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-neutral-700 mb-2">Key Skills Identified</h4>
                    <div className="flex flex-wrap gap-2">
                        {analysisResult.keySkills.map(skill => <span key={skill} className="bg-neutral-200 text-neutral-800 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>)}
                    </div>
                </div>
            </div>
             <div className="flex justify-end mt-8">
                <button onClick={onSave} className="px-8 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700">Finish & Save Session</button>
            </div>
        </div>
    );
};

export default Phase1Foundation;