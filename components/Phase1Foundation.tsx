import React, { useState, useCallback, useEffect } from 'react';
import { extractTextFromFile } from '../../utils/fileParser';
import { UploadIcon } from '../icons/UploadIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';
import { CameraIcon } from '../icons/CameraIcon';
import { Phase, PhaseStatus } from '../../types';
import { LinkedInIcon } from '../icons/LinkedInIcon';
import { PhotoIcon } from '../icons/PhotoIcon';
import { JourneyIcon } from '../icons/JourneyIcon';
import { CVIcon } from '../icons/CVIcon';
import { ArchiveBoxIcon } from '../icons/ArchiveBoxIcon';
import { MegaphoneIcon } from '../icons/MegaphoneIcon';
import { GlobeIcon } from './icons/GlobeIcon';

interface Phase1FoundationProps {
  onComplete: (resumeText: string, jobDescriptionText: string) => void;
  advanceToPhase: (phaseId: string) => void;
  // New props for app selection
  onStartCatalyst: () => void;
  onGoToContinuousImprovement: () => void;
  onStartLinkedInOptimizer: () => void;
  onStartHeadshotGenerator: () => void;
  onStartLinkedInBannerGenerator: () => void;
  onStartProjectWizard: () => void;
  onStartAssetHub: () => void;
  onStartElevatorPitch: () => void;
  phases: Phase[];
}

const MajorAppCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  isRecommended?: boolean;
  tag?: string;
  tagColor?: string;
}> = ({ icon, title, description, onClick, isRecommended = false, tag, tagColor = 'bg-amber-600' }) => (
  <button 
    onClick={onClick}
    className={`p-8 bg-white rounded-xl border-2 border-neutral-200 hover:border-neutral-800 hover:bg-white transition-all text-left group flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 shadow-lg hover:shadow-xl`}
  >
    <div className={`p-4 rounded-lg bg-neutral-100 w-fit`}>
        {icon}
    </div>
    <div className="flex-1">
        <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-neutral-800 group-hover:text-neutral-900 transition-colors">{title}</h3>
            {isRecommended && <span className="text-xs font-semibold bg-neutral-800 text-white px-2 py-0.5 rounded-full">Recommended Start</span>}
            {tag && <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded-full ${tagColor}`}>{tag}</span>}
        </div>
        <p className="mt-2 text-neutral-600">{description}</p>
    </div>
  </button>
);


const MinorAppCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, title, description, onClick, disabled = false }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`p-6 bg-white rounded-xl border border-neutral-200 hover:border-neutral-800 hover:bg-white transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-neutral-200 shadow-lg hover:shadow-xl`}
  >
    <div className={`p-3 rounded-lg bg-neutral-100 w-fit mb-4`}>
        {icon}
    </div>
    <div>
        <h3 className="text-lg font-bold text-neutral-800 group-hover:text-neutral-900 transition-colors">{title}</h3>
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
    </div>
  </button>
);


const Phase1Foundation: React.FC<Phase1FoundationProps> = ({ 
  onComplete, 
  advanceToPhase,
  onStartCatalyst,
  onGoToContinuousImprovement,
  onStartLinkedInOptimizer,
  onStartHeadshotGenerator,
  onStartLinkedInBannerGenerator,
  onStartProjectWizard,
  onStartAssetHub,
  onStartElevatorPitch,
  phases,
}) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [jobDescriptionPasted, setJobDescriptionPasted] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState({ resume: '', jobDescription: '' });

  const activePhase = phases.find(p => p.status === PhaseStatus.Active);
  if (!activePhase) return null;
  
  const handleFileUpload = useCallback(async (
    setter: React.Dispatch<React.SetStateAction<string>>,
    fileKey: 'resume' | 'jobDescription',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(prev => ({ ...prev, [fileKey]: file.name }));
    try {
      const text = await extractTextFromFile(file);
      setter(text);
       if (fileKey === 'jobDescription') setJobDescriptionPasted(''); // Clear pasted text if a file is uploaded
    } catch (error: any) {
      alert(error.message || 'Error processing file.');
      setFileName(prev => ({ ...prev, [fileKey]: '' }));
      event.target.value = '';
    } finally {
      setIsProcessing(false);
    }
  }, []);
  
  const finishPhase = () => {
    onComplete(resumeText, jobDescriptionPasted || jobDescriptionText);
  };

  if (activePhase.id === 'welcome') {
    const ciPhase = phases.find(p => p.id === 'continuous_improvement');
    const isCIUnlocked = ciPhase?.status !== PhaseStatus.Locked;

    return (
       <div className="max-w-5xl mx-auto my-10 animate-fade-in-up" style={{ animationDelay: '2500ms', animationFillMode: 'backwards'}}>
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-neutral-800">The Career Catalyst Suite</h2>
                <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">Your all-in-one platform for professional development. Choose an application below to begin.</p>
            </div>
            <div className="space-y-6">
                <MajorAppCard 
                    icon={<JourneyIcon className="h-10 w-10 text-neutral-800" />}
                    title="Career Catalyst Journey"
                    description="The core experience. A guided, step-by-step process to build your foundational career assets from the ground up."
                    onClick={onStartCatalyst}
                    isRecommended={true}
                />
                 <MajorAppCard 
                    icon={<CVIcon className="h-10 w-10 text-neutral-800" />}
                    title="CV Project Wizard"
                    description="Fast-track your story discovery. Use our guided, low-typing wizard to unpack your projects and accomplishments."
                    onClick={onStartProjectWizard}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                     <MinorAppCard 
                        icon={<ArrowPathIcon className="h-8 w-8 text-neutral-800" />}
                        title="Continuous Improvement"
                        description="Tailor assets, practice for interviews, and keep your materials sharp."
                        onClick={onGoToContinuousImprovement}
                        disabled={!isCIUnlocked}
                    />
                     <MinorAppCard 
                        icon={<LinkedInIcon className="h-8 w-8 text-neutral-800" />}
                        title="LinkedIn Optimizer"
                        description="Generate compelling headlines, summaries, and more."
                        onClick={onStartLinkedInOptimizer}
                    />
                    <MinorAppCard 
                        icon={<MegaphoneIcon className="h-8 w-8 text-neutral-800" />}
                        title="Elevator Pitch"
                        description="Craft and practice your 10-second and 2-minute elevator pitches."
                        onClick={onStartElevatorPitch}
                    />
                     <MinorAppCard 
                        icon={<CameraIcon className="h-8 w-8 text-neutral-800" />}
                        title="AI Headshot Generator"
                        description="Create a professional headshot from an existing photo."
                        onClick={onStartHeadshotGenerator}
                    />
                </div>
                 <MajorAppCard 
                    icon={<ArchiveBoxIcon className="h-10 w-10 text-neutral-800" />}
                    title="Asset Hub"
                    description="View, manage, and download all your saved assets, including resumes, headshots, and LinkedIn content."
                    onClick={onStartAssetHub}
                />
                <MajorAppCard 
                    icon={<GlobeIcon className="h-10 w-10 text-neutral-800" />}
                    title="Personal Website Session"
                    description="Take your drafts and projects to the next level with a personal website session. 90 minutes with an expert for only $50. Email to inquire."
                    onClick={() => { window.location.href = "mailto:Darryl.Erby@gmail.com?subject=Personal Website Builder Session Inquiry"; }}
                    tag="$50 Session"
                />
            </div>
       </div>
    );
  }

  // Renders the file upload step
  return (
    <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-3xl mx-auto">
      <div className="p-6 sm:p-8 space-y-6">
        <div>
            <h3 className="text-xl font-bold text-neutral-800">Upload Your Documents</h3>
            <p className="mt-1 text-sm text-neutral-500">This is the foundation. Upload your resume to start, and add a job description for tailored results.</p>
        </div>

        {/* Resume Upload */}
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Your Resume (.pdf, .docx, .txt)</label>
            <label className={`flex justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-neutral-400 focus:outline-none ${resumeText ? 'border-green-500' : 'border-neutral-300'}`}>
                <span className="flex items-center space-x-2">
                  {resumeText ? <CheckIcon className="h-6 w-6 text-green-500" /> : <UploadIcon className="h-6 w-6 text-neutral-400" />}
                  <span className="font-medium text-neutral-500">
                    {isProcessing && fileName.resume ? 'Processing...' : (fileName.resume ? `Uploaded: ${fileName.resume}` : "Click to upload resume")}
                  </span>
                </span>
                <input type="file" name="resume_upload" className="hidden" accept=".pdf,.docx,.txt,.md" onChange={(e) => handleFileUpload(setResumeText, 'resume', e)} disabled={isProcessing} />
            </label>
        </div>
        
        {/* JD Upload */}
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Target Job Description (Optional)</label>
             <label className={`flex justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-neutral-400 focus:outline-none ${jobDescriptionText ? 'border-green-500' : 'border-neutral-300'}`}>
                <span className="flex items-center space-x-2">
                    {jobDescriptionText ? <CheckIcon className="h-6 w-6 text-green-500" /> : <UploadIcon className="h-6 w-6 text-neutral-400" />}
                    <span className="font-medium text-neutral-500">
                         {isProcessing && fileName.jobDescription ? 'Processing...' : (fileName.jobDescription ? `Uploaded: ${fileName.jobDescription}` : "Click to upload job description")}
                    </span>
                </span>
                <input type="file" name="jd_upload" className="hidden" accept=".pdf,.docx,.txt,.md" onChange={(e) => handleFileUpload(setJobDescriptionText, 'jobDescription', e)} disabled={isProcessing} />
            </label>
            <div className="mt-2 text-center text-sm text-neutral-500">or</div>
             <textarea 
                rows={6}
                value={jobDescriptionPasted}
                onChange={(e) => {
                    setJobDescriptionPasted(e.target.value);
                    if (e.target.value) {
                        setJobDescriptionText(''); // Clear file upload if pasting
                        setFileName(prev => ({ ...prev, jobDescription: ''}));
                    }
                }}
                placeholder="Paste the job description text here..."
                className="mt-2 w-full p-2 bg-white border-2 border-dashed rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-700 placeholder-neutral-400"
            ></textarea>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-200">
            <button 
                onClick={finishPhase} 
                disabled={!resumeText}
                className="px-8 py-2 font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed disabled:text-neutral-500"
            >
                Next
            </button>
        </div>
      </div>
    </div>
  );
};

export default Phase1Foundation;