import React from 'react';
import { 
  Users, 
  FileCheck, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Calendar,
  UserCheck,
  TrendingUp,
  Brain
} from 'lucide-react';
import { Candidate, JobDescription } from '../types';

interface DashboardViewProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  activeJobId: string;
  onNavigateToTab: (tab: string) => void;
  onViewCandidate: (candId: string) => void;
  user: { name?: string; email?: string } | null;
}

export default function DashboardView({ 
  candidates, 
  jobs, 
  activeJobId, 
  onNavigateToTab, 
  onViewCandidate,
  user
}: DashboardViewProps) {
  
  const displayUserName = user 
    ? (user.name || user.email?.split('@')[0] || user.email || 'Recruiter') 
    : 'Recruiter';
  // Stats calculations
  const totalCandidates = candidates.length;
  const processedCandidates = candidates.filter(c => c.analysis && c.analysis.atsScore !== undefined);
  const totalProcessedCount = processedCandidates.length;
  const averageAtsScore = totalProcessedCount > 0 
    ? Math.round(processedCandidates.reduce((acc, c) => acc + c.analysis.atsScore, 0) / totalProcessedCount) 
    : 0;
  const shortlistedCount = candidates.filter(c => c.status === 'Shortlisted').length;

  // Filter and rank for the active job to show "Current Job Status" context
  const activeJob = jobs.find(j => j.id === activeJobId);
  const activeJobCandidates = candidates.filter(c => c.activeJobId === activeJobId);
  const sortedTopCandidates = [...activeJobCandidates]
    .filter(c => c.analysis && c.analysis.atsScore !== undefined)
    .sort((a, b) => b.analysis.atsScore - a.analysis.atsScore)
    .slice(0, 5);

  const recentUploads = [...candidates]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 font-sans animate-fade-in">
      
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 tracking-tight leading-none">
            Welcome back, {displayUserName}
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 font-sans leading-relaxed">
            Here's an overview of our recruitment funnels matching against <span className="font-semibold text-indigo-600">{activeJob?.title || 'Active Jobs'}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigateToTab('upload')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 cursor-pointer text-white text-xs font-semibold rounded-xl.5 transition-all shadow-sm flex items-center gap-1.5 border border-indigo-500/10"
          >
            <Sparkles className="w-3.5 h-3.5" /> Direct Screen
          </button>
        </div>
      </div>

      {/* Stats Bento Grid Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-indigo-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/10 rounded-full blur-2xl group-hover:bg-indigo-50/20 transition-all" />
          <div className="space-y-1 z-10">
            <span className="text-slate-400 text-xs font-semibold tracking-tight uppercase">Talent Pool Size</span>
            <div className="text-3xl font-display font-extrabold text-slate-900">{totalCandidates}</div>
            <span className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> All active pipelines
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-cyan-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-50/10 rounded-full blur-2xl group-hover:bg-cyan-50/20 transition-all" />
          <div className="space-y-1 z-10">
            <span className="text-slate-400 text-xs font-semibold tracking-tight uppercase">Resumes Processed</span>
            <div className="text-3xl font-display font-extrabold text-slate-900">{totalProcessedCount}</div>
            <span className="text-[10px] text-cyan-600 font-medium flex items-center gap-0.5">
              <Brain className="w-3 h-3 text-cyan-500" /> Parsed via Gemini AI
            </span>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-emerald-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/10 rounded-full blur-2xl group-hover:bg-emerald-50/20 transition-all" />
          <div className="space-y-1 z-10">
            <span className="text-slate-400 text-xs font-semibold tracking-tight uppercase">Average ATS Score</span>
            <div className="text-3xl font-display font-extrabold text-slate-900">{averageAtsScore}%</div>
            <span className="text-[10px] text-emerald-600 font-medium">
              Over match threshold (60)
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-amber-200 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/10 rounded-full blur-2xl group-hover:bg-amber-50/20 transition-all" />
          <div className="space-y-1 z-10">
            <span className="text-slate-400 text-xs font-semibold tracking-tight uppercase">Shortlisted Candidates</span>
            <div className="text-3xl font-display font-extrabold text-slate-900">{shortlistedCount}</div>
            <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5">
              <UserCheck className="w-3 h-3 text-amber-500" /> Passed recruiter vetting
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main split section: Recent Uploads & Top Ranked Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Recent Uploads */}
        <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display">Recent Active Uploads</h3>
                <p className="text-[10.5px] text-slate-400">Chronological history of recent recruiter parses</p>
              </div>
              <button 
                onClick={() => onNavigateToTab('candidates')}
                className="text-indigo-600 hover:text-indigo-700 text-xs font-bold font-sans inline-flex items-center gap-0.5"
              >
                Inspect All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentUploads.length === 0 ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <FileCheck className="w-10 h-10 text-slate-300 stroke-1" />
                <div className="text-xs font-semibold">No candidates uploaded yet</div>
                <button
                  onClick={() => onNavigateToTab('upload')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all text-[11px] text-slate-600 font-semibold"
                >
                  Upload Resumes Now
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentUploads.map((c) => {
                  const job = jobs.find(j => j.id === c.activeJobId);
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => onViewCandidate(c.id)}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/70 rounded-xl px-2.5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/40 text-indigo-700 flex items-center justify-center font-display font-semibold text-xs shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate font-display group-hover:text-indigo-600 transition-colors">
                            {c.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="truncate">{job?.title || 'Undefined Position'}</span> • <Calendar className="w-2.5 h-2.5" /> {new Date(c.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Score Indicator Badge */}
                        <div className="text-right">
                          <div className={`text-xs font-extrabold ${
                            c.analysis.atsScore >= 80 
                              ? 'text-emerald-600' 
                              : c.analysis.atsScore >= 60 
                                ? 'text-indigo-600' 
                                : 'text-slate-500'
                          }`}>
                            {c.analysis.atsScore}% Score
                          </div>
                          <span className={`text-[9px] uppercase font-bold tracking-widest ${
                            c.status === 'Shortlisted' 
                              ? 'text-emerald-500' 
                              : c.status === 'Rejected' 
                                ? 'text-red-500' 
                                : 'text-slate-400'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Top Ranked in selected Job description */}
        <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display">Best Matches: {activeJob?.title || 'Active Job'}</h3>
                <p className="text-[10.5px] text-slate-400">Auto-ranked candidates by computed ATS weights</p>
              </div>
            </div>

            {sortedTopCandidates.length === 0 ? (
              <div className="py-12 text-center text-slate-450 text-xs italic flex flex-col items-center justify-center gap-2">
                <Sparkles className="w-8 h-8 text-indigo-300 stroke-1" />
                <span>No screened candidates match {activeJob?.title || 'the active job'}.</span>
                <button
                  onClick={() => onNavigateToTab('upload')}
                  className="px-3.5 py-1.5 mt-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-all text-[11px] text-indigo-600 font-bold"
                >
                  Match Candidate Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedTopCandidates.map((c, index) => (
                  <div 
                    key={c.id}
                    onClick={() => onViewCandidate(c.id)}
                    className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-white transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Rank Indicator Badge */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        index === 0 
                          ? 'bg-amber-100 text-amber-700 border border-amber-200/40' 
                          : index === 1 
                            ? 'bg-slate-200 text-slate-700' 
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        #{index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate font-display group-hover:text-indigo-600 transition-colors">
                          {c.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {c.analysis.skills.slice(0, 3).join(', ')} Match
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      <div className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold flex items-center gap-1 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {c.analysis.atsScore}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-medium">Auto-scoring uses weight breakdown: 40% Skills, 30% Keywords, 20% Experience, 10% Academics.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
