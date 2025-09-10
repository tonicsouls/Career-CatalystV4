
import React, { useState, useEffect, useRef } from 'react';
import { BrainDumpModule, GeneratedResumeData, SavedResumeVersion, InterviewFeedback } from '../../types';
import { SparklesIcon } from '../icons/SparklesIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { tailorResumeFromVersion, generateCoverLetter, generateInterviewQuestions, analyzeInterviewAnswer } from '../../services/geminiService';
import CvViewer from '../CvViewer';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { SpeakerWaveIcon } from '../icons/SpeakerWaveIcon';
import { TailorAssetsIllustration } from '../illustrations/TailorAssetsIllustration';
import JourneyCompleteScreen from '../JourneyCompleteScreen';
import { FileDownloadIcon } from '../icons/FileDownloadIcon';
import { CopyIcon } from '../icons/CopyIcon';

declare const jspdf: any;
declare const html2canvas: any;

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
type ViewState = 'dashboard' | 'tailor' | 'interview_prep_setup' | 'interview_prep_session';

const Phase6ContinuousImprovement: React.FC<any> = (props) => {
    const [view, setView] = useState<ViewState>('dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedVersionId, setSelectedVersionId] = useState<string>(props.savedResumeVersions.length > 0 ? props.savedResumeVersions[0].id : '');
    const [newJd, setNewJd] = useState('');
    const [userNotes, setUserNotes] = useState('');
    const [tailoredResume, setTailoredResume] = useState<GeneratedResumeData | null>(null);
    const [tailoredCoverLetter, setTailoredCoverLetter] = useState<string | null>(null);

    const [prepSelectedResumeId, setPrepSelectedResumeId] = useState<string>(props.savedResumeVersions.length > 0 ? props.savedResumeVersions[0].id : '');
    const [prepJobDescription, setPrepJobDescription] = useState('');
    const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [answerFeedback, setAnswerFeedback] = useState<InterviewFeedback | null>(null);
    const [isAnalyzingAnswer, setIsAnalyzingAnswer] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const speechRecognitionRef = useRef<any | null>(null);
    const professionalVoice = useRef<SpeechSynthesisVoice | null>(null);
    const tailoredCvRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                let selectedVoice = voices.find(v => v.name.includes('Google US English') && v.lang.startsWith('en-US'));
                if (!selectedVoice) selectedVoice = voices.find(v => v.name.includes('Microsoft David') || v.name.includes('Zira'));
                if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'));
                professionalVoice.current = selectedVoice || voices[0];
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);
    
    const speak = (text: string) => {
        if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (professionalVoice.current) utterance.voice = professionalVoice.current;
        utterance.pitch = 0.9;
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (view === 'interview_prep_session' && interviewQuestions.length > 0) {
            setTimeout(() => speak(interviewQuestions[currentQuestionIndex]), 500);
        }
    }, [currentQuestionIndex, interviewQuestions, view]);
    
    useEffect(() => {
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
            }
            if (finalTranscript) setUserAnswer(prev => (prev ? prev + ' ' : '') + finalTranscript.trim() + ' ');
        };
        recognition.onerror = (event: any) => { console.error("Speech recognition error", event.error); setIsListening(false); };
        recognition.onend = () => setIsListening(false);
        speechRecognitionRef.current = recognition;
        return () => recognition.stop();
    }, []);

    const toggleListening = () => {
        if (!speechRecognitionRef.current) return;
        if (isListening) speechRecognitionRef.current.stop();
        else speechRecognitionRef.current.start();
        setIsListening(!isListening);
    };
    
    const handleDownloadPdf = async () => {
        const element = tailoredCvRef.current;
        if (!element) return;
        try {
            const { jsPDF } = jspdf;
            const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save("Tailored_CV.pdf");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Sorry, there was an error generating the PDF.");
        }
    };
    
    const handleDownloadTxt = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };


    const handleGenerateTailoredAssets = async () => {
        if (!selectedVersionId || !newJd.trim()) {
            setError("Please select a base resume version and provide a new job description.");
            return;
        }
        const baseVersion = props.savedResumeVersions.find((v:any) => v.id === selectedVersionId);
        if (!baseVersion) {
            setError("Could not find the selected resume version.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setTailoredResume(null);
        setTailoredCoverLetter(null);
        try {
            const newResume = await tailorResumeFromVersion(baseVersion.resumeData, newJd, userNotes);
            setTailoredResume(newResume);
            const newCoverLetter = await generateCoverLetter(newResume, props.brainDumpModules, newJd, {});
            setTailoredCoverLetter(newCoverLetter);
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartInterviewSession = async () => {
        if (!prepSelectedResumeId || !prepJobDescription.trim()) {
            setError("Please select a resume and provide a job description.");
            return;
        }
        const baseVersion = props.savedResumeVersions.find((v:any) => v.id === prepSelectedResumeId);
        if (!baseVersion) {
            setError("Could not find the selected resume version.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const questions = await generateInterviewQuestions(baseVersion.resumeData, prepJobDescription);
            setInterviewQuestions(questions);
            setCurrentQuestionIndex(0);
            setUserAnswer('');
            setAnswerFeedback(null);
            setView('interview_prep_session');
        } catch (e: any) {
            setError(e.message || "Failed to generate interview questions.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeAnswer = async () => {
        if (!userAnswer.trim()) return;
        const baseVersion = props.savedResumeVersions.find((v:any) => v.id === prepSelectedResumeId);
        if (!baseVersion) return;
        setIsAnalyzingAnswer(true);
        setAnswerFeedback(null);
        setError(null);
        try {
            const feedback = await analyzeInterviewAnswer(interviewQuestions[currentQuestionIndex], userAnswer, baseVersion.resumeData, prepJobDescription);
            setAnswerFeedback(feedback);
        } catch(e: any) {
            setError(e.message || "Failed to get feedback.");
        } finally {
            setIsAnalyzingAnswer(false);
        }
    };
    
    const handleNextQuestion = () => {
        if (currentQuestionIndex < interviewQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setUserAnswer('');
            setAnswerFeedback(null);
            setError(null);
        } else {
            handleFinishSession();
        }
    };

    const handleFinishSession = () => {
        window.speechSynthesis.cancel();
        setView('dashboard');
        setInterviewQuestions([]);
        setError(null);
    };

    if (props.isInitialCompletion) {
        return <JourneyCompleteScreen onContinue={props.onAcknowledgeCompletion} />;
    }

    const renderDashboard = () => (
        <div className="text-center">
            <SparklesIcon className="mx-auto h-12 w-12 text-neutral-800" />
            <h2 className="mt-4 text-3xl font-bold text-neutral-800">Continuous Improvement Hub</h2>
            <p className="mt-2 text-neutral-600 max-w-2xl mx-auto">Congratulations on building your core career assets! This is your hub for ongoing career management. Use these tools to stay sharp and tailor your approach for every opportunity.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <button onClick={() => setView('tailor')} className="p-6 bg-white rounded-xl border border-neutral-200 hover:border-neutral-800 hover:bg-white transition-all text-left">
                    <div className="flex items-center space-x-4">
                        <BriefcaseIcon className="h-8 w-8 text-neutral-800" />
                        <div>
                            <h3 className="text-lg font-bold text-neutral-800">Tailor Assets for a New Role</h3>
                            <p className="mt-1 text-sm text-neutral-500">Adapt your resume and generate a new cover letter for a specific job description.</p>
                        </div>
                    </div>
                </button>
                 <button onClick={() => setView('interview_prep_setup')} className="p-6 bg-white rounded-xl border border-neutral-200 hover:border-neutral-800 hover:bg-white transition-all text-left">
                    <div className="flex items-center space-x-4">
                        <AcademicCapIcon className="h-8 w-8 text-neutral-800" />
                        <div>
                            <h3 className="text-lg font-bold text-neutral-800">AI Interview Prep</h3>
                            <p className="mt-1 text-sm text-neutral-500">Practice interview questions based on the job and get AI-powered feedback.</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );

    const renderTailorTool = () => (
        <div>
            <button onClick={() => setView('dashboard')} className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-800 mb-6">
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Hub</span>
            </button>
            <div className="bg-neutral-50 rounded-xl shadow-lg border border-neutral-200 p-6 mb-8 flex items-center space-x-6">
                <TailorAssetsIllustration className="h-24 w-24 text-amber-500 flex-shrink-0 hidden sm:block" />
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Tailor Your Assets</h2>
                    <p className="text-sm text-neutral-500 mt-1">Provide a new job description to generate a tailored resume and cover letter.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border border-neutral-200 space-y-6">
                    <div>
                        <label htmlFor="baseVersion" className="block text-sm font-medium text-neutral-700">1. Select Base Resume Version</label>
                        <select id="baseVersion" value={selectedVersionId} onChange={e => setSelectedVersionId(e.target.value)}
                            className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md">
                            {props.savedResumeVersions.map((v:any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="newJd" className="block text-sm font-medium text-neutral-700">2. Paste New Job Description (Required)</label>
                        <textarea id="newJd" rows={8} value={newJd} onChange={e => setNewJd(e.target.value)}
                            className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"
                            placeholder="Paste the full job description here..."/>
                    </div>
                     <div>
                        <label htmlFor="userNotes" className="block text-sm font-medium text-neutral-700">3. Additional Notes (Optional)</label>
                        <textarea id="userNotes" rows={3} value={userNotes} onChange={e => setUserNotes(e.target.value)}
                            className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"
                            placeholder="e.g., Emphasize my project management skills."/>
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                    <button onClick={handleGenerateTailoredAssets} disabled={isLoading} className="w-full py-3 flex items-center justify-center font-semibold rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-300 disabled:text-neutral-500">
                        {isLoading ? 'Generating...' : 'Generate Tailored Assets'}
                    </button>
                </div>
                <div className="space-y-6">
                    {isLoading && <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl p-6 border border-neutral-200"><p className="text-neutral-600">AI is tailoring your assets...</p></div>}
                    {!isLoading && tailoredResume && (
                        <div className="bg-white rounded-xl p-6 border border-neutral-200">
                            <h3 className="text-xl font-bold text-neutral-800 mb-4">New Tailored Resume</h3>
                            <div className="max-h-[70vh] overflow-y-auto bg-white rounded shadow-inner border border-neutral-200" ><div ref={tailoredCvRef}><CvViewer resumeData={tailoredResume} selectedSummaryIndex={0} selectedCompetencyIndex={0} /></div></div>
                             <div className="grid grid-cols-2 gap-2 mt-4">
                                <button onClick={handleDownloadPdf} className="flex items-center justify-center p-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md"><FileDownloadIcon className="h-4 w-4 mr-2"/>Download PDF</button>
                                <button onClick={() => navigator.clipboard.writeText(tailoredCvRef.current?.innerText || '')} className="flex items-center justify-center p-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md"><CopyIcon className="h-4 w-4 mr-2"/>Copy Text</button>
                            </div>
                        </div>
                    )}
                     {!isLoading && tailoredCoverLetter && (
                        <div className="bg-white rounded-xl p-6 border border-neutral-200">
                            <h3 className="text-xl font-bold text-neutral-800 mb-4">New Tailored Cover Letter</h3>
                            <div className="max-h-[70vh] overflow-y-auto p-4 bg-neutral-50 border border-neutral-200 rounded">
                               <p className="text-neutral-700 whitespace-pre-wrap">{tailoredCoverLetter}</p>
                            </div>
                             <div className="grid grid-cols-2 gap-2 mt-4">
                                <button onClick={() => handleDownloadTxt(tailoredCoverLetter, 'Tailored_Cover_Letter.txt')} className="flex items-center justify-center p-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md"><FileDownloadIcon className="h-4 w-4 mr-2"/>Download TXT</button>
                                <button onClick={() => navigator.clipboard.writeText(tailoredCoverLetter)} className="flex items-center justify-center p-2 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md"><CopyIcon className="h-4 w-4 mr-2"/>Copy Text</button>
                            </div>
                        </div>
                    )}
                    {!isLoading && !tailoredResume && <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl p-6 border border-dashed border-neutral-300"><p className="text-neutral-500">Your generated assets will appear here.</p></div>}
                </div>
            </div>
        </div>
    );
    
    const renderInterviewPrepSetup = () => (
         <div>
            <button onClick={() => setView('dashboard')} className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-800 mb-6"><ArrowLeftIcon className="h-4 w-4" /><span>Back to Hub</span></button>
            <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 border border-neutral-200 space-y-6">
                 <div>
                    <h2 className="text-2xl font-bold text-neutral-800">AI Interview Prep Setup</h2>
                    <p className="text-sm text-neutral-500 mt-1">Provide your resume and the job description to start a tailored practice session.</p>
                </div>
                <div>
                    <label htmlFor="prepResumeVersion" className="block text-sm font-medium text-neutral-700">1. Select Resume Version</label>
                    <select id="prepResumeVersion" value={prepSelectedResumeId} onChange={e => setPrepSelectedResumeId(e.target.value)} className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md">
                        {props.savedResumeVersions.length > 0 ? props.savedResumeVersions.map((v:any) => <option key={v.id} value={v.id}>{v.name}</option>) : <option>No saved versions</option>}
                    </select>
                </div>
                <div>
                    <label htmlFor="prepJd" className="block text-sm font-medium text-neutral-700">2. Paste Job Description</label>
                    <textarea id="prepJd" rows={10} value={prepJobDescription} onChange={e => setPrepJobDescription(e.target.value)} className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md" placeholder="Paste the full job description here..."/>
                </div>
                {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                <button onClick={handleStartInterviewSession} disabled={isLoading || props.savedResumeVersions.length === 0} className="w-full py-3 flex items-center justify-center font-semibold rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-300 disabled:text-neutral-500">{isLoading ? 'Generating Questions...' : 'Start Practice Session'}</button>
            </div>
        </div>
    );
    
    const renderInterviewPrepSession = () => {
        const currentQuestion = interviewQuestions[currentQuestionIndex];
        return (
             <div>
                <button onClick={handleFinishSession} className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-800 mb-6"><ArrowLeftIcon className="h-4 w-4" /><span>End Session & Return to Hub</span></button>
                 <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 border border-neutral-200 space-y-6">
                    <div>
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="text-sm font-semibold text-neutral-500">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</p>
                                <h2 className="mt-2 text-xl font-bold text-neutral-800">{currentQuestion}</h2>
                             </div>
                             <button onClick={() => speak(currentQuestion)} className="p-2 rounded-full text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800" title="Read question aloud"><SpeakerWaveIcon className="h-5 w-5"/></button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="userAnswer" className="block text-sm font-medium text-neutral-700 mb-2">Your Answer</label>
                        <div className="relative">
                            <textarea id="userAnswer" rows={6} value={userAnswer} onChange={e => setUserAnswer(e.target.value)} className="w-full p-2 pr-12 bg-neutral-100 border border-neutral-300 rounded-md focus:ring-1 focus:ring-amber-500" placeholder="Type or record your answer here..."/>
                            <button onClick={toggleListening} disabled={!SpeechRecognition} className={`absolute right-2 top-2 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'} disabled:opacity-50`} title={isListening ? "Stop Recording" : "Record Answer"}><MicrophoneIcon className="h-5 w-5"/></button>
                        </div>
                        <div className="mt-4 flex space-x-3"><button onClick={handleAnalyzeAnswer} disabled={isAnalyzingAnswer || !userAnswer.trim()} className="px-4 py-2 text-sm font-medium rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-300 disabled:text-neutral-500">{isAnalyzingAnswer ? 'Getting Feedback...' : 'Get Feedback'}</button></div>
                    </div>
                    {answerFeedback && (
                         <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-800">AI Feedback</h3>
                            <div><h4 className="font-semibold text-neutral-700">Clarity & Conciseness</h4><p className="text-sm text-neutral-600 mt-1">{answerFeedback.clarity}</p></div>
                            <div><h4 className="font-semibold text-neutral-700">Impact & Results</h4><p className="text-sm text-neutral-600 mt-1">{answerFeedback.impact}</p></div>
                             <div><h4 className="font-semibold text-neutral-700">STAR Method Adherence</h4><p className="text-sm text-neutral-600 mt-1">{answerFeedback.starMethodAdherence}</p></div>
                             <div className="bg-neutral-200/50 p-3 rounded-md border border-neutral-200"><h4 className="font-semibold text-neutral-800">Overall Suggestion</h4><p className="text-sm text-neutral-700 mt-1">{answerFeedback.overallSuggestion}</p></div>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                    <div className="flex justify-end pt-4 border-t border-neutral-200"><button onClick={handleNextQuestion} disabled={!answerFeedback && !isAnalyzingAnswer} className="px-6 py-2 font-medium rounded-md bg-neutral-200 text-neutral-800 hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed">{currentQuestionIndex < interviewQuestions.length - 1 ? 'Next Question' : 'Finish Session'}</button></div>
                 </div>
            </div>
        )
    };

    const renderContent = () => {
        switch (view) {
            case 'dashboard': return renderDashboard();
            case 'tailor': return renderTailorTool();
            case 'interview_prep_setup': return renderInterviewPrepSetup();
            case 'interview_prep_session': return renderInterviewPrepSession();
            default: return renderDashboard();
        }
    }

    return <div>{renderContent()}</div>;
};

export default Phase6ContinuousImprovement;
