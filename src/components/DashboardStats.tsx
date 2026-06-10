import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Paper } from '../types';
import { LayoutGrid, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  papers: Paper[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ papers }) => {
  const [activeTab, setActiveTab] = React.useState<'mix' | 'activity'>('mix');

  const mixData = [
    { name: 'Paper', downloads: papers.filter(p => p.docType === 'Question Paper').reduce((acc, p) => acc + p.downloadCount, 0) },
    { name: 'Notes', downloads: papers.filter(p => p.docType === 'Notes').reduce((acc, p) => acc + p.downloadCount, 0) },
    { name: 'Solution', downloads: papers.filter(p => p.docType === 'Solution').reduce((acc, p) => acc + p.downloadCount, 0) },
  ];

  const activityData = [
    { day: 'Mon', downloads: 120 },
    { day: 'Tue', downloads: 450 },
    { day: 'Wed', downloads: 320 },
    { day: 'Thu', downloads: 280 },
    { day: 'Fri', downloads: 600 },
    { day: 'Sat', downloads: 850 },
    { day: 'Sun', downloads: 400 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-indigo-400 flex items-center gap-1.5">
          <span>{activeTab === 'mix' ? 'Download Popularity by Category' : 'Weekly Community Traffic'}</span>
        </h3>
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
           <button 
             onClick={() => setActiveTab('mix')}
             className={`p-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'mix' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <LayoutGrid className="w-3.5 h-3.5" />
           </button>
           <button 
             onClick={() => setActiveTab('activity')}
             className={`p-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'activity' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <TrendingUp className="w-3.5 h-3.5" />
           </button>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'mix' ? (
            <BarChart data={mixData}>
              <XAxis dataKey="name" fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
              />
              <Bar dataKey="downloads" radius={[4, 4, 0, 0]}>
                  {mixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : index === 1 ? '#10b981' : '#f59e0b'} />
                  ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis fontSize={11} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} hide />
              <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="downloads" stroke="#6366f1" fillOpacity={1} fill="url(#colorDownloads)" strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
