import React from 'react';
import { 
  BarChart3, 
  Briefcase, 
  Users, 
  UploadCloud, 
  LayoutDashboard, 
  LogOut, 
  Sparkles, 
  Building2,
  Bookmark,
  ChevronDown
} from 'lucide-react';
import { JobDescription } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { name: string; email: string };
  onLogout: () => void;
  jobs: JobDescription[];
  activeJobId: string;
  setActiveJobId: (id: string) => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout,
  jobs,
  activeJobId,
  setActiveJobId
}: SidebarProps) {
  const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];

  const menuItems = [
    { id: 'dashboard', label: 'Suite Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Job Descriptions', icon: Briefcase },
    { id: 'upload', label: 'Screen Candidates', icon: UploadCloud },
    { id: 'candidates', label: 'Talent Pool', icon: Users },
    { id: 'analytics', label: 'Talent Analytics', icon: BarChart3 }
  ];

  return (
    <aside className="w-64 border-r border-slate-200/80 bg-white flex flex-col justify-between h-screen sticky top-0 font-sans shadow-sm select-none">
      
      {/* Top Brand Block */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3 p-6 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/10">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base tracking-tight text-slate-900 leading-none">TalentFlow</h1>
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 mt-1 block">Recruiter Suite</span>
          </div>
        </div>

        {/* Dynamic active job designation picker */}
        <div className="p-4 mx-3 my-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 font-sans relative">
          <div className="flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-slate-400">
            <Bookmark className="w-3 h-3 text-indigo-500 fill-indigo-500" /> ACTIVE RECRUIT JOB
          </div>
          <div className="relative">
            <select
              value={activeJobId}
              onChange={(e) => setActiveJobId(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-transparent py-1.5 focus:outline-none cursor-pointer pr-6 appearance-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id} className="text-slate-800 font-sans">
                  {j.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-0.5 top-2.5 text-slate-400 pointer-events-none" />
          </div>
          {activeJob && (
            <div className="text-[10px] text-slate-500 font-medium">
              {activeJob.department} • {activeJob.location}
            </div>
          )}
        </div>

        {/* Navigation Core List */}
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold tracking-tight transition-all select-none cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Recruiter Workspace & Footer credentials card */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center font-bold text-slate-700 font-display border border-slate-200/60 shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-slate-800 truncate font-display">{user.name}</div>
            <div className="text-[10px] text-slate-400 truncate font-sans">{user.email}</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 border border-slate-200 bg-white rounded-xl transition-all cursor-pointer shadow-sm shadow-slate-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out Suite
        </button>
      </div>
    </aside>
  );
}
