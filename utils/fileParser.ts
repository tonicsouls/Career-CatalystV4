// utils/fileParser.ts

// Since pdf.js is loaded via an import map/script tag in index.html, 
// we need to dynamically import it and declare the mammoth global.
let pdfjsLib: any;
import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs').then(pdf => {
    pdfjsLib = pdf;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
});

declare const mammoth: any;

const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Error reading text file."));
    reader.readAsText(file);
  });
};

const readPdfFile = async (file: File): Promise<string> => {
    if (!pdfjsLib) {
        throw new Error("PDF processing library is not loaded yet. Please try again in a moment.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return textContent;
};

const readDocxFile = async (file: File): Promise<string> => {
    if (typeof mammoth === 'undefined') {
        throw new Error("DOCX processing library is not loaded. Please check your internet connection and refresh the page.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

export const extractTextFromFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    if (extension === 'pdf' || mimeType === 'application/pdf') {
        return readPdfFile(file);
    } else if (extension === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return readDocxFile(file);
    } else if (['txt', 'md'].includes(extension || '') || mimeType.startsWith('text/')) {
        return readTextFile(file);
    } else {
        throw new Error('Unsupported file type. Please upload a PDF, DOCX, TXT, or MD file.');
    }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Result is a Data URL: data:image/jpeg;base64,...
      // We only want the base64 part
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};