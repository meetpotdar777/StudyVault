import React, { useState, useEffect } from 'react';
import { StickyNote, Save, Trash2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PersonalNotesProps {
  paperId: string;
  notes: string;
  onSave: (note: string) => void;
  onDelete: () => void;
}

export const PersonalNotes: React.FC<PersonalNotesProps> = ({ paperId, notes, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempNote, setTempNote] = useState(notes);

  useEffect(() => {
    setTempNote(notes);
    if (!notes) setIsEditing(true);
    else setIsEditing(false);
  }, [paperId, notes]);

  const handleSave = () => {
    onSave(tempNote);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-amber-500 flex items-center gap-1.5">
          <StickyNote className="w-4 h-4 text-amber-500" />
          <span>Personal Study Notes</span>
        </h3>
        {!isEditing && notes && (
           <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-white p-1.5 bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
                title="Edit Note"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={onDelete}
                className="text-slate-500 hover:text-red-400 p-1.5 bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
                title="Delete Note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
           </div>
        )}
      </div>

      <div className="flex-1 min-h-[120px]">
        {isEditing ? (
          <div className="space-y-3 h-full flex flex-col">
            <textarea
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Jot down formulas, key insights, or reminders for this paper..."
              className="w-full flex-1 bg-slate-950 border border-slate-800 text-[11px] p-3 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 font-mono resize-none leading-relaxed"
            />
            <button
              onClick={handleSave}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Private Note
            </button>
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800/50 p-4 rounded-xl h-full overflow-y-auto">
            {notes ? (
              <p className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {notes}
              </p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <p className="text-[10px] text-slate-500 italic">No notes captured for this resource yet.</p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-indigo-400 text-[10px] font-bold hover:underline cursor-pointer"
                >
                  + Add Study Note
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="mt-3 text-[9px] text-slate-500 text-center flex items-center justify-center gap-1">
        <span className="w-1 h-1 bg-amber-500/50 rounded-full" />
        Notes are encrypted & stored locally on this device only.
      </p>
    </div>
  );
};
