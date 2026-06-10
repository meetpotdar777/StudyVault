import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudyTimerProps {
  onSessionComplete?: (type: 'study' | 'break') => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ onSessionComplete }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a subtle sound or notify (simulated)
      if (mode === 'study') {
        setMode('break');
        setTimeLeft(5 * 60);
        if (onSessionComplete) onSessionComplete('study');
      } else {
        setMode('study');
        setTimeLeft(25 * 60);
        if (onSessionComplete) onSessionComplete('break');
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onSessionComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 pointer-events-none transition-colors ${mode === 'study' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
      
      <div className="relative z-10">
        <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-400 mb-4 flex items-center gap-1.5">
          <Timer className="w-4 h-4 text-indigo-400" />
          <span>Study Session Timer</span>
        </h3>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {mode === 'study' ? (
                <Brain className="w-4 h-4 text-indigo-400" />
              ) : (
                <Coffee className="w-4 h-4 text-emerald-400" />
              )}
              <span className={`text-[10px] font-bold uppercase tracking-wider ${mode === 'study' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                {mode === 'study' ? 'Concentration Mode' : 'Rest Interval'}
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimer}
              className={`p-3 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
              }`}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            initial={false}
            animate={{ 
              width: `${(timeLeft / (mode === 'study' ? 25 * 60 : 5 * 60)) * 100}%`,
              backgroundColor: mode === 'study' ? '#6366f1' : '#10b981'
            }}
            transition={{ duration: 0.5 }}
            className="h-full shadow-[0_0_8px_rgba(99,102,241,0.3)]"
          />
        </div>
      </div>
    </div>
  );
};
