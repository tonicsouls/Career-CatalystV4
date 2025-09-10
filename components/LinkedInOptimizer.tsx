import React, { useState } from 'react';
import { SavedResumeVersion, SavedLinkedInContent, LinkedInContentType } from '../types';
import { generateLinkedInHeadline, generateLinkedInSummary, generateLinkedInBanner } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CopyIcon } from './icons/CopyIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import RecommendationWizard from './RecommendationWizard';
import { LinkedInIcon } from './icons/LinkedInIcon';

interface LinkedInOptimizerProps {
    savedResumeVersions: SavedResumeVersion[];
    savedLinkedInContent: SavedLinkedInContent[];
    setSavedLinkedInContent: React.Dispatch<React.SetStateAction<SavedLinkedInContent[]>>;
}

type Tool = 'headline' | 'summary' | 'recommendations' | 'banner' | 'experience' | 'skills';

const LinkedInOptimizer: React.FC<LinkedInOptimizerProps> = ({ savedResumeVersions, setSavedLinkedInContent }) => {
    const [activeTool, setActiveTool] = useState<Tool>('headline');
    const [selectedVersionId, setSelectedVersionId] = useState<string>(savedResumeVersions.length > 0 ? savedResumeVersions[0].id : '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedContent, setGeneratedContent] = useState<string[] | string | null>(null);
    const [generatedBanner, setGeneratedBanner] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!selectedVersionId) {
            setError("Please save a resume version in the Career Catalyst to use this tool.");
            return;
        }
        const selectedVersion = savedResumeVersions.find(v => v.id === selectedVersionId);
        if (!selectedVersion) {
            setError("Could not find the selected resume version.");
            return;
        }

        setIsLoading(true);
        setError('');
        setGeneratedContent(null);
        setGeneratedBanner(null);

        try {
            let result: string[] | string | null = null;
            if (activeTool === 'headline') {
                result = await generateLinkedInHeadline(selectedVersion.resumeData);
                setGeneratedContent(result);
            } else if (activeTool === 'summary') {
                result = await generateLinkedInSummary(selectedVersion.resumeData);
                setGeneratedContent(result);
            }
            
            if (result && (activeTool === 'headline' || activeTool === 'summary')) {
                const newContent: SavedLinkedInContent = {
                    id: Date.now().toString(),
                    type: activeTool,
                    content: result,
                    createdAt: new Date().toISOString(),
                };
                setSavedLinkedInContent(prev => [newContent, ...prev].slice(0, 3));
            }

        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateBanner = async (profession: string, theme: string) => {
        setIsLoading(true);
        setError('');
        setGeneratedBanner(null);
        try {
            // FIX: The `generateLinkedInBanner` function expects a single config object.
            // Create a config object with the provided parameters and some defaults.
            const config = {
                style: theme,
                palette: 'Cool Blues and Grays', // Default value
                complexity: 50, // Default value
                elements: `professional banner for a ${profession}`,
            };
            const banner = await generateLinkedInBanner(config);
            setGeneratedBanner(banner);
        } catch (e: any) {
            setError(e.message || "Failed to generate banner.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderHeadlineSummaryContent = () => {
        if (isLoading) {
             return (
                <div className="flex items-center justify-center p-12">
                    <svg className="animate-spin mr-3 h-6 w-6 text-neutral-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-neutral-600">AI is working...</span>
                </div>
            );
        }
        if (error) {
             return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
        }

        if (Array.isArray(generatedContent)) { // For headlines
            return (
                <div className="space-y-3">
                    {generatedContent.map((item, index) => (
                        <div key={index} className="p-4 bg-neutral-50 border border-neutral-200 rounded-md flex justify-between items-center">
                            <p className="text-neutral-700">{item}</p>
                            <button onClick={() => navigator.clipboard.writeText(item)} className="p-2 rounded-full hover:bg-neutral-200" title="Copy">
                                <CopyIcon className="h-4 w-4 text-neutral-500" />
                            </button>
                        </div>
                    ))}
                </div>
            );
        }
        
        if (typeof generatedContent === 'string') { // For summary
             return (
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                     <div className="flex justify-end mb-2">
                        <button onClick={() => navigator.clipboard.writeText(generatedContent)} className="flex items-center space-x-2 px-3 py-1 text-xs rounded-md bg-neutral-200 hover:bg-neutral-300" title="Copy">
                             <CopyIcon className="h-3 w-3 text-neutral-500" />
                             <span>Copy Text</span>
                        </button>
                    </div>
                    <p className="text-neutral-700 whitespace-pre-wrap">{generatedContent}</p>
                </div>
            );
        }
        
        return (
            <div className="text-center p-12 border-2 border-dashed border-neutral-200 rounded-lg">
                <p className="text-neutral-500">Your AI-generated content will appear here.</p>
            </div>
        );
    }

    const renderToolContent = () => {
        if (activeTool === 'headline' || activeTool === 'summary') {
            return (
                <>
                    <div className="my-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                        <label htmlFor="baseVersion" className="block text-sm font-medium text-neutral-700">Select Resume Version to Analyze</label>
                         <select id="baseVersion" value={selectedVersionId} onChange={e => setSelectedVersionId(e.target.value)}
                            className="mt-1 w-full p-2 bg-white border border-neutral-300 rounded-md disabled:opacity-50" disabled={savedResumeVersions.length === 0}>
                            {savedResumeVersions.length > 0 ? (
                                savedResumeVersions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)
                            ) : (
                                <option>No resume versions saved</option>
                            )}
                        </select>
                    </div>
                    
                    <button onClick={handleGenerate} disabled={isLoading || savedResumeVersions.length === 0}
                        className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 font-semibold rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-300 disabled:cursor-not-allowed disabled:text-neutral-500">
                        <SparklesIcon className="h-5 w-5 mr-2"/>
                        Generate
                    </button>

                    <div className="mt-8">
                        {renderHeadlineSummaryContent()}
                    </div>
                </>
            );
        }
        if (activeTool === 'recommendations') {
            return <RecommendationWizard />;
        }
        if (activeTool === 'banner') {
            return <BannerGenerator onGenerate={handleGenerateBanner} isLoading={isLoading} generatedBanner={generatedBanner} error={error} />;
        }
        return null;
    }

    const toolConfig = {
        headline: { title: "AI Headline Generator", description: "Generate several keyword-optimized headlines that grab attention and improve profile visibility." },
        summary: { title: "AI Summary ('About') Generator", description: "Draft a professional summary that weaves your work history and achievements into a compelling narrative." },
        recommendations: { title: "Recommendation Request Builder", description: "Craft a polite and professional message to request a recommendation from a colleague." },
        banner: { title: "AI Banner Image Generator", description: "Create a custom, professional banner image for your profile background." },
        experience: { title: "Work Experience Optimizer (Coming Soon)", description: "Rephrase your job responsibilities to be more results-oriented and include industry-specific keywords." },
        skills: { title: "Targeted Skills Suggester (Coming Soon)", description: "Get suggestions for the most in-demand skills to include on your profile based on your industry." }
    };

    const currentTool = toolConfig[activeTool];

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <div className="bg-white rounded-xl p-4 border border-neutral-200 sticky top-24">
                        <h2 className="text-lg font-bold text-neutral-800 p-2">LinkedIn Tools</h2>
                        <nav className="space-y-1">
                            <NavItem icon={<UserCircleIcon className="h-5 w-5"/>} label="Headline" isActive={activeTool === 'headline'} onClick={() => setActiveTool('headline')} />
                            <NavItem icon={<DocumentTextIcon className="h-5 w-5"/>} label="Summary" isActive={activeTool === 'summary'} onClick={() => setActiveTool('summary')} />
                            <NavItem icon={<PencilSquareIcon className="h-5 w-5"/>} label="Recommendations" isActive={activeTool === 'recommendations'} onClick={() => setActiveTool('recommendations')} />
                            <NavItem icon={<PhotoIcon className="h-5 w-5"/>} label="Banner Generator" isActive={activeTool === 'banner'} onClick={() => setActiveTool('banner')} />
                            <NavItem icon={<SparklesIcon className="h-5 w-5"/>} label="Experience" isDisabled={true} />
                            <NavItem icon={<SparklesIcon className="h-5 w-5"/>} label="Skills" isDisabled={true} />
                        </nav>
                    </div>
                </aside>

                <main className="lg:col-span-3">
                    <div className="bg-white rounded-xl p-6 border border-neutral-200">
                        <h1 className="text-2xl font-bold text-neutral-800">{currentTool.title}</h1>
                        <p className="mt-1 text-neutral-600">{currentTool.description}</p>
                        {renderToolContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

const BannerGenerator: React.FC<{
    onGenerate: (profession: string, theme: string) => void;
    isLoading: boolean;
    generatedBanner: string | null;
    error: string;
}> = ({ onGenerate, isLoading, generatedBanner, error }) => {
    const [profession, setProfession] = useState('');
    const [theme, setTheme] = useState('Abstract Tech');

    const themes = ['Abstract Tech', 'Minimalist Corporate', 'Nature Inspired', 'Geometric Patterns', 'Creative Studio'];

    return (
        <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="profession" className="block text-sm font-medium text-neutral-700">Your Profession/Industry</label>
                    <input type="text" id="profession" value={profession} onChange={e => setProfession(e.target.value)}
                        className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md"
                        placeholder="e.g., Software Engineer, Marketing Director" />
                </div>
                 <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-neutral-700">Visual Theme</label>
                    <select id="theme" value={theme} onChange={e => setTheme(e.target.value)}
                        className="mt-1 w-full p-2 bg-neutral-100 border border-neutral-300 rounded-md">
                        {themes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>
            
            <button onClick={() => onGenerate(profession, theme)} disabled={isLoading || !profession}
                className="mt-6 w-full sm:w-auto flex items-center justify-center px-6 py-2.5 font-semibold rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed">
                <SparklesIcon className="h-5 w-5 mr-2"/>
                Generate Banner
            </button>
            
            <div className="mt-8">
                {isLoading && (
                    <div className="flex items-center justify-center p-12">
                        <svg className="animate-spin mr-3 h-6 w-6 text-neutral-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-neutral-600">AI is creating your banner...</span>
                    </div>
                )}
                {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
                {generatedBanner && !isLoading && (
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-3">Generated Banner</h3>
                        <img src={`data:image/png;base64,${generatedBanner}`} alt="AI Generated LinkedIn Banner" className="rounded-md border border-neutral-300 w-full" />
                    </div>
                )}
                 {!generatedBanner && !isLoading && (
                    <div className="text-center p-12 border-2 border-dashed border-neutral-200 rounded-lg">
                        <p className="text-neutral-500">Your AI-generated banner will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const NavItem: React.FC<{
    icon: React.ReactNode,
    label: string,
    isActive?: boolean,
    onClick?: () => void,
    isDisabled?: boolean
}> = ({ icon, label, isActive, onClick, isDisabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`w-full flex items-center space-x-3 p-3 text-left rounded-md transition-colors ${
                isActive ? 'bg-neutral-100 text-neutral-800' 
                : isDisabled ? 'text-neutral-400 cursor-not-allowed'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
            }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );
};


export default LinkedInOptimizer;