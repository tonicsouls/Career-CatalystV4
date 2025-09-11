

import React, { useState, useMemo } from 'react';
import { SavedResumeVersion, SavedLinkedInContent, JobPreset } from '../types';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { FileDownloadIcon } from './icons/FileDownloadIcon';
import { CopyIcon } from './icons/CopyIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CameraIcon } from './icons/CameraIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { TrashIcon } from './icons/TrashIcon';
import { RocketLaunchIcon } from './icons/RocketLaunchIcon';

interface AssetHubProps {
    savedResumeVersions: SavedResumeVersion[];
    savedHeadshots: string[];
    savedLinkedInContent: SavedLinkedInContent[];
    jobPresets: JobPreset[];
    activePresetId: string | null;
    onActivatePreset: (id: string) => void;
    onDeletePreset: (id: string) => void;
    onStartQuickStart: () => void;
}

type Tab = 'presets' | 'resumes' | 'headshots' | 'linkedin';

const AssetHub: React.FC<AssetHubProps> = ({
    savedResumeVersions,
    savedHeadshots,
    savedLinkedInContent,
    jobPresets,
    activePresetId,
    onActivatePreset,
    onDeletePreset,
    onStartQuickStart,
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('presets');
    const [searchTerm, setSearchTerm] = useState('');

    const downloadJson = (data: any, filename: string) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadImage = (base64: string, filename: string) => {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${base64}`;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    const copyToClipboard = (content: string | string[]) => {
         const text = Array.isArray(content) ? content.join('\n\n') : content;
         navigator.clipboard.writeText(text).then(() => alert('Copied to clipboard!'));
    }

    const filteredJobPresets = useMemo(() => jobPresets.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())), [jobPresets, searchTerm]);
    const filteredResumes = useMemo(() => savedResumeVersions.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase())), [savedResumeVersions, searchTerm]);
    const filteredLinkedIn = useMemo(() => savedLinkedInContent.filter(c => c.type.toLowerCase().includes(searchTerm.toLowerCase())), [savedLinkedInContent, searchTerm]);

    const hasAnyAssets = jobPresets.length > 0 || savedResumeVersions.length > 0 || savedHeadshots.length > 0 || savedLinkedInContent.length > 0;

    const tabs: { id: Tab; name: string; icon: React.ReactNode; count: number }[] = [
        { id: 'presets', name: 'Job Presets', icon: <BriefcaseIcon className="h-5 w-5 mr-2" />, count: filteredJobPresets.length },
        { id: 'resumes', name: 'Resumes', icon: <DocumentTextIcon className="h-5 w-5 mr-2" />, count: filteredResumes.length },
        { id: 'headshots', name: 'Headshots', icon: <CameraIcon className="h-5 w-5 mr-2" />, count: savedHeadshots.length },
        { id: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon className="h-5 w-5 mr-2" />, count: filteredLinkedIn.length },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'presets':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobPresets.length > 0 ? filteredJobPresets.map(preset => {
                            const isActive = preset.id === activePresetId;
                            return (
                                <div key={preset.id} className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all ${isActive ? 'border-amber-500 ring-2 ring-amber-200' : 'border-neutral-200'}`}>
                                    <div>
                                        <p className="font-bold text-neutral-700">{preset.name}</p>
                                        <p className="text-xs text-neutral-500 mt-1">Created: {new Date(preset.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-4">
                                        <button 
                                            onClick={() => onActivatePreset(preset.id)} 
                                            disabled={isActive}
                                            className="flex-1 flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md text-neutral-600 bg-neutral-100 hover:bg-neutral-200 disabled:bg-amber-100 disabled:text-amber-800 disabled:cursor-not-allowed"
                                        >
                                            {isActive ? 'Active' : 'Start Journey'}
                                        </button>
                                         <button onClick={() => onDeletePreset(preset.id)} className="p-2 rounded-md text-neutral-400 hover:bg-red-100 hover:text-red-500" title="Delete Preset">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )
                        }) : (
                            <p className="text-neutral-500 md:col-span-3">No job presets saved yet.</p>
                        )}
                    </div>
                );
            case 'resumes':
                 return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResumes.length > 0 ? filteredResumes.map(version => (
                            <div key={version.id} className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col justify-between">
                                <div>
                                    <p className="font-bold text-neutral-700">{version.name}</p>
                                    <p className="text-xs text-neutral-500 mt-1">Created: {new Date(version.createdAt).toLocaleString()}</p>
                                    <p className="text-sm text-neutral-500 mt-2 truncate">For JD: {version.jobDescription.slice(0, 50)}...</p>
                                </div>
                                <button onClick={() => downloadJson(version.resumeData, `resume_${version.name.replace(/\s+/g, '_')}`)} className="mt-4 w-full flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md text-neutral-600 bg-neutral-100 hover:bg-neutral-200">
                                    <FileDownloadIcon className="h-4 w-4 mr-2" />
                                    Download JSON
                                </button>
                            </div>
                        )) : (
                            <p className="text-neutral-500 md:col-span-3">No resume versions saved yet.</p>
                        )}
                    </div>
                );
            case 'headshots':
                return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                         {savedHeadshots.length > 0 ? savedHeadshots.map((base64, index) => (
                             <div key={index} className="relative group">
                                 <img src={`data:image/png;base64,${base64}`} alt={`Generated Headshot ${index + 1}`} className="rounded-lg shadow-lg w-full h-auto aspect-square object-cover" />
                                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                     <button onClick={() => downloadImage(base64, `headshot_${index + 1}`)} className="p-2 rounded-full bg-white/20 text-white">
                                         <FileDownloadIcon className="h-6 w-6" />
                                     </button>
                                 </div>
                             </div>
                         )) : (
                             <p className="text-neutral-500 md:col-span-full">No headshots generated yet.</p>
                         )}
                    </div>
                );
            case 'linkedin':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLinkedIn.length > 0 ? filteredLinkedIn.map(item => (
                            <div key={item.id} className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col justify-between">
                               <div>
                                    <p className="font-bold text-neutral-700 capitalize">{item.type}</p>
                                    <p className="text-xs text-neutral-500 mt-1">Created: {new Date(item.createdAt).toLocaleString()}</p>
                                    <div className="text-sm text-neutral-600 mt-2 p-2 bg-neutral-50 rounded-md max-h-24 overflow-y-auto">
                                        {Array.isArray(item.content) ? item.content.join(', ') : item.content}
                                    </div>
                               </div>
                               <button onClick={() => copyToClipboard(item.content)} className="mt-4 w-full flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md text-neutral-600 bg-neutral-100 hover:bg-neutral-200">
                                   <CopyIcon className="h-4 w-4 mr-2" />
                                   Copy Content
                               </button>
                           </div>
                        )) : (
                            <p className="text-neutral-500 md:col-span-3">No LinkedIn content generated yet.</p>
                        )}
                     </div>
                );
            default: return null;
        }
    };

    if (!hasAnyAssets) {
        return (
            <div className="text-center p-10">
                <ArchiveBoxIcon className="mx-auto h-12 w-12 text-neutral-400" />
                <h1 className="mt-4 text-2xl font-bold text-neutral-800">Your Asset Hub is Empty</h1>
                <p className="mt-2 text-neutral-500 max-w-lg mx-auto">This is your central repository for all saved and generated career assets. To get started, go through the "Quick Start" process.</p>
                <button
                    onClick={onStartQuickStart}
                    className="mt-6 flex items-center justify-center gap-2 mx-auto px-6 py-2.5 font-semibold rounded-md text-white bg-neutral-800 hover:bg-neutral-700"
                >
                    <RocketLaunchIcon className="h-5 w-5" />
                    Start Quick Start
                </button>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
             <div className="text-center mb-10">
                <ArchiveBoxIcon className="mx-auto h-12 w-12 text-neutral-800" />
                <h1 className="mt-4 text-3xl font-bold text-neutral-800">Asset Hub</h1>
                <p className="mt-2 text-neutral-500 max-w-2xl mx-auto">Your central repository for all saved and generated career assets. Access, review, and download your content at any time.</p>
            </div>

            <div className="sticky top-16 bg-white/80 backdrop-blur-md z-10 py-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                     <div className="border-b border-neutral-200">
                        <nav className="-mb-px flex space-x-6">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors
                                        ${activeTab === tab.id
                                            ? 'border-neutral-800 text-neutral-800'
                                            : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                                        }`}
                                >
                                    {tab.icon} {tab.name} <span className="ml-2 bg-neutral-200 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded-full">{tab.count}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filter assets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-4 pr-4 py-2 bg-neutral-100 border border-neutral-300 rounded-md"
                        />
                    </div>
                </div>
            </div>

            <div className="animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};

export default AssetHub;