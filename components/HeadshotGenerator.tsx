
import React, { useState, useCallback } from 'react';
import { generateHeadshot } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileParser';
import { CameraIcon } from './icons/CameraIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UploadIcon } from './icons/UploadIcon';
import { FileDownloadIcon } from './icons/FileDownloadIcon';
import { TrashIcon } from './icons/TrashIcon';

type UploadedImage = {
    file: File;
    preview: string;
    base64: string;
    mimeType: string;
};

interface HeadshotGeneratorProps {
    savedHeadshots: string[];
    setSavedHeadshots: React.Dispatch<React.SetStateAction<string[]>>;
}

const HeadshotGenerator: React.FC<HeadshotGeneratorProps> = ({ setSavedHeadshots }) => {
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [style, setStyle] = useState('Corporate');
    const [businessCategory, setBusinessCategory] = useState('Executive');
    const [lighting, setLighting] = useState('Studio Lighting');
    const [setting, setSetting] = useState('Neutral Office Background');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const processFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        if (uploadedImages.length + files.length > 3) {
            setError('You can upload a maximum of 3 images.');
            return;
        }

        const newImages: UploadedImage[] = [];
        for (const file of Array.from(files)) {
             if (!file.type.startsWith('image/')) {
                setError('Please upload a valid image file (jpeg, png, etc.).');
                continue;
            }
            try {
                const base64 = await fileToBase64(file);
                newImages.push({
                    file: file,
                    preview: URL.createObjectURL(file),
                    base64: base64,
                    mimeType: file.type
                });
            } catch (e) {
                setError('Failed to process one of the images.');
            }
        }
        
        setUploadedImages(prev => [...prev, ...newImages]);
        setError('');
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(event.target.files);
        event.target.value = ''; 
    };
    
    const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        processFiles(event.dataTransfer.files);
    }, [uploadedImages]);

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };


    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleGenerate = async () => {
        if (uploadedImages.length === 0) {
            setError("Please upload at least one image first.");
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedImage(null);
        try {
            const imageDatas = uploadedImages.map(img => ({ data: img.base64, mimeType: img.mimeType }));
            const resultBase64 = await generateHeadshot(imageDatas, style, lighting, setting, businessCategory);
            setGeneratedImage(resultBase64);
            setSavedHeadshots(prev => [resultBase64, ...prev].slice(0, 6));
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred during generation.");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadImage = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${generatedImage}`;
        link.download = 'ai_headshot.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const styleOptions = ['Corporate', 'Business Casual', 'International Business', 'Federal/Government', 'Country Club Formal', 'West Coast Business (California)', 'Southern Business (Texas)'];
    const categoryOptions = ['Executive', 'Finance', 'Sales', 'Human Resources', 'Operations & Logistics', 'IT & Engineering', 'Product Management', 'Security', 'Blue Collar Managerial'];

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                 <div className="text-center mb-10">
                    <CameraIcon className="mx-auto h-12 w-12 text-neutral-800" />
                    <h1 className="mt-4 text-3xl font-bold text-neutral-800">AI Headshot Generator</h1>
                    <p className="mt-2 text-neutral-500 max-w-2xl mx-auto">Create a professional headshot from existing photos. For best results, use clear, front-facing photos with good lighting.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="bg-white rounded-xl p-6 border border-neutral-200 space-y-6">
                        <div>
                            <h2 className="text-lg font-bold text-neutral-800 mb-2">1. Upload Your Photo(s)</h2>
                            <p className="text-xs text-neutral-500 mb-3">Upload up to 3 photos. The AI will synthesize the best features from all images.</p>
                            <div className="grid grid-cols-3 gap-4">
                                {uploadedImages.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img src={image.preview} alt={`Upload preview ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                                        <button onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {uploadedImages.length < 3 && (
                                    <label onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                                        className={`flex flex-col justify-center items-center w-full h-32 px-4 transition bg-neutral-50 border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-neutral-400 focus:outline-none ${isDragging ? 'border-amber-500' : 'border-neutral-300'}`}>
                                        <UploadIcon className="h-6 w-6 text-neutral-500" />
                                        <span className="mt-2 text-xs font-medium text-center text-neutral-500">Drag & Drop or Click</span>
                                        <input type="file" name="file_upload" className="hidden" accept="image/*" onChange={handleImageUpload} multiple />
                                    </label>
                                )}
                            </div>
                        </div>
                        
                        <OptionSelect label="2. Choose a Style" value={style} onChange={setStyle} options={styleOptions} />
                        <OptionSelect label="3. Choose a Business Category" value={businessCategory} onChange={setBusinessCategory} options={categoryOptions} />
                        <OptionSelect label="4. Choose Lighting" value={lighting} onChange={setLighting} options={['Studio Lighting', 'Natural Sunlight', 'Dramatic Lighting', 'Soft Light']} />
                        <OptionSelect label="5. Choose a Setting" value={setting} onChange={setSetting} options={['Neutral Office Background', 'Outdoor (Nature)', 'Modern Abstract Background', 'Bookshelf Backdrop']} />
                        
                        {error && <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
                        
                        <button onClick={handleGenerate} disabled={isLoading || uploadedImages.length === 0} className="w-full py-3 flex items-center justify-center font-semibold rounded-md bg-neutral-800 text-white hover:bg-neutral-700 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed">
                             <SparklesIcon className="h-5 w-5 mr-2" />
                            {isLoading ? 'Generating...' : 'Generate Headshot'}
                        </button>
                    </div>

                    {/* Output */}
                    <div className="bg-white rounded-xl p-6 border border-neutral-200 flex flex-col items-center justify-center">
                        {isLoading ? (
                            <div className="text-center">
                                <svg className="animate-spin h-10 w-10 text-neutral-800 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-4 text-neutral-600">AI is generating your headshot... this may take a moment.</p>
                            </div>
                        ) : generatedImage ? (
                            <div className="text-center">
                                <img src={`data:image/png;base64,${generatedImage}`} alt="Generated Headshot" className="rounded-lg shadow-lg max-w-full max-h-[400px]"/>
                                <button onClick={downloadImage} className="mt-6 flex items-center justify-center mx-auto px-6 py-2.5 font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                                    <FileDownloadIcon className="h-5 w-5 mr-2" />
                                    Download Image
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-neutral-400">
                                 <SparklesIcon className="h-12 w-12 mx-auto" />
                                <p className="mt-4">Your generated headshot will appear here.</p>
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

export default HeadshotGenerator;
