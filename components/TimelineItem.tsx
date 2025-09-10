import React, { useState, useEffect } from 'react';
import { TimelineEvent } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { SaveIcon } from './icons/SaveIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TimelineItemProps {
  event: TimelineEvent;
  onUpdate: (id: number, updatedEvent: Partial<TimelineEvent>) => void;
  onDelete: (id: number) => void;
  isFirst: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, onUpdate, onDelete, isFirst }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localEvent, setLocalEvent] = useState(event);

  useEffect(() => {
    setLocalEvent(event);
  }, [event]);

  const handleSave = () => {
    onUpdate(event.id, localEvent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalEvent(event); // Revert changes
    setIsEditing(false);
  };

  return (
    <div className="relative pl-8">
      {!isFirst && <span className="absolute left-3.5 top-4 -ml-px h-full w-0.5 bg-neutral-200" aria-hidden="true" />}
      <div className="relative flex items-start space-x-3">
        <>
            <div className="relative">
                <div className="h-8 w-8 bg-neutral-200 rounded-full ring-8 ring-white flex items-center justify-center">
                    <PencilIcon className="h-5 w-5 text-neutral-500" />
                </div>
            </div>
            <div className="min-w-0 flex-1 py-1.5">
                {isEditing ? (
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={localEvent.title}
                            onChange={(e) => setLocalEvent({ ...localEvent, title: e.target.value })}
                            className="w-full p-1 bg-neutral-100 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-800"
                        />
                         <input
                            type="text"
                            value={localEvent.date}
                            onChange={(e) => setLocalEvent({ ...localEvent, date: e.target.value })}
                            className="w-full p-1 bg-neutral-100 border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-600 text-sm"
                        />
                        <textarea
                            value={localEvent.description}
                            onChange={(e) => setLocalEvent({ ...localEvent, description: e.target.value })}
                            rows={5}
                            className="w-full p-2 bg-white border border-neutral-300 rounded-md focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 text-neutral-700 placeholder-neutral-400 text-sm"
                        />
                        <div className="flex items-center space-x-2 pt-2">
                            <button onClick={handleSave} className="flex items-center space-x-1 px-2 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-white">
                                <SaveIcon className="h-4 w-4" />
                                <span>Save</span>
                            </button>
                             <button onClick={handleCancel} className="flex items-center space-x-1 px-2 py-1 text-xs rounded bg-neutral-200 hover:bg-neutral-300 text-neutral-700">
                                <span>Cancel</span>
                            </button>
                        </div>
                    </div>
                ) : (
                     <div>
                        <div className="flex justify-between items-center">
                            <div className="text-md text-neutral-800 font-semibold">{event.title}</div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setIsEditing(true)} className="p-1 rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-800">
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => onDelete(event.id)} className="p-1 rounded-full text-neutral-400 hover:bg-red-100 hover:text-red-500">
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-500 mt-0.5">{event.date}</p>
                        <p className="mt-2 text-sm text-neutral-600 whitespace-pre-wrap">{event.description || "No description provided."}</p>
                    </div>
                )}
            </div>
        </>
      </div>
    </div>
  );
};

export default TimelineItem;