import React, { useEffect, useState } from 'react';
import { CheckIcon } from './icons/CheckIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';

interface ToastNotificationProps {
    message: string | null;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 2800); // A bit shorter than the parent's timeout to allow fade-out
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className={`fixed bottom-5 right-5 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {message && (
                <div className="flex items-center space-x-3 bg-neutral-800 text-white px-4 py-3 rounded-lg shadow-2xl">
                    <ArchiveBoxIcon className="h-5 w-5 text-amber-300"/>
                    <p className="text-sm font-medium">{message}</p>
                </div>
            )}
        </div>
    );
};

export default ToastNotification;
