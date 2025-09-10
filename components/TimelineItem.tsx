import React, { useState, useEffect } from 'react';
import { TimelineEvent } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { SaveIcon } from './icons/SaveIcon';
import { TrashIcon } from './icons/TrashIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface TimelineItemProps {
  event: TimelineEvent;
  onUpdate: (id: number, updatedEvent: Partial<TimelineEvent>) => void;
  onDelete: (id: number) => void;
  isFirst: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, onUpdate, onDelete, isFirst }) => {
  const [isEditing, setIsEditing] = useState(event.isNew || false);
  const [localEvent, setLocalEvent] = useState(event);

  useEffect(() => {
    // When the external event prop changes, update the local state.
    // This is useful if events are re-ordered or changed externally.
    setLocalEvent(event);
  }, [event]);

  const handleSave = () => {
    onUpdate(event.id, localEvent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalEvent(event); // Revert changes to original event prop
    setIsEditing(false);
  };

  const renderDescription = (description: string) => {
    if (!description || !description.trim()) {
      return <p className="mt-2 text-sm text-neutral-500 italic">No description provided.</p>;
    }
    const lines = description.split('\n').filter(line => line.trim() !== '');
    const isList = lines.some(line => /^\s*[-*•]/.test(line));

    if (isList) {
      return (
        <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-neutral-600">
          {lines.map((line, index) => (
            <li key={index} className="pl-2">{line.replace(/^\s*[-*•]\s*/, '')}</li>
          ))}
        </ul>
      );
    }

    return <p className="mt-2 text-sm text-neutral-600 whitespace-pre-wrap">{description}</p>;
  };

  return (
    <div className="relative pl-8">
      {!isFirst && <span className="absolute left-3.5 top-4 -ml-px h-full w-0.5 bg-neutral-200" aria-hidden="true" />}
      <div className="relative flex items-start space-x-3">
        <>
            <div className="relative">
                <div className="h-8 w-8 bg-neutral-200 rounded-full ring-8 ring-white flex items-center justify-center">
                    <BriefcaseIcon className="h-5 w-5 text-neutral-500" />
                </div>
            </div>
            <div className="min-w-0 flex-1 py-1.5">
                {isEditing ? (
                    <div className="space-y-3 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        <input
                            type="text"
                            placeholder="Role / Title"
                            value={localEvent.title}
                            onChange={(e) => setLocalEvent({ ...localEvent, title: e.target.value })}
                            className="w-full p-2 bg-white border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-800 font-semibold"
                        />
                        <input
                            type="text"
                            placeholder="Company / Institution"
                            value={localEvent.company}
                            onChange={(e) => setLocalEvent({ ...localEvent, company: e.target.value })}
                            className="w-full p-2 bg-white border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-700"
                        />
                         <input
                            type="text"
                            placeholder="Dates (e.g., 2020 - Present)"
                            value={localEvent.date}
                            onChange={(e) => setLocalEvent({ ...localEvent, date: e.target.value })}
                            className="w-full p-2 bg-white border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-600 text-sm"
                        />
                        <textarea
                            value={localEvent.description}
                            onChange={(e) => setLocalEvent({ ...localEvent, description: e.target.value })}
                            rows={5}
                            placeholder="Description / Key Achievements..."
                            className="w-full p-2 bg-white border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-700 placeholder-neutral-400 text-sm"
                        />
                        <div className="flex items-center space-x-2 pt-2">
                            <button onClick={handleSave} className="flex items-center space-x-1 px-3 py-1.5 text-sm rounded bg-neutral-800 hover:bg-neutral-700 text-white">
                                <SaveIcon className="h-4 w-4" />
                                <span>Save</span>
                            </button>
                             <button onClick={handleCancel} className="flex items-center space-x-1 px-3 py-1.5 text-sm rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-700">
                                <span>Cancel</span>
                            </button>
                        </div>
                    </div>
                ) : (
                     <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-md text-neutral-800 font-semibold">{event.title}</div>
                                {event.company && <div className="text-sm text-neutral-600 font-medium">{event.company}</div>}
                                <p className="text-sm text-neutral-500 mt-0.5">{event.date}</p>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0 ml-4">
                                <button onClick={() => setIsEditing(true)} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-800">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => onDelete(event.id)} className="p-2 rounded-full text-neutral-400 hover:bg-red-100 hover:text-red-500">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        {renderDescription(event.description)}
                    </div>
                )}
            </div>
        </>
      </div>
    </div>
  );
};

export default TimelineItem;