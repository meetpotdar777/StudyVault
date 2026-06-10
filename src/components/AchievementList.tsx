import React from 'react';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: (stats: any) => boolean;
}

interface AchievementListProps {
  achievements: string[]; // IDs of unlocked ones
  stats: any;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Viewed your first resource',
    icon: <Eye className="w-4 h-4" />,
    requirement: (s) => s.viewCount >= 1
  },
  {
    id: 'deep_diver',
    title: 'Deep Diver',
    description: 'Viewed 10 different resources',
    icon: <BookOpen className="w-4 h-4" />,
    requirement: (s) => s.viewCount >= 10
  },
  {
    id: 'curator',
    title: 'Resource Curator',
    description: 'Bookmarked 5 study materials',
    icon: <Bookmark className="w-4 h-4" />,
    requirement: (s) => s.bookmarkCount >= 5
  },
  {
    id: 'time_master',
    title: 'Time Master',
    description: 'Completed a focus session',
    icon: <Clock className="w-4 h-4" />,
    requirement: (s) => s.sessionCount >= 1
  },
  {
    id: 'scholar',
    title: 'Rising Scholar',
    description: 'Reached Rank Level 2',
    icon: <Award className="w-4 h-4" />,
    requirement: (s) => s.level >= 2
  }
];

import { Eye, BookOpen, Bookmark, Clock } from 'lucide-react';

export const AchievementList: React.FC<AchievementListProps> = ({ achievements, stats }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
      <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-indigo-400 mb-4 flex items-center gap-1.5">
        <Award className="w-4 h-4 text-indigo-400" />
        <span>Academic Achievements</span>
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {ACHIEVEMENTS.map(achievement => {
          const isUnlocked = achievements.includes(achievement.id);
          return (
            <div 
              key={achievement.id}
              className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                isUnlocked 
                  ? 'bg-indigo-600/10 border-indigo-500/20 text-slate-100' 
                  : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
              }`}
            >
              <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-indigo-600 border border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-slate-800'}`}>
                {isUnlocked ? achievement.icon : <Lock className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-bold">{achievement.title}</h4>
                <p className="text-[9px] mt-0.5 leading-tight">{achievement.description}</p>
              </div>
              {isUnlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
