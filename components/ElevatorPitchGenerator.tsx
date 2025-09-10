import React, { useState, useEffect, useRef } from 'react';
import { SavedResumeVersion } from '../types';
import { generateElevatorPitch } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { CopyIcon } from './icons/CopyIcon';
import { ClockIcon } from './icons/ClockIcon';

interface ElevatorPitchGeneratorProps {
    savedResumeVersions: SavedResumeVersion[];
}

type PitchType = '10-second' | '2-minute';

const ElevatorPitchGenerator: React.FC<ElevatorPitchGeneratorProps> = ({ savedResumeVersions }) => {
    const [selectedVersionId, setSelectedVersionId] = useState<string>(savedResumeVersions.length > 0 ? savedResumeVersions[0].id : '');
    const [pitchType, setPitchType] = useState<PitchType>('10-second');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedPitches, setGeneratedPitches] = useState<string[]>([]);
    
    // Practice Timer State
    const [practiceTime, setPracticeTime] = useState(10);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerIntervalRef.current!);
                        setIsTimerRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [isTimerRunning]);

    const handleGenerate = async () => {
        if (!selectedVersionId) {
            setError("Please save a resume version first.");
            return;
        }
        const selectedVersion = savedResumeVersions.find(v => v.id === selectedVersionId);
        if (!selectedVersion) {
            setError("Could not find the selected resume version.");
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedPitches([]);

        try {
            const result = await generateElevatorPitch(selectedVersion.resumeData, pitchType);
            setGeneratedPitches(result);
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartTimer = () => {
        const time = pitchType === '10-second' ? 10 : 120;
        setPracticeTime(time);
        setTimeLeft(time);
        setIsTimerRunning(true);
    };

    const handleResetTimer = () => {
        setIsTimerRunning(false);
        const time = pitchType === '10-second' ? 10 : 120;
        setTimeLeft(time);
    };

    const getTimerColor = () => {
        const percentage = (timeLeft / practiceTime) * 100;
        if (percentage > 50) return 'text-green-500';
        if (percentage > 20) return 'text-yellow-500';
        return 'text-red-500';
    };
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-10">
                <MegaphoneIcon className="mx-auto h-12 w-12 text-neutral-800" />
                <h1 className="mt-4 text-3xl font-bold text-neutral-800">Elevator Pitch Generator & Coach</h1>
                <p className="mt-2 text-neutral-500 max-w-2xl mx-auto">Craft the perfect 10-second or 2-minute pitch based on your resume, then practice your delivery.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Generator Column */}
                <div className="bg-white rounded-xl p-6 border border-neutral-200 space-y-6">
                    <h2 className="text-xl font-bold text-neutral-800">1. Generate Your Pitch</h2>
                    
                    <div>
                        <label htmlFor="pitchType" className="block text-sm font-medium text-neutral-700 mb-2">Pitch Length</label>
                        <div className="flex space-x-2">
                            <button onClick={() => setPitchType('10-second')} className={`flex-1 p-2 rounded-md font-semibold ${pitchType === '10-second' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 hover:bg-neutral-200'}`}>10-Second Pitch</button>
                            <button onClick={() => setPitchType('2-minute')} className={`flex-1 p-2 rounded-md font-semibold ${pitchType === '2-minute' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 hover:bg-neutral-200'}`}>2-Minute Overview</button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="baseVersion" className="block text-sm font-medium text-neutral-700">Resume Version for Context</label>
                         <select id="baseVersion" value={selectedVersionId} onChange={e => setSelectedVersionId(e.target.value)}
                            className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md disabled:opacity-50" disabled={savedResumeVersions.length === 0}>
                            {savedResumeVersions.length > 0 ? (
                                savedResumeVersions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)
                            ) : (
                                <option>No resume versions saved</option>
                            )}
                        </select>
                    </div>

                    <button onClick={handleGenerate} disabled={isLoading || savedResumeVersions.length === 0}
                        className="w-full py-3 flex items-center justify-center font-semibold rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed disabled:text-neutral-500">
                        <SparklesIcon className="h-5 w-5 mr-2"/>
                        {isLoading ? 'Generating...' : 'Generate Pitch Options'}
                    </button>
                    
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

                    <div className="space-y-3 min-h-[150px]">
                        {generatedPitches.length > 0 ? (
                            generatedPitches.map((pitch, index) => (
                                <div key={index} className="p-3 bg-neutral-50 border border-neutral-200 rounded-md flex justify-between items-start text-sm">
                                    <p className="text-neutral-700 flex-1">{pitch}</p>
                                    <button onClick={() => navigator.clipboard.writeText(pitch)} className="ml-2 p-2 rounded-full hover:bg-neutral-200" title="Copy">
                                        <CopyIcon className="h-4 w-4 text-neutral-500" />
                                    </button>
                                </div>
                            ))
                        ) : !isLoading && (
                            <div className="text-center p-8 border-2 border-dashed border-neutral-200 rounded-lg">
                                <p className="text-neutral-500">Your AI-generated pitches will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Practice Column */}
                <div className="bg-white rounded-xl p-6 border border-neutral-200 space-y-6 flex flex-col">
                     <h2 className="text-xl font-bold text-neutral-800">2. Practice Your Pitch</h2>
                     <div className="flex-grow flex flex-col items-center justify-center bg-neutral-50 rounded-lg p-8">
                        <ClockIcon className="h-10 w-10 text-neutral-400 mb-4"/>
                        <p className={`font-mono text-6xl font-bold tracking-tighter ${getTimerColor()}`}>
                            {formatTime(timeLeft)}
                        </p>
                        <p className="text-neutral-500 mt-2">Practice delivering your pitch within the time limit.</p>
                        <div className="flex space-x-4 mt-6">
                            <button onClick={handleStartTimer} disabled={isTimerRunning || timeLeft === 0}
                                className="px-6 py-2 font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                                Start
                            </button>
                            <button onClick={handleResetTimer}
                                className="px-6 py-2 font-semibold rounded-md bg-neutral-200 text-neutral-700 hover:bg-neutral-300">
                                Reset
                            </button>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default ElevatorPitchGenerator;