import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { TrashIcon } from './icons/TrashIcon';

interface AudioRecorderProps {
  onRecordingComplete: (audioUrl: string) => void;
  initialAudioUrl: string | null;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, initialAudioUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(initialAudioUrl);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // FIX: Replaced the Node.js-specific type `NodeJS.Timeout` with `number`.
  // `setInterval` returns a number in browser environments, which is where this component runs.
  const timerIntervalRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => { // Cleanup on unmount
      // FIX: Use `window.clearInterval` to ensure the browser's implementation is used, which expects a `number`.
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Convert to base64 to store in local storage
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            onRecordingComplete(reader.result as string);
        };
        
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimer(0);
      // FIX: Use `window.setInterval` to ensure the browser's implementation is used.
      // The browser version returns a `number`, resolving the type conflict where the Node.js
      // version (returning `Timeout`) was being inferred.
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error starting recording:", err);
      if (err instanceof DOMException && err.name === 'NotFoundError') {
          alert("No microphone was found. Please ensure a microphone is connected and enabled.");
      } else {
          alert("Microphone access was denied or an error occurred. Please allow microphone access in your browser settings to use this feature.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // FIX: Use `window.clearInterval` to ensure the browser's implementation is used, which expects a `number`.
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    }
  };
  
  const deleteRecording = () => {
      setAudioURL(null);
      setTimer(0);
      onRecordingComplete(''); // Notify parent to clear data
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-neutral-100/70 p-4 rounded-lg border border-neutral-200 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-700">Record Your Story</p>
        <p className="text-xs text-neutral-500">Add context with your own voice.</p>
      </div>
      <div className="flex items-center space-x-3">
        {audioURL && !isRecording && (
          <>
            <audio src={audioURL} controls className="h-8"></audio>
            <button onClick={deleteRecording} className="p-2 rounded-full text-neutral-400 hover:bg-red-100 hover:text-red-500 transition-colors" title="Delete Recording">
              <TrashIcon className="h-5 w-5" />
            </button>
          </>
        )}
        {!audioURL && (
            isRecording ? (
              <button onClick={stopRecording} className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors">
                <StopIcon className="h-5 w-5" />
                <span>{formatTime(timer)}</span>
              </button>
            ) : (
              <button onClick={startRecording} className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 transition-colors">
                <MicrophoneIcon className="h-5 w-5" />
                <span>Record</span>
              </button>
            )
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;