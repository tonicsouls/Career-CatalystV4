
import React, { useState, useCallback } from 'react';
import { extractTextFromFile } from '../../utils/fileParser';
import { UploadIcon } from '../icons/UploadIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface Phase1FoundationProps {
  onComplete: (resumeTexts: string[], jobDescriptionText: string) => void;
}

const Phase1Foundation: React.FC<Phase1FoundationProps> = ({ onComplete }) => {
  const [resumeTexts, setResumeTexts] = useState<string[]>(['', '', '']);
  const [fileNames, setFileNames] = useState<string[]>(['', '', '']);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [jobDescriptionFileName, setJobDescriptionFileName] = useState('');
  const [jobDescriptionPasted, setJobDescriptionPasted] = useState('');
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const handleResumeUpload = useCallback(async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(index);
    try {
      const text = await extractTextFromFile(file);
      setResumeTexts(prev => {
        const newTexts = [...prev];
        newTexts[index] = text;
        return newTexts;
      });
      setFileNames(prev => {
        const newNames = [...prev];
        newNames[index] = file.name;
        return newNames;
      });
    } catch (error: any) {
      alert(error.message || 'Error processing file.');
    } finally {
      setIsProcessing(null);
      event.target.value = ''; // Allow re-upload
    }
  }, []);
  
  const handleJdUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsProcessing(99); // Use a unique index for JD processing
      try {
        const text = await extractTextFromFile(file);
        setJobDescriptionText(text);
        setJobDescriptionFileName(file.name);
        setJobDescriptionPasted('');
      } catch (error: any) {
        alert(error.message || 'Error processing file.');
      } finally {
        setIsProcessing(null);
        event.target.value = '';
      }
  }, []);

  const handleRemoveResume = (index: number) => {
    setResumeTexts(prev => {
        const newTexts = [...prev];
        newTexts[index] = '';
        return newTexts;
      });
      setFileNames(prev => {
        const newNames = [...prev];
        newNames[index] = '';
        return newNames;
      });
  };

  const finishPhase = () => {
    const validResumes = resumeTexts.filter(text => text.trim() !== '');
    onComplete(validResumes, jobDescriptionPasted || jobDescriptionText);
  };
  
  const hasAtLeastOneResume = resumeTexts.some(text => text.trim() !== '');

  return (
    <div className="bg-white rounded-xl shadow-xl border border-neutral-200 max-w-3xl mx-auto">
      <div className="p-6 sm:p-8 space-y-6">
        <div>
            <h3 className="text-xl font-bold text-neutral-800">Upload Your Documents</h3>
            <p className="mt-1 text-sm text-neutral-500">This is the foundation. Upload up to 3 resumes to start, and add a job description for tailored results.</p>
        </div>

        {/* Resume Uploads */}
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Your Resumes (.pdf, .docx, .txt)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[0, 1, 2].map(index => (
                    <div key={index}>
                        {resumeTexts[index] ? (
                             <div className="flex flex-col items-center justify-center w-full h-24 px-2 transition bg-white border-2 border-green-500 rounded-md">
                                <CheckIcon className="h-6 w-6 text-green-500" />
                                <p className="text-xs text-center text-neutral-600 mt-2 truncate w-full" title={fileNames[index]}>{fileNames[index]}</p>
                                <button onClick={() => handleRemoveResume(index)} className="text-xs text-red-500 hover:underline">Remove</button>
                             </div>
                        ) : (
                             <label className={`flex flex-col items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-neutral-400 focus:outline-none border-neutral-300`}>
                                <UploadIcon className="h-6 w-6 text-neutral-400" />
                                <span className="font-medium text-xs text-neutral-500 mt-1">
                                    {isProcessing === index ? 'Processing...' : `Resume ${index + 1}`}
                                </span>
                                <input type="file" name={`resume_upload_${index}`} className="hidden" accept=".pdf,.docx,.txt,.md" onChange={(e) => handleResumeUpload(index, e)} disabled={isProcessing !== null} />
                            </label>
                        )}
                    </div>
                ))}
            </div>
        </div>
        
        {/* JD Upload */}
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Target Job Description (Optional)</label>
             <label className={`flex justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-neutral-400 focus:outline-none ${jobDescriptionText || jobDescriptionPasted ? 'border-green-500' : 'border-neutral-300'}`}>
                <span className="flex items-center space-x-2">
                    {jobDescriptionText || jobDescriptionPasted ? <CheckIcon className="h-6 w-6 text-green-500" /> : <UploadIcon className="h-6 w-6 text-neutral-400" />}
                    <span className="font-medium text-neutral-500">
                         {isProcessing === 99 ? 'Processing...' : (jobDescriptionFileName ? `Uploaded: ${jobDescriptionFileName}` : "Click to upload or paste below")}
                    </span>
                </span>
                <input type="file" name="jd_upload" className="hidden" accept=".pdf,.docx,.txt,.md" onChange={handleJdUpload} disabled={isProcessing !== null} />
            </label>
            <div className="mt-2 text-center text-sm text-neutral-500">or</div>
             <textarea 
                rows={6}
                value={jobDescriptionPasted}
                onChange={(e) => {
                    setJobDescriptionPasted(e.target.value);
                    if (e.target.value) {
                        setJobDescriptionText('');
                        setJobDescriptionFileName('');
                    }
                }}
                placeholder="Paste the job description text here..."
                className="mt-2 w-full p-2 bg-white border-2 border-dashed rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-700 placeholder-neutral-400"
            ></textarea>
        </div>

        <div className="flex justify-end pt-4 border-t border-neutral-200">
            <button 
                onClick={finishPhase} 
                disabled={!hasAtLeastOneResume}
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
