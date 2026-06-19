import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  FileText, 
  Award, 
  Target, 
  TrendingUp, 
  Bookmark, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Layers, 
  GraduationCap, 
  FolderGit2, 
  Compass, 
  Briefcase,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Trash2,
  SlidersHorizontal
} from 'lucide-react';
import { Candidate, JobDescription } from '../types';
import { cleanAndCategorizeSkills } from '../utils/skillUtils';

interface CandidateAnalysisViewProps {
  candidateId: string;
  candidates: Candidate[];
  jobs: JobDescription[];
  onBackToList: () => void;
  onUpdateStatus: (id: string, status: Candidate['status']) => void;
  onDeleteCandidate: (id: string) => void;
}

export default function CandidateAnalysisView({ 
  candidateId, 
  candidates, 
  jobs, 
  onBackToList,
  onUpdateStatus,
  onDeleteCandidate
}: CandidateAnalysisViewProps) {
  const candidate = candidates.find(c => c.id === candidateId);
  const activeJob = candidate ? jobs.find(j => j.id === candidate.activeJobId) : null;
  const [activeSubTab, setActiveSubTab] = useState<'MATCH_DEEP_DIVE' | 'PROFILE_MODULES' | 'RAW_TEXT'>('RAW_TEXT');

  // Stateful confirmations & toasts
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successToast, setSuccessToast] = useState<string>('');
  const [errorToast, setErrorToast] = useState<string>('');

  const displaySuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const displayError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(''), 4000);
  };

  if (!candidate) {
    return (
      <div className="py-12 text-center text-slate-500 font-sans space-y-4">
        <p>Candidate not found or was removed.</p>
        <button onClick={onBackToList} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold leading-none cursor-pointer">
          Go back tracking
        </button>
      </div>
    );
  }

  const { analysis } = candidate;

  // Dynamic ATS calculations for transparency
  const keySkills = activeJob?.keySkills || [];
  const candidateSkills = candidate.analysis.skills || [];
  
  // 1. Matched / Missing Skills (intersection / complement)
  const matchedSkillsSet = new Set<string>();
  const missingSkillsSet = new Set<string>();
  
  keySkills.forEach(jobSkill => {
    const isMatched = candidateSkills.some(candSkill => 
      candSkill.toLowerCase() === jobSkill.toLowerCase() ||
      candSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(candSkill.toLowerCase())
    );
    if (isMatched) {
      matchedSkillsSet.add(jobSkill);
    } else {
      missingSkillsSet.add(jobSkill);
    }
  });

  const matchedSkillsList = Array.from(matchedSkillsSet);
  const missingSkillsList = Array.from(missingSkillsSet);

  // 2. Dynamic Keywords check
  const getCleanKeywords = (text: string): string[] => {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4 && !['about', 'would', 'their', 'there', 'other', 'after', 'first', 'could', 'should', 'these', 'those', 'where', 'which', 'while', 'under', 'years', 'using', 'build', 'scale', 'every'].includes(w));
  };

  const jobWords = activeJob ? Array.from(new Set([
    ...getCleanKeywords(activeJob.title),
    ...getCleanKeywords(activeJob.description),
    ...(activeJob.requirements || []).flatMap(r => getCleanKeywords(r))
  ])) : [];

  const resumeTextLower = (candidate.resumeText || '').toLowerCase();
  
  const matchedKeywordsSet = new Set<string>();
  const missingKeywordsSet = new Set<string>();

  jobWords.forEach(word => {
    if (resumeTextLower.includes(word)) {
      matchedKeywordsSet.add(word);
    } else {
      missingKeywordsSet.add(word);
    }
  });

  const matchedKeywordsList = Array.from(matchedKeywordsSet).slice(0, 15);
  const missingKeywordsList = Array.from(missingKeywordsSet).slice(0, 15);

  // Compute status badge styles for local controls
  const handleStatusUpdate = async (newStatus: Candidate['status']) => {
    try {
      const response = await fetch(`/api/candidates/${candidate.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Unresolved update.');
      const data = await response.json();
      onUpdateStatus(candidate.id, data.status);
      displaySuccess(`Candidate status successfully updated to ${newStatus}.`);
    } catch {
      displayError('Failed to synchronize status update to database.');
    }
  };

  const handleDeleteCandidateClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      const response = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Deletion failed.');
      displaySuccess('Candidate record successfully removed from storage.');
      setTimeout(() => {
        onDeleteCandidate(candidate.id);
      }, 800);
    } catch {
      displayError('Failed to delete candidate.');
    }
  };

  return (
    <div className="space-y-8 font-sans animate-fade-in text-left relative">

      {/* Toast alerts */}
      {successToast && (
        <div className="fixed top-5 right-5 bg-emerald-600 text-white text-xs font-bold px-4.5 py-3 rounded-2xl shadow-xl flex items-center gap-2 z-50 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-white" />
          <span>{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-5 right-5 bg-rose-600 text-white text-xs font-bold px-4.5 py-3 rounded-2xl shadow-xl flex items-center gap-2 z-50 animate-fade-in">
          <XCircle className="w-4 h-4 shrink-0 text-white" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Custom inline confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-205/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-slate-850 font-display flex items-center gap-2"><Trash2 className="w-4.5 h-4.5 text-rose-500" /> Confirm Deletion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete candidate <strong className="text-slate-800 font-bold">{candidate.name}</strong> from the enterprise talent pool? This action cannot be undone.
            </p>
            <div className="flex items-center gap-2.5 justify-end pt-2">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Return navigator and quick triage header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToList}
            className="p-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase leading-none">SCREENING REPORT AUDIT</span>
            <h2 className="text-xl md:text-2xl font-display font-extrabold text-slate-900 leading-none mt-1">
              {candidate.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 font-sans">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {candidate.email}</span>
              {candidate.phone && <span className="flex items-center gap-1"><span className="text-slate-300">•</span> <Phone className="w-3.5 h-3.5" /> {candidate.phone}</span>}
            </div>
          </div>
        </div>

        {/* Local Trage Action menu button bars + Delete Candidate */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-slate-400 font-bold tracking-tight uppercase">Vetting Decision:</span>
          {['New', 'Screened', 'Shortlisted', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusUpdate(st as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs select-none cursor-pointer transition-all ${
                candidate.status === st
                  ? st === 'Shortlisted' 
                    ? 'bg-emerald-600 text-white' 
                    : st === 'Rejected' 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
          <button
            onClick={handleDeleteCandidateClick}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 text-rose-700 cursor-pointer transition-all flex items-center gap-1.5 shadow-sm md:ml-3"
            title="Delete Candidate Record Permanently"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Candidate
          </button>
        </div>
      </div>

      {candidate.isLocalFallback && (
        <div id="local-fallback-warning" className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Local Parsing System Utilized</p>
            <p className="text-amber-800 leading-relaxed">
              We encountered a temporary Gemini API outage or key config error. The resume structure (Skills, Education, Projects, Experience, and Certifications) has been parsed locally using Regex and Keyword heuristics. ATS scoring has been calculated using our offline weighted algorithm.
            </p>
          </div>
        </div>
      )}

      {/* Main Core Layout grid: Score summary card & Deep dive tabs container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Score summary and breakdowns card */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="text-center relative py-4">
            <div className="absolute inset-0 bg-radial from-indigo-50/50 to-transparent blur-xl pointer-events-none" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">COMPUTED MATCH PROBABILITY</span>
            <div className="text-6xl font-display font-black text-indigo-600 tracking-tight mt-2">{analysis.atsScore}%</div>
            
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-mono uppercase font-bold mt-4 shadow-sm select-none">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> SYSTEM RATIO STABLE
            </span>
          </div>

          {/* Breakdown percentage bar metrics */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase font-display select-none">ATS Evaluation Vector Weights</h3>
            
            {/* Metric 1 */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between font-semibold">
                <span>Skills Profile Relevance (40%)</span>
                <span>{analysis.skillsMatch}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${analysis.skillsMatch}%` }} />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="space-y-1.5 text-xs text-slate-605">
              <div className="flex justify-between font-semibold">
                <span>Keyword Density Sync (30%)</span>
                <span>{analysis.keywordMatch}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${analysis.keywordMatch}%` }} />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="space-y-1.5 text-xs text-slate-605">
              <div className="flex justify-between font-semibold">
                <span>Tenure Relevance (20%)</span>
                <span>{analysis.experienceMatch}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${analysis.experienceMatch}%` }} />
              </div>
            </div>

            {/* Metric 4 */}
            <div className="space-y-1.5 text-xs text-slate-605">
              <div className="flex justify-between font-semibold">
                <span>Academic & Badges Align (10%)</span>
                <span>{analysis.educationMatch}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${analysis.educationMatch}%` }} />
              </div>
            </div>
          </div>

          {/* Resume file badge */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold"><FileText className="w-4.5 h-4.5 text-indigo-550" /> {candidate.resumeFileName}</span>
            <span className="text-[10px] font-mono font-bold text-slate-400">PDF SOURCE</span>
          </div>

        </div>

        {/* Right Side: Tabbed deeper insights layouts */}
        <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
          <div>
            
            {/* Tab Controller headers */}
            <div className="flex items-center border-b border-slate-100 pb-3 gap-6 mb-6">
              {[
                { id: 'RAW_TEXT', label: '1. Raw Extracted Source Text' },
                { id: 'PROFILE_MODULES', label: '2. Extracted Sections & Citations' },
                { id: 'MATCH_DEEP_DIVE', label: '3. Screening Audit Analysis' }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubTab(sub.id as any)}
                  className={`text-xs font-bold tracking-tight pb-3 border-b-2 transition-all cursor-pointer ${
                    activeSubTab === sub.id 
                      ? 'border-indigo-600 text-indigo-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* View Tab 1: Match Deep Dive consisting of strengths suggestions */}
            {activeSubTab === 'MATCH_DEEP_DIVE' && (
              <div className="space-y-6 animate-fade-in text-left">
                
                {/* ATS Score Transparency Breakdown Section */}
                <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-indigo-650" />
                      <h3 className="text-xs font-extrabold text-indigo-950 uppercase font-display tracking-tight">
                        ATS Score Transparency Breakdown
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono bg-indigo-105 text-indigo-700 font-bold px-2.5 py-0.5 rounded shadow-sm">
                      Strict Weighted Model
                    </span>
                  </div>

                  {/* Formula Breakdown Block */}
                  <div className="p-3.5 rounded-xl bg-white border border-indigo-50 text-xs space-y-2">
                    <div className="font-bold text-slate-700">Final Score Calculation Formula:</div>
                    <div className="font-mono text-[10px] bg-slate-50 p-2.5 rounded border border-slate-100 text-indigo-700 leading-relaxed overflow-x-auto">
                      ATS Score = (Skills Match * 40%) + (Keywords Match * 30%) + (Experience Match * 20%) + (Education Match * 10%)
                    </div>
                    <div className="font-mono text-[10.5px] text-slate-500 pt-1 leading-relaxed">
                      Calculated as: ({analysis.skillsMatch} * 0.40) + ({analysis.keywordMatch} * 0.30) + ({analysis.experienceMatch} * 0.20) + ({analysis.educationMatch} * 0.10) = <strong className="text-indigo-600 font-bold">{analysis.atsScore}%</strong>
                    </div>
                  </div>

                  {/* Score Factors Detail Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Skills Match Details */}
                    <div className="bg-white rounded-xl p-4 border border-indigo-50 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-slate-800">Skills Alignment (40%)</span>
                          <span className="text-xs font-mono font-extrabold text-indigo-600">{analysis.skillsMatch}/100</span>
                        </div>
                        
                        <div className="space-y-2.5 mt-2.5">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase block">Matched Required Skills ({matchedSkillsList.length})</span>
                            {matchedSkillsList.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {matchedSkillsList.map(skill => (
                                  <span key={skill} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] rounded font-medium">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic block mt-0.5">No direct required skills matched.</span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] font-mono font-bold text-rose-500 uppercase block">Missing Required Skills ({missingSkillsList.length})</span>
                            {missingSkillsList.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {missingSkillsList.map(skill => (
                                  <span key={skill} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 text-[10px] rounded font-medium">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic block mt-0.5">No missing required skills! Outstanding coverage.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keywords Match Details */}
                    <div className="bg-white rounded-xl p-4 border border-indigo-50 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-slate-800">Keyword Density (30%)</span>
                          <span className="text-xs font-mono font-extrabold text-cyan-600">{analysis.keywordMatch}/100</span>
                        </div>
                        
                        <div className="space-y-2.5 mt-2.5">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase block">Matched Keywords ({matchedKeywordsList.length})</span>
                            {matchedKeywordsList.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {matchedKeywordsList.map(kw => (
                                  <span key={kw} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-100 text-[10px] rounded font-medium">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic block mt-0.5">No key terms matched.</span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Missing Key Terms ({missingKeywordsList.length})</span>
                            {missingKeywordsList.length > 0 ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {missingKeywordsList.map(kw => (
                                  <span key={kw} className="px-1.5 py-0.5 bg-slate-50 text-slate-500 border border-slate-200/60 text-[9.5px] rounded">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic block mt-0.5">No missing keywords!</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Experience Score Details */}
                    <div className="bg-white rounded-xl p-4 border border-indigo-50 space-y-2 text-left">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-800">Experience Score (20%)</span>
                        <span className="text-xs font-mono font-extrabold text-emerald-600">{analysis.experienceMatch}/100</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans pt-1">
                        Aligns candidate's tenure and career chronological milestones against the active job experience required level of <strong className="text-indigo-650">{activeJob?.experienceRequired || 'Not specified'}</strong>.
                      </p>
                    </div>

                    {/* Education Score Details */}
                    <div className="bg-white rounded-xl p-4 border border-indigo-50 space-y-2 text-left">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-800">Education Score (10%)</span>
                        <span className="text-xs font-mono font-extrabold text-amber-600">{analysis.educationMatch}/100</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-sans pt-1">
                        Grades academic degrees, university credentials, or technical certifications in computer science, design, or engineering fields.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Strengths Blocks */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase font-display flex items-center gap-1.5 select-none"><ThumbsUp className="w-4.5 h-4.5 text-emerald-500" /> Key Candidate Strengths</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.strengths.map((str, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-800 leading-relaxed">
                        {str}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weaknesses and missing skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Missing Skills list */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase font-display flex items-center gap-1.5"><AlertTriangle className="w-4.5 h-4.5 text-indigo-505" /> Detected Skills Gaps</h3>
                    {analysis.missingSkills.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-550 italic">
                        No missing skills! Outstanding match with requirements profile.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.missingSkills.map((sk) => (
                          <span key={sk} className="text-xs font-bold px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl font-sans inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Areas of Weakness */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase font-display flex items-center gap-1.5"><ThumbsDown className="w-4.5 h-4.5 text-rose-500" /> Areas of Conflict / Risk</h3>
                    <div className="space-y-2">
                      {analysis.weaknesses.map((wk, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 text-xs text-slate-600 leading-relaxed">
                          {wk}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Improvement suggestions */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase font-display flex items-center gap-1.5"><Lightbulb className="w-4.5 h-4.5 text-amber-500" /> Actionable Vetting & Improvement Tips</h3>
                  <div className="space-y-2">
                    {analysis.improvementSuggestions.map((sug, idx) => (
                      <div key={idx} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed items-start">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px] shrink-0 flex items-center justify-center mt-0.5">{idx + 1}</span>
                        <div>{sug}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* View Tab 2: Profile Nodes extracted elements */}
            {activeSubTab === 'PROFILE_MODULES' && (
              <div className="space-y-6 animate-fade-in text-xs text-slate-600">
                
                {/* Professional Summary */}
                {analysis.summary && analysis.summary.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-850 uppercase font-display flex items-center gap-1.5"><FileText className="w-4.5 h-4.5 text-indigo-500" /> Professional Summary</h3>
                    <div className="p-3.5 bg-indigo-50/30 border border-indigo-100/40 rounded-2xl text-slate-700 leading-relaxed font-sans space-y-1.5">
                      {analysis.summary.map((sumLine, idx) => (
                        <p key={`s-${idx}`}>{sumLine}</p>
                      ))}
                      {analysis.summaryCitations && analysis.summaryCitations[0] && (
                        <div className="text-[10px] font-mono text-indigo-600 bg-indigo-50/60 p-1.5 rounded-lg border border-indigo-100/40 mt-2">
                          📝 Summary Origin: "{analysis.summaryCitations[0].replace(/^Matched Professional Summary in line:\s*/, '')}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Experience History Timeline */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-850 uppercase font-display flex items-center gap-1.5"><Briefcase className="w-4.5 h-4.5 text-slate-400" /> Work History Milestones</h3>
                  <div className="space-y-3">
                    {analysis.experience.length === 0 ? (
                      <div className="p-3 bg-slate-50 border border-dashed border-slate-250 rounded-2xl text-slate-450 italic">
                        No work history items were flagged in the resume.
                      </div>
                    ) : (
                      analysis.experience.map((exp, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl block relative space-y-2">
                          <div className="font-semibold text-slate-800">{exp}</div>
                          {analysis.experienceCitations && analysis.experienceCitations[idx] && (
                            <div className="text-[10.5px] font-mono text-indigo-700 bg-indigo-50/70 p-2 rounded-xl border border-indigo-100/40">
                              🔎 Source Match: "{analysis.experienceCitations[idx].replace(/^Matched work experience record in line:\s*/, '')}"
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Skills sets section: Technical & soft */}
                {(() => {
                  const { categorized } = cleanAndCategorizeSkills(analysis.skills, analysis.softSkills);
                  const hasTechSkills = (Object.keys(categorized) as Array<keyof typeof categorized>)
                    .some(cat => cat !== 'Soft Skills' && categorized[cat].length > 0);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-850 uppercase font-display flex items-center gap-1.5">
                          <Layers className="w-4.5 h-4.5 text-slate-400" /> Technical Competence Inventory
                        </h3>
                        <div className="space-y-4">
                          {hasTechSkills ? (
                            (Object.keys(categorized) as Array<keyof typeof categorized>)
                              .filter(category => category !== 'Soft Skills' && categorized[category].length > 0)
                              .map(category => (
                                <div key={category} className="space-y-1.5">
                                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                                    {category}
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {categorized[category].map(sk => (
                                      <span key={sk} className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg">
                                        {sk}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-xs text-slate-400 italic">No technical skills detected.</div>
                          )}

                          {analysis.skillsCitations && analysis.skillsCitations.length > 0 && (
                            <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100/50 space-y-1 mt-4">
                              <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest block mb-1">Skills Proof Citations</span>
                              <div className="max-h-[120px] overflow-y-auto space-y-1">
                                {analysis.skillsCitations.map((cit, cidx) => (
                                  <div key={cidx} className="text-[10px] font-mono text-slate-600 leading-normal">
                                    • {cit}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-850 uppercase font-display flex items-center gap-1.5">
                          <Compass className="w-4.5 h-4.5 text-emerald-500" /> Evaluated Soft Attributes
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {categorized['Soft Skills'].length > 0 ? (
                            categorized['Soft Skills'].map((sk) => (
                              <span key={sk} className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-100/30">
                                {sk}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No soft skills highlighted.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Education, Projects & Certifications grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Academics */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-850 uppercase font-display flex items-center gap-1.5"><GraduationCap className="w-4.5 h-4.5 text-slate-405" /> Extracted Academic Credentials</h3>
                    <div className="space-y-2">
                      {analysis.education.length === 0 ? (
                        <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 italic">
                          No academic information detected.
                        </div>
                      ) : (
                        analysis.education.map((ed, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                            <div className="font-semibold text-slate-800">{ed}</div>
                            {analysis.educationCitations && analysis.educationCitations[idx] && (
                              <div className="text-[10.5px] font-mono text-slate-500 bg-slate-100 p-1.5 rounded-lg border border-slate-200/50">
                                🎓 Match: "{analysis.educationCitations[idx].replace(/^Matched academic credential in line:\s*/, '')}"
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Certifications and Projects */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-850 uppercase font-display flex items-center gap-1.5"><FolderGit2 className="w-4.5 h-4.5 text-slate-455" /> Projects & Certifications</h3>
                    <div className="space-y-2">
                      {analysis.projects.length === 0 && analysis.certifications.length === 0 && (
                        <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 italic">
                          No distinct projects or credentials verified.
                        </div>
                      )}
                      
                      {analysis.projects.map((proj, idx) => (
                        <div key={`p-${idx}`} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                          <div className="font-medium text-slate-800">📁 Project: {proj}</div>
                          {analysis.projectsCitations && analysis.projectsCitations[idx] && (
                            <div className="text-[10.5px] font-mono text-slate-500 bg-slate-100 p-1.5 rounded-lg">
                              📂 Match: "{analysis.projectsCitations[idx].replace(/^Matched project profile in line:\s*/, '')}"
                            </div>
                          )}
                        </div>
                      ))}

                      {analysis.certifications.map((cert, idx) => (
                        <div key={`c-${idx}`} className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl space-y-1.5 text-amber-900">
                          <div className="font-medium">🏆 Certificate: {cert}</div>
                          {analysis.certificationsCitations && analysis.certificationsCitations[idx] && (
                            <div className="text-[10.5px] font-mono text-amber-700 bg-amber-100/30 p-1.5 rounded-lg border border-amber-200/30">
                              📜 Match: "{analysis.certificationsCitations[idx].replace(/^Matched professional certification in line:\s*/, '')}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* View Tab 3: Full Raw text source view with scroll box */}
            {activeSubTab === 'RAW_TEXT' && (
              <div className="space-y-4 animate-fade-in text-left">
                <div className="flex items-center justify-between text-xs text-slate-400 select-none">
                  <span>Scroll to review whole text extractions scanned from source attachments.</span>
                </div>
                <div className="max-h-[380px] overflow-y-auto p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {candidate.resumeText || 'No text content processed.'}
                </div>
              </div>
            )}

          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between select-none">
            <span className="text-[10px] text-slate-450 italic">AI evaluations are probabilistic and serve as decision support filters. Double check matches during technical interviews.</span>
            <span className="text-[10px] font-bold text-indigo-600">Active Job Target: {activeJob?.title}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
