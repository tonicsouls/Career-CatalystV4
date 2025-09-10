import React from 'react';
import { SavedResumeVersion, SavedLinkedInContent } from '../types';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { FileDownloadIcon } from './icons/FileDownloadIcon';
import { CopyIcon } from './icons/CopyIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CameraIcon } from './icons/CameraIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';

interface AssetHubProps {
    savedResumeVersions: SavedResumeVersion[];
    savedHeadshots: string[];
    savedLinkedInContent: SavedLinkedInContent[];
}

const AssetHub: React.FC<AssetHubProps> = ({
    savedResumeVersions,
    savedHeadshots,
    savedLinkedInContent,
}) => {

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

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
             <div className="text-center mb-10">
                <ArchiveBoxIcon className="mx-auto h-12 w-12 text-neutral-800" />
                <h1 className="mt-4 text-3xl font-bold text-neutral-800">Asset Hub</h1>
                <p className="mt-2 text-neutral-500 max-w-2xl mx-auto">Your central repository for all saved and generated career assets. Access, review, and download your content at any time.</p>
            </div>

            <div className="space-y-12">
                {/* Resumes Section */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center"><DocumentTextIcon className="h-6 w-6 mr-3 text-amber-600"/>Saved Resumes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedResumeVersions.length > 0 ? savedResumeVersions.map(version => (
                            <div key={version.id} className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col justify-between">
                                <div>
                                    <p className="font-bold text-neutral-700">{version.name}</p>
                                    <p className="text-xs text-neutral-500 mt-1">Created: {new Date(version.createdAt).toLocaleDateString()}</p>
                                    <p className="text-sm text-neutral-500 mt-2 truncate">For JD: {version.jobDescription.slice(0, 50)}...</p>
                                </div>
                                <button onClick={() => downloadJson(version.resumeData, `resume_${version.name.replace(/\s+/g, '_')}`)} className="mt-4 w-full flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md text-neutral-600 bg-neutral-100 hover:bg-neutral-200">
                                    <FileDownloadIcon className="h-4 w-4 mr-2" />
                                    Download JSON
                                </button>
                            </div>
                        )) : (
                            <p className="text-neutral-500 md:col-span-3">No resume versions saved yet. Go to the 'Review & Edit Resume' step to save a version.</p>
                        )}
                    </div>
                </section>

                {/* Headshots Section */}
                <section>
                    <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center"><CameraIcon className="h-6 w-6 mr-3 text-amber-600"/>Generated Headshots</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                         {savedHeadshots.length > 0 ? savedHeadshots.map((base64, index) => (
                             <div key={index} className="relative group">
                                 <img src={`data:image/png;base64,${base64}`} alt={`Generated Headshot ${index + 1}`} className="rounded-lg shadow-lg w-full h-auto aspect-square object-cover" />
                                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <button onClick={() => downloadImage(base64, `headshot_${index + 1}`)} className="p-2 rounded-full bg-white/20 text-white">
                                         <FileDownloadIcon className="h-6 w-6" />
                                     </button>
                                 </div>
                             </div>
                         )) : (
                             <p className="text-neutral-500 md:col-span-full">No headshots generated yet. Visit the AI Headshot Generator to create one.</p>
                         )}
                    </div>
                </section>
                
                {/* LinkedIn Section */}
                <section>
                     <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center"><LinkedInIcon className="h-6 w-6 mr-3 text-amber-600"/>LinkedIn Content</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedLinkedInContent.length > 0 ? savedLinkedInContent.map(item => (
                            <div key={item.id} className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col justify-between">
                               <div>
                                    <p className="font-bold text-neutral-700 capitalize">{item.type}</p>
                                    <p className="text-xs text-neutral-500 mt-1">Created: {new Date(item.createdAt).toLocaleDateString()}</p>
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
                            <p className="text-neutral-500 md:col-span-3">No LinkedIn content generated yet. Use the LinkedIn Optimizer to create headlines and summaries.</p>
                        )}
                     </div>
                </section>
            </div>
        </div>
    );
};

export default AssetHub;