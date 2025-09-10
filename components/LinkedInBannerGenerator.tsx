import React, { useState } from 'react';
import { generateLinkedInBanner } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileParser';
import { SparklesIcon } from './icons/SparklesIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';

type InspirationImage = {
    file: File;
    preview: string;
    base64: string;
    mimeType: string;
};

const LinkedInBannerGenerator: React.FC = () => {
    const [style, setStyle] = useState('Abstract Professional');
    const [palette, setPalette] = useState('Cool Blues and Grays');
    const [complexity, setComplexity] = useState(50);
    const [elements, setElements] = useState('subtle geometric patterns, light rays');
    const [inspirationImage, setInspirationImage] = useState<InspirationImage | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState('');

     const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file.');
            return;
        }
        
        try {
            const base64 = await fileToBase64(file);
            setInspirationImage({
                file,
                preview: URL.createObjectURL(file),
                base64,
                mimeType: file.type
            });
            setError('');
        } catch (e) {
            setError('Failed to process image.');
        } finally {
             event.target.value = '';
        }
    };
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedImage(null);
        try {
            const config = {
                style,
                palette,
                complexity,
                elements,
                inspirationImage: inspirationImage ? { data: inspirationImage.base64, mimeType: inspirationImage.mimeType } : undefined
            };
            const resultBase64 = await generateLinkedInBanner(config);
            setGeneratedImage(resultBase64);
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred during generation.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <PhotoIcon className="mx-auto h-12 w-12 text-neutral-800" />
                    <h1 className="mt-4 text-3xl font-bold text-neutral-800">AI LinkedIn Banner Generator</h1>
                    <p className="mt-2 text-neutral-500 max-w-2xl mx-auto">Design a unique, professional banner for your LinkedIn profile. Mix and match styles, colors, and elements to create the perfect visual identity.</p>
                </div>
                
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="bg-white rounded-xl p-6 border border-neutral-200 space-y-6">
                        <h2 className="text-xl font-bold text-neutral-800">Configuration Wizard</h2>
                        
                        <OptionSelect label="1. Style" value={style} onChange={setStyle} options={['Abstract Professional', 'Minimalist & Clean', 'Tech & Futuristic', 'Organic & Natural', 'Bold & Geometric']} />
                        <OptionSelect label="2. Color Palette" value={palette} onChange={setPalette} options={['Cool Blues and Grays', 'Warm Earth Tones', 'Vibrant & Energetic', 'Monochromatic Grays', 'Professional Navy and Gold']} />

                        <div>
                            <label htmlFor="complexity" className="block text-lg font-bold text-neutral-800">3. Complexity</label>
                            <input id="complexity" type="range" min="10" max="100" step="10" value={complexity} onChange={e => setComplexity(Number(e.target.value))}
                                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer" />
                            <div className="flex justify-between text-xs text-neutral-500">
                                <span>Simple</span>
                                <span>Detailed</span>
                            </div>
                        </div>
                        
                        <div>
                             <label htmlFor="elements" className="block text-lg font-bold text-neutral-800">4. Key Elements</label>
                             <p className="text-xs text-neutral-500 mb-2">Describe shapes, textures, or concepts to include.</p>
                             <input type="text" id="elements" value={elements} onChange={e => setElements(e.target.value)}
                                className="w-full p-2.5 bg-neutral-100 border border-neutral-300 rounded-md text-neutral-800"
                                placeholder="e.g., subtle gradients, network lines" />
                        </div>
                        
                        <div>
                             <h3 className="block text-lg font-bold text-neutral-800">5. Inspiration (Optional)</h3>
                              <p className="text-xs text-neutral-500 mb-2">Upload an image for style, color, or composition inspiration.</p>
                              {inspirationImage ? (
                                  <div className="relative group">
                                    <img src={inspirationImage.preview} alt="Inspiration preview" className="w-full h-32 object-cover rounded-md"/>
                                    <button onClick={() => setInspirationImage(null)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                              ) : (
                                 <label className="flex flex-col justify-center items-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-neutral-400 focus:outline-none border-neutral-300">
                                    <UploadIcon className="h-6 w-6 text-neutral-500" />
                                    <span className="mt-2 text-sm font-medium text-center text-neutral-500">Upload Image</span>
                                    <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                              )}
                        </div>
                        
                        {error && <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

                         <button onClick={handleGenerate} disabled={isLoading} className="w-full py-3 flex items-center justify-center font-semibold rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed">
                             <SparklesIcon className="h-5 w-5 mr-2" />
                            {isLoading ? 'Generating...' : 'Generate Banner'}
                        </button>
                    </div>
                    {/* Output */}
                    <div className="bg-white rounded-xl p-6 border border-neutral-200 flex flex-col items-center justify-center min-h-[400px]">
                         {isLoading ? (
                            <div className="text-center">
                                <svg className="animate-spin h-10 w-10 text-neutral-800 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-4 text-neutral-600">AI is designing your banner...</p>
                            </div>
                        ) : generatedImage ? (
                            <div className="w-full">
                                <h3 className="text-lg font-semibold text-neutral-800 mb-3">Generated Banner</h3>
                                <img src={`data:image/png;base64,${generatedImage}`} alt="AI Generated LinkedIn Banner" className="rounded-md border border-neutral-200 w-full" />
                            </div>
                        ) : (
                             <div className="text-center text-neutral-500">
                                 <SparklesIcon className="h-12 w-12 mx-auto" />
                                <p className="mt-4">Your generated banner will appear here.</p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
};

const OptionSelect: React.FC<{
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: string[]
}> = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-lg font-bold text-neutral-800 mb-2">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full p-2.5 bg-neutral-100 border border-neutral-300 rounded-md text-neutral-800">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default LinkedInBannerGenerator;