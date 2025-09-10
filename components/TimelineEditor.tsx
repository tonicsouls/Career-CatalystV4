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
}

const TimelineEditor: React.FC<TimelineEditorProps> = ({ events, setEvents, onGenerateReport, isLoading }) => {
  
  const addEvent = () => {
    const newEvent: TimelineEvent = {
      id: Date.now(),
      title: 'New Role or Event',
      date: 'Year - Year',
      description: '',
    };
    setEvents([...events, newEvent]);
  };

  const updateEvent = (id: number, updatedEvent: Partial<TimelineEvent>) => {
    setEvents(events.map(event => (event.id === id ? { ...event, ...updatedEvent } : event)));
  };

  const deleteEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
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
            <button onClick={exportTimeline} className="flex-shrink-0 flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-md text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors" title="Save timeline to desktop">
                <DownloadIcon className="h-4 w-4" />
                <span>Export</span>
            </button>
        </div>
      </div>

      <div className="p-6 space-y-6 min-h-[300px] flex flex-col justify-center">
        {events.length > 0 ? (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {events.map((event, index) => (
              <TimelineItem
                key={event.id}
                event={event}
                onUpdate={updateEvent}
                onDelete={deleteEvent}
                isFirst={index === 0}
              />
            ))}
          </div>
        ) : (
            <div className="text-center py-10">
                <TimelineEmptyStateIllustration className="text-neutral-300 mx-auto" />
            </div>
        )}
      </div>
      
      <div className="bg-neutral-50/80 px-6 py-4 border-t border-neutral-200 rounded-b-xl">
        <button
            onClick={addEvent}
            className="w-full flex items-center justify-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md shadow-sm text-neutral-700 bg-white hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-100 focus:ring-neutral-800 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Event
        </button>
      </div>
    </div>
  );
};

export default TimelineEditor;