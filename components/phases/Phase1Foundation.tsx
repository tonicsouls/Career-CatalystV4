

import React, { useState, useCallback, useEffect } from 'react';
import { extractTextFromFile } from '../../utils/fileParser';
import { analyzeDocuments } from '../../services/geminiService';
import { InitialAnalysisResult } from '../../types';
import { UploadIcon } from '../icons/UploadIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { XMarkIcon } from '../icons/XMarkIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { InformationCircleIcon } from '../icons/InformationCircleIcon';

interface Phase1FoundationProps {
  onComplete: (analysisResult: InitialAnalysisResult, jobDescriptionText: string) => void;
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

const Phase1Foundation: React.FC<Phase1FoundationProps> = ({ onComplete }) => {
  const [resumes, setResumes] = useState<UploadedResume[]>([]);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [jobDescriptionFileName, setJobDescriptionFileName] = useState('');
  const [jobDescriptionPasted, setJobDescriptionPasted] = useState('');
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<InitialAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const hasDocuments = resumes.length > 0;
    const jdContent = jobDescriptionPasted || jobDescriptionText;

    if (hasDocuments) {
        const performAnalysis = async () => {
            setIsAnalyzing(true);
            setAnalysisError(null);
            try {
                const resumeContents = resumes.map(r => r.text);
                const result = await analyzeDocuments(resumeContents, jdContent);
                setAnalysisResult(result);
            } catch (err: any) {
                setAnalysisError(err.message || 'Failed to analyze documents.');
            } finally {
                setIsAnalyzing(false);
            }
        };
        // Debounce analysis
        const handler = setTimeout(() => {
            performAnalysis();
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    } else {
        setAnalysisResult(null); // Clear analysis if all resumes are removed
    }
  }, [resumes, jobDescriptionText, jobDescriptionPasted]);


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
  }, [resumes]);
  
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleResumeUpload(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleResumeUpload(e.target.files);
    e.target.value = '';
  };

  const handleJdUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setIsProcessing(true);
      setError(null);
      try {
        const text = await extractTextFromFile(file);
        setJobDescriptionText(text);
        setJobDescriptionFileName(file.name);
        setJobDescriptionPasted('');
      } catch (err: any) {
        setError(err.message || 'Error processing file.');
      } finally {
        setIsProcessing(false);
        event.target.value = '';
      }
  }, []);

  const handleRemoveResume = (index: number) => {
    setResumes(prev => prev.filter((_, i) => i !== index));
  };

  const finishPhase = () => {
    if (analysisResult) {
      onComplete(analysisResult, jobDescriptionPasted || jobDescriptionText);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow-xl border border-neutral-200 p-6 flex items-center space-x-6">
            <DocumentTextIcon className="h-16 w-16 text-neutral-800 flex-shrink-0 hidden sm:block" />
            <div>
                <h2 className="text-2xl font-bold text-neutral-800">Phase 1: Upload & Analyze</h2>
                <p className="mt-2 text-neutral-600">
                    This is the foundation. Upload up to 3 resumes to start, and add a job description for tailored, AI-powered results and analysis.
                </p>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-neutral-200">
            <div className="p-6 sm:p-8 space-y-8">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Resume Uploads */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-neutral-700">Your Resumes (.pdf, .docx, .txt)</label>
                        <label 
                            onDragEnter={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)} 
                            onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
                            className={`flex flex-col items-center justify-center w-full min-h-48 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-neutral-400 focus:outline-none ${isDragging ? 'border-amber-500' : 'border-neutral-300'}`}
                        >
                            <UploadIcon className="h-8 w-8 text-neutral-400" />
                            <span className="font-medium text-sm text-center text-neutral-600 mt-2">{isProcessing ? 'Processing...' : 'Drag & drop files or click to browse'}</span>
                            <span className="text-xs text-neutral-400 mt-1">Up to 3 files</span>
                            <input type="file" className="hidden" multiple accept=".pdf,.docx,.txt,.md" onChange={handleFileChange} disabled={isProcessing || resumes.length >= 3} />
                        </label>
                        {resumes.length > 0 && <div className="flex flex-wrap gap-2">{resumes.map((resume, index) => <FileChip key={index} name={resume.name} onRemove={() => handleRemoveResume(index)} />)}</div>}
                    </div>
                    
                    {/* JD Upload */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-neutral-700">Target Job Description (Optional)</label>
                        <label className={`flex justify-center items-center w-full h-16 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-neutral-400 focus:outline-none ${jobDescriptionFileName ? 'border-green-500' : 'border-neutral-300'}`}>
                            <span className="flex items-center space-x-2"><UploadIcon className="h-6 w-6 text-neutral-400" /><span className="font-medium text-neutral-600 text-sm">{jobDescriptionFileName ? `Uploaded: ${jobDescriptionFileName}` : "Upload a file"}</span></span>
                            <input type="file" className="hidden" accept=".pdf,.docx,.txt,.md" onChange={handleJdUpload} disabled={isProcessing} />
                        </label>
                        <div className="text-center text-sm text-neutral-500">or</div>
                        <textarea rows={4} value={jobDescriptionPasted}
                            onChange={(e) => { setJobDescriptionPasted(e.target.value); if (e.target.value) { setJobDescriptionText(''); setJobDescriptionFileName(''); }}}
                            placeholder="Paste job description here for tailored results..."
                            className="w-full p-2 bg-white border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-700 placeholder-neutral-400"
                        ></textarea>
                    </div>
                </div>
            </div>
            {(isAnalyzing || analysisResult) && (
                <div className="p-6 sm:p-8 border-t border-neutral-200">
                    <h3 className="text-lg font-bold text-neutral-800 flex items-center mb-4"><SparklesIcon className="h-5 w-5 mr-2 text-amber-500" /> AI Analysis</h3>
                    {isAnalyzing && (
                        <div className="flex items-center justify-center p-8 space-x-2 text-neutral-500">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>Analyzing documents...</span>
                        </div>
                    )}
                    {analysisError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{analysisError}</div>}
                    {analysisResult && !isAnalyzing && (
                        <div className="space-y-6 animate-fade-in-up">
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
                        </div>
                    )}
                </div>
            )}
             <div className="flex justify-end p-6 border-t border-neutral-200 bg-neutral-50/50 rounded-b-xl">
                <button 
                    onClick={finishPhase} 
                    disabled={!analysisResult}
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
