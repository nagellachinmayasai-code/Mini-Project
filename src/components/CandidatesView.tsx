import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  ChevronRight, 
  Award, 
  ArrowUpDown, 
  CheckCircle,
  XCircle,
  Clock,
  User,
  Filter,
  Check
} from 'lucide-react';
import { Candidate, JobDescription } from '../types';

interface CandidatesViewProps {
  candidates: Candidate[];
  jobs: JobDescription[];
  onViewCandidate: (id: string) => void;
  onUpdateStatus: (id: string, status: Candidate['status']) => void;
  onDeleteCandidate: (id: string) => void;
}

export default function CandidatesView({ 
  candidates, 
  jobs, 
  onViewCandidate,
  onUpdateStatus,
  onDeleteCandidate 
}: CandidatesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'SCORE_DESC' | 'DATE_DESC' | 'ALPHABETICAL'>('SCORE_DESC');

  // Custom modal & notification trackers
  const [candidateToDelete, setCandidateToDelete] = useState<{ id: string; name: string } | null>(null);
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

  // Trigger status updates on the server
  const handleStatusChange = async (id: string, newStatus: Candidate['status']) => {
    try {
      const savedRecruiter = localStorage.getItem('talentflow_recruiter');
      let token = '';
      if (savedRecruiter) {
        try {
          token = JSON.parse(savedRecruiter).token || '';
        } catch {}
      }

      const response = await fetch(`/api/candidates/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status.');
      const data = await response.json();
      onUpdateStatus(id, data.status);
      displaySuccess(`Candidate status updated to ${newStatus}.`);
    } catch (err: any) {
      displayError(err.message || 'Error occurred updating status.');
    }
  };

  const handleDelete = (id: string) => {
    const candidate = candidates.find(c => c.id === id);
    if (candidate) {
      setCandidateToDelete({ id: candidate.id, name: candidate.name });
    }
  };

  const handleConfirmDelete = async (id: string) => {
    setCandidateToDelete(null);
    try {
      const savedRecruiter = localStorage.getItem('talentflow_recruiter');
      let token = '';
      if (savedRecruiter) {
        try {
          token = JSON.parse(savedRecruiter).token || '';
        } catch {}
      }

      const response = await fetch(`/api/candidates/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete candidate.');
      onDeleteCandidate(id);
      displaySuccess('Candidate record deleted successfully from the talent pool.');
    } catch (err: any) {
      displayError(err.message || 'Failed to delete candidate.');
    }
  };

  // Filter and sort computation
  const filteredCandidates = candidates
    .filter((c) => {
      const job = jobs.find((j) => j.id === c.activeJobId);
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.analysis.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = selectedStatus === 'ALL' || c.status.toUpperCase() === selectedStatus;
      const matchesScore = c.analysis.atsScore >= minScore;
      
      return matchesSearch && matchesStatus && matchesScore;
    })
    .sort((a, b) => {
      if (sortBy === 'SCORE_DESC') {
        return b.analysis.atsScore - a.analysis.atsScore;
      } else if (sortBy === 'DATE_DESC') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  const getStatusBadge = (status: Candidate['status']) => {
    switch (status) {
      case 'Shortlisted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full select-none">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Shortlisted
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-rose-700 bg-rose-50 rounded-full select-none">
            <XCircle className="w-3.5 h-3.5 text-rose-500" /> Rejected
          </span>
        );
      case 'Screened':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-full select-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-505" /> Screened
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-600 bg-slate-100 rounded-full select-none">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> New
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans animate-fade-in text-left relative">
      
      {/* Toast notifications */}
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

      {/* Confirmation dialog overlay */}
      {candidateToDelete && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-205/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2"><Trash2 className="w-4.5 h-4.5 text-rose-500" /> Confirm Deletion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete candidate <strong className="text-slate-800 font-bold">{candidateToDelete.name}</strong> from the enterprise talent pool? Dashboard metrics, score distribution charts, and rankings will recalculate automatically.
            </p>
            <div className="flex items-center gap-2.5 justify-end pt-2">
              <button 
                onClick={() => setCandidateToDelete(null)}
                className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleConfirmDelete(candidateToDelete.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Title block */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight leading-none font-sans">
          Talent Pool Management
        </h2>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
          Filter, triage, and evaluate parsed candidate profiles. Pivot rankings by score alignments and upload timelines.
        </p>
      </div>

      {/* Filter and Controls Header Panel */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-5">
        
        {/* Row 1: Search & sorting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by candidate name, target job, or specific technology skill..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort by
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="SCORE_DESC">Highest ATS Score</option>
              <option value="DATE_DESC">Recent Uploaded</option>
              <option value="ALPHABETICAL">Candidate Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Row 2: Score filter slider and status tags */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-slate-100">
          
          {/* Status filter buttons */}
          <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-450 font-bold tracking-tight mr-2 uppercase flex items-center gap-1"><Filter className="w-3 h-3 text-slate-500" /> VETTING STAGE</span>
            {['ALL', 'NEW', 'SCREENED', 'SHORTLISTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none cursor-pointer ${
                  selectedStatus === st 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* ATS Threshold Slide Bar */}
          <div className="lg:col-span-5 flex items-center gap-4">
            <span className="text-xs text-slate-450 font-bold tracking-tight shrink-0 uppercase">MIN ATS SCORE: <span className="text-indigo-600 font-extrabold">{minScore}%</span></span>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* Grid listing of processed candidates */}
      {filteredCandidates.length === 0 ? (
        <div className="py-16 bg-white border border-slate-200/60 rounded-3xl text-center space-y-4 max-w-4xl">
          <SlidersHorizontal className="w-12 h-12 text-slate-300 stroke-1 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 font-display">No candidates fit filtering standards</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Try lowering your Minimum ATS Score threshold or broadening your textual search scope to capture credentials.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedStatus('ALL'); setMinScore(0); }}
            className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 text-xs font-bold select-none hover:bg-indigo-100 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((c) => {
            const job = jobs.find(j => j.id === c.activeJobId);
            return (
              <div 
                key={c.id}
                className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 flex flex-col justify-between group transition-all"
              >
                <div>
                  
                  {/* Card head: Avatar identity & ATS score Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/50 text-indigo-700 flex items-center justify-center font-display font-semibold text-xs shrink-0 select-none">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate font-display group-hover:text-indigo-600 transition-all leading-none">
                          {c.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 block mt-1 truncate">{c.email}</span>
                      </div>
                    </div>

                    {/* Highly stylized circular profile match scoring tag */}
                    <div className="shrink-0 pl-1 text-center flex flex-col items-end gap-1">
                      <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-0.5 ${
                        c.analysis.atsScore >= 80 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : c.analysis.atsScore >= 60 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                            : 'bg-slate-50 text-slate-600 border border-slate-200/50'
                      }`}>
                        {c.analysis.atsScore}%
                      </div>
                      {c.isLocalFallback && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-250 rounded-md uppercase tracking-tight" title="Parsed locally due to API unavailability">
                          Local
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Target Position and upload schedule */}
                  <div className="mt-5 space-y-1">
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400 block leading-none">TARGET POSITION</span>
                    <h5 className="text-xs font-bold text-slate-700 truncate font-sans">{job?.title || 'Unknown Role Designation'}</h5>
                  </div>

                  {/* Detected key Skills list */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h6 className="text-[9.5px] uppercase font-mono tracking-wider font-bold text-slate-400 mb-2">DETECTED SKILLS MAP</h6>
                    <div className="flex flex-wrap gap-1 max-h-[58px] overflow-hidden">
                      {c.analysis.skills.slice(0, 5).map((sk) => (
                        <span key={sk} className="text-[9px] font-bold px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-md font-sans">
                          {sk}
                        </span>
                      ))}
                      {c.analysis.skills.length > 5 && (
                        <span className="text-[9px] font-mono text-slate-405 self-center pl-1 font-bold">
                          +{c.analysis.skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Foot: Vetting Controls and Inspect Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  
                  {/* Triage buttons to trigger status changes right there */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStatusChange(c.id, 'Shortlisted')}
                      title="Shortlist applicant"
                      className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                        c.status === 'Shortlisted' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                          : 'bg-white border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-450'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(c.id, 'Rejected')}
                      title="Reject applicant"
                      className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                        c.status === 'Rejected' 
                          ? 'bg-rose-50 border-rose-250 text-rose-600' 
                          : 'bg-white border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-250 text-slate-455'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Remove candidate tracing"
                      className="p-1.5 rounded-lg bg-white hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 text-slate-400 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Deep view report */}
                  <button
                    onClick={() => onViewCandidate(c.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-750 transition-all flex items-center gap-0.5 shrink-0 cursor-pointer"
                  >
                    Inspect Report <ChevronRight className="w-4 h-4" />
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
