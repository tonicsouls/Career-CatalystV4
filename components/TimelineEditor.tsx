import React, { useState } from 'react';
import { TimelineEvent } from '../types';
import TimelineItem from './TimelineItem';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { TimelineEmptyStateIllustration } from './illustrations/TimelineEmptyStateIllustration';

interface TimelineEditorProps {
  events: TimelineEvent[];
  setEvents: (events: TimelineEvent[]) => void;
  onGenerateReport: () => void;
  isLoading: boolean;
  onInteraction: () => void;
}

const TimelineEditor: React.FC<TimelineEditorProps> = ({ events, setEvents, onGenerateReport, isLoading, onInteraction }) => {
  
  const addEvent = () => {
    const newEvent: TimelineEvent = {
      id: Date.now(),
      title: 'New Role or Event',
      company: 'Company or Institution',
      date: 'Year - Year',
      description: '',
      isNew: true, // Mark as new to open in edit mode by default
    };
    setEvents([newEvent, ...events]);
    onInteraction();
  };

  const updateEvent = (id: number, updatedEvent: Partial<TimelineEvent>) => {
    setEvents(events.map(event => (event.id === id ? { ...event, ...updatedEvent, isNew: false } : event)));
    onInteraction();
  };

  const deleteEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
    onInteraction();
  };
    
  const exportTimeline = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(events, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "career_catalyst_timeline.json";
    link.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-neutral-200">
      <div className="p-6 border-b border-neutral-200">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-neutral-800">Your Career Timeline</h2>
                <p className="mt-2 text-sm text-neutral-500">
                Add, edit, and organize your career milestones. This story will fuel your AI-generated assets.
                </p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
                 <button onClick={addEvent} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-neutral-800 hover:bg-neutral-700 transition-colors">
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Event</span>
                </button>
                <button onClick={exportTimeline} className="flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-md text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors" title="Save timeline to desktop">
                    <DownloadIcon className="h-4 w-4" />
                    <span>Export</span>
                </button>
            </div>
        </div>
      </div>

      <div className="p-6 space-y-6 min-h-[300px]">
        {events.length > 0 ? (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {events.map((event, index) => (
              <TimelineItem
                key={event.id}
                event={event}
                onUpdate={updateEvent}
                onDelete={deleteEvent}
                isFirst={index === 0 && events.length === 1}
              />
            ))}
          </div>
        ) : (
            <div className="text-center py-10">
                <TimelineEmptyStateIllustration className="text-neutral-300 mx-auto" />
                <p className="mt-4 text-neutral-500">Your timeline is empty. Click "Add Event" to begin.</p>
            </div>
        )}
      </div>
      
    </div>
  );
};

export default TimelineEditor;