import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle,
  Award,
  Filter,
  CheckCircle,
  Brain
} from 'lucide-react';
import { Candidate, JobDescription } from '../types';

interface AnalyticsViewProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  activeJobId: string;
}

export default function AnalyticsView({ candidates, jobs, activeJobId }: AnalyticsViewProps) {
  const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];
  const activeCandidates = candidates.filter(c => c.activeJobId === activeJobId);

  // 1. Scoring distribution calculation
  const scoreDistribution = {
    poor: candidates.filter(c => c.analysis.atsScore < 50).length,
    average: candidates.filter(c => c.analysis.atsScore >= 50 && c.analysis.atsScore < 70).length,
    good: candidates.filter(c => c.analysis.atsScore >= 70 && c.analysis.atsScore < 85).length,
    elite: candidates.filter(c => c.analysis.atsScore >= 85).length
  };

  const totalProcessedValue = candidates.length;

  // 2. Hiring funnel stack count
  const funnel = {
    total: candidates.length,
    screened: candidates.filter(c => c.status === 'Screened' || c.status === 'Shortlisted').length,
    shortlisted: candidates.filter(c => c.status === 'Shortlisted').length,
    rejected: candidates.filter(c => c.status === 'Rejected').length
  };

  // 3. Top technical skills histogram in whole talent pool
  const skillCountMap: { [key: string]: number } = {};
  candidates.forEach(c => {
    c.analysis.skills.forEach(sk => {
      skillCountMap[sk] = (skillCountMap[sk] || 0) + 1;
    });
  });

  const sortedSkills = Object.entries(skillCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // 4. Skills Gap Analysis for active job
  // Percentage of candidates of active job who are missing each required skill
  const activeRequirements = activeJob ? activeJob.keySkills : [];
  const skillsGapData = activeRequirements.map(reqSkill => {
    const totalJobCandidates = activeCandidates.length;
    if (totalJobCandidates === 0) return { skill: reqSkill, gapPercent: 0, presentCount: 0 };
    
    // Count how many candidates have this skill
    const presentCount = activeCandidates.filter(c => 
      c.analysis.skills.some(s => s.toLowerCase() === reqSkill.toLowerCase())
    ).length;
    
    const gapPercent = Math.round(((totalJobCandidates - presentCount) / totalJobCandidates) * 100);
    return {
      skill: reqSkill,
      gapPercent,
      presentCount
    };
  });

  return (
    <div className="space-y-8 font-sans animate-fade-in text-left">
      
      {/* Title block */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight leading-none">
          Talent Pool Analytics
        </h2>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
          Aggregated visual reports representing vetting distributions, skills coverage and hiring funnel efficiency.
        </p>
      </div>

      {/* Main Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl">

        {/* Chart 1: ATS SCORE DISTRIBUTION (CUSTOM SVG HISTOGRAM) */}
        <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-50">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase font-display flex items-center gap-1.5"><Brain className="w-4 h-4 text-indigo-505" /> ATS Score Distribution</h3>
                <p className="text-[10px] text-slate-400">Comparing candidates across standard matching brackets</p>
              </div>
            </div>

            {/* Render gorgeous interactive histogram */}
            <div className="relative py-6">
              <div className="grid grid-cols-4 gap-4 items-end h-40">
                {[
                  { range: '<50', count: scoreDistribution.poor, color: 'bg-rose-400', label: 'Unmatched' },
                  { range: '50-69', count: scoreDistribution.average, color: 'bg-indigo-300', label: 'Borderline' },
                  { range: '70-84', count: scoreDistribution.good, color: 'bg-indigo-500', label: 'Strong' },
                  { range: '>=85', count: scoreDistribution.elite, color: 'bg-emerald-500', label: 'Elite Match' }
                ].map((bar, idx) => {
                  const maxCount = Math.max(1, scoreDistribution.poor, scoreDistribution.average, scoreDistribution.good, scoreDistribution.elite);
                  const barHeightPercent = (bar.count / maxCount) * 100;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-3 h-full justify-end group">
                      <div className="text-[10.5px] font-mono font-bold text-slate-600 transition-transform group-hover:scale-105 duration-200">
                        {bar.count} candidates
                      </div>
                      <div className="w-full h-[120px] bg-slate-50 rounded-2xl flex items-end overflow-hidden border border-slate-100 relative shadow-inner">
                        <div 
                          className={`${bar.color} w-full rounded-t-xl transition-all duration-700`}
                          style={{ height: `${barHeightPercent || 4}%` }}
                        />
                      </div>
                      <div className="text-center font-sans tracking-tight">
                        <div className="text-xs font-bold text-slate-850 leading-none">{bar.range}</div>
                        <div className="text-[9.5px] text-slate-400 mt-1 leading-none">{bar.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-4 border-t border-slate-50 mt-4 font-semibold italic">Based on actual matching evaluations compiled via Gemini multimodal pipelines database records.</div>
        </div>

        {/* Chart 2: HIRING FUNNEL VISUALIZATION */}
        <div className="lg:col-span-6 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-50">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase font-display flex items-center gap-1.5"><Filter className="w-4 h-4 text-emerald-500" /> Pipeline Funnel Triage</h3>
                <p className="text-[10px] text-slate-400">Monitoring recruiter vetting stages efficiency</p>
              </div>
            </div>

            {/* Funnel Visual Stack */}
            <div className="space-y-4">
              {[
                { title: 'Screened Pool Size', count: funnel.total, percent: 100, color: 'bg-indigo-600' },
                { title: 'Vetted & Cleaned', count: funnel.screened, percent: funnel.total ? Math.round((funnel.screened / funnel.total) * 100) : 0, color: 'bg-indigo-500' },
                { title: 'Decision: Shortlisted', count: funnel.shortlisted, percent: funnel.total ? Math.round((funnel.shortlisted / funnel.total) * 100) : 0, color: 'bg-emerald-500' }
              ].map((layer, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">{layer.title}</span>
                    <span className="font-mono text-slate-500">{layer.count} Applicants ({layer.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-xl h-4 overflow-hidden shadow-inner border border-slate-200/40">
                    <div 
                      className={`${layer.color} h-full transition-all duration-750`} 
                      style={{ width: `${layer.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-slate-450 font-medium pt-3.5 border-t border-slate-100">Shortlisting represents the target action to summon candidates to physical board panel interviews.</div>
        </div>

        {/* Chart 3: SKILLS GAP ANALYSIS (ACTIVE JOB EXCLUSIVE) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-50">
              <div>
                <h3 className="text-xs font-bold text-slate-850 uppercase font-display flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-indigo-505" /> Active Job Skills Gap Analysis</h3>
                <p className="text-[10px] text-slate-400">Presenting missing required technologies in active matching target: <span className="font-semibold text-indigo-600">{activeJob?.title}</span></p>
              </div>
            </div>

            {skillsGapData.length === 0 ? (
              <div className="py-12 text-center text-slate-450 italic text-xs">
                No target criteria set for active job. Add key skills on the Jobs tab.
              </div>
            ) : (
              <div className="space-y-4">
                {skillsGapData.map((data, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4 text-xs font-sans">
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 truncate">{data.skill}</span>
                        <span className={`font-semibold ${data.gapPercent > 50 ? 'text-rose-600' : 'text-slate-550'}`}>
                          {data.gapPercent}% deficit (Only {data.presentCount} profiles cover)
                        </span>
                      </div>
                      <div className="w-full bg-slate-50 border border-slate-100 rounded-lg h-2.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            data.gapPercent > 50 
                              ? 'bg-gradient-to-r from-rose-400 to-rose-500' 
                              : 'bg-gradient-to-r from-indigo-400 to-indigo-500'
                          }`}
                          style={{ width: `${data.gapPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-[10px] text-slate-400 pt-4 border-t border-slate-50 mt-4 leading-relaxed font-semibold">Note: Deficit represents the percentage of applicants who DO NOT fulfill or omit this specific skill parameter. Let recruiter address gaps in code-auditing stages.</div>
        </div>

        {/* Chart 4: TOP PROFILE COMPETENCIES MAP IN THE TALENT WELL */}
        <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-50">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase font-display flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-indigo-505" /> Most Common Technical Skills</h3>
                <p className="text-[10px] text-slate-400 font-sans">Most frequent technologies detected across whole recruiter indexes</p>
              </div>
            </div>

            {sortedSkills.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                Gathering candidate records to analyze competencies.
              </div>
            ) : (
              <div className="space-y-3.5">
                {sortedSkills.map(([skillName, freq], idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-4.5 h-4.5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono text-[10px] font-bold">#{idx + 1}</span>
                      <span className="font-bold text-slate-700">{skillName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800">{freq} candidates</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-[10px] text-slate-400 pt-4 border-t border-slate-50 mt-4 leading-relaxed font-semibold italic">Leverage this competency density index to craft prospective team training pathways.</div>
        </div>

      </div>

    </div>
  );
}
