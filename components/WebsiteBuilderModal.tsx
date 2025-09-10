
import React from 'react';
import Modal from './Modal';
import { GlobeIcon } from './icons/GlobeIcon';

interface WebsiteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WebsiteBuilderModal: React.FC<WebsiteBuilderModalProps> = ({ isOpen, onClose }) => {
  const handleEmailClick = () => {
    window.location.href = "mailto:Darryl.Erby@gmail.com?subject=Personal Website Builder Session Inquiry";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Build Your Personal Website">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="bg-neutral-800 p-4 rounded-lg flex-shrink-0">
            <GlobeIcon className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Personal Website Session</h2>
            <p className="mt-2 text-neutral-600">
              Transform your career assets into a polished, professional online presence. In a single 90-minute session, an expert will work with you 1-on-1 to build and launch your personal website.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-neutral-200">
                <h3 className="font-bold text-neutral-800 mb-2">What You'll Get:</h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-600 text-sm">
                    <li>A live, deployed personal website to share with recruiters.</li>
                    <li>Hands-on, guided session tailored to your needs.</li>
                    <li>A showcase for your resume, projects, and portfolio.</li>
                    <li>A professional domain setup (e.g., yourname.com).</li>
                    <li>A modern, mobile-responsive design.</li>
                </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-neutral-200">
                 <h3 className="font-bold text-neutral-800 mb-2">The Details:</h3>
                 <div className="space-y-2 text-neutral-600 text-sm">
                    <p><strong>Cost:</strong> <span className="text-xl font-bold text-amber-600">$50</span></p>
                    <p><strong>Duration:</strong> 90 minutes</p>
                    <p><strong>Platform:</strong> Live video call (e.g., Google Meet)</p>
                    <p><strong>Expert:</strong> Darryl Erby</p>
                 </div>
            </div>
        </div>
        
        <div>
          <h3 className="font-bold text-neutral-800 mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-2 text-neutral-600 text-sm pl-4">
            <li>Click the button below to open a pre-filled email in your mail client.</li>
            <li>Briefly introduce yourself and mention any specific goals for your website.</li>
            <li>Darryl will reply promptly to schedule your session and arrange payment.</li>
          </ol>
        </div>

        <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-end items-center gap-4">
          <p className="text-sm text-neutral-500">Ready to get started? Send an email to inquire.</p>
          <button
            onClick={handleEmailClick}
            className="w-full sm:w-auto px-6 py-2.5 font-semibold rounded-md text-white bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            Inquire via Email
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WebsiteBuilderModal;
