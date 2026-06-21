import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  MapPin, 
  Briefcase, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Edit2, 
  Check, 
  X,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { JobDescription } from '../types';

interface JobsViewProps {
  jobs: JobDescription[];
  activeJobId: string;
  onSetActiveJob: (id: string) => void;
  onAddJob: (job: JobDescription) => void;
  onUpdateJob: (job: JobDescription) => void;
  onDeleteJob: (id: string) => void;
}

export default function JobsView({ 
  jobs, 
  activeJobId, 
  onSetActiveJob, 
  onAddJob, 
  onUpdateJob, 
  onDeleteJob 
}: JobsViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDescription | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote'>('Full-time');
  const [experienceRequired, setExperienceRequired] = useState('3+ years');
  const [description, setDescription] = useState('');
  const [keySkillsString, setKeySkillsString] = useState('');
  const [requirementsString, setRequirementsString] = useState('');
  const [error, setError] = useState('');

  // Stateful confirmations & toasts
  const [jobToDelete, setJobToDelete] = useState<{ id: string; title: string } | null>(null);
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

  const resetForm = () => {
    setTitle('');
    setDepartment('');
    setLocation('');
    setType('Full-time');
    setExperienceRequired('3+ years');
    setDescription('');
    setKeySkillsString('');
    setRequirementsString('');
    setError('');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !department || !location || !description) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      const savedRecruiter = localStorage.getItem('talentflow_recruiter');
      let token = '';
      if (savedRecruiter) {
        try {
          token = JSON.parse(savedRecruiter).token || '';
        } catch {}
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          department,
          location,
          type,
          experienceRequired,
          description,
          keySkills: keySkillsString,
          requirements: requirementsString
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job.');
      }

      onAddJob(data);
      setIsCreating(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    }
  };

  const startEdit = (job: JobDescription) => {
    setEditingJob(job);
    setTitle(job.title);
    setDepartment(job.department);
    setLocation(job.location);
    setType(job.type);
    setExperienceRequired(job.experienceRequired);
    setDescription(job.description);
    setKeySkillsString(job.keySkills.join(', '));
    setRequirementsString(job.requirements.join('\n'));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    setError('');
    try {
      const savedRecruiter = localStorage.getItem('talentflow_recruiter');
      let token = '';
      if (savedRecruiter) {
        try {
          token = JSON.parse(savedRecruiter).token || '';
        } catch {}
      }

      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          department,
          location,
          type,
          experienceRequired,
          description,
          keySkills: keySkillsString,
          requirements: requirementsString
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update job.');
      }

      onUpdateJob(data);
      setEditingJob(null);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    }
  };

  const handleDelete = (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (job) {
      setJobToDelete({ id: job.id, title: job.title });
    }
  };

  const handleConfirmDelete = async (id: string) => {
    setJobToDelete(null);
    try {
      const savedRecruiter = localStorage.getItem('talentflow_recruiter');
      let token = '';
      if (savedRecruiter) {
        try {
          token = JSON.parse(savedRecruiter).token || '';
        } catch {}
      }

      const response = await fetch(`/api/jobs/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete job.');
      
      onDeleteJob(id);
      displaySuccess('Job description deleted successfully.');
    } catch (err: any) {
      displayError(err.message || 'Failed to delete job.');
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
      {jobToDelete && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-205/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2"><Trash2 className="w-4.5 h-4.5 text-rose-500" /> Confirm Deletion</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete the job description for <strong className="text-slate-800 font-bold">{jobToDelete.title}</strong>? Any linked candidates will no longer compile rankings relative to it.
            </p>
            <div className="flex items-center gap-2.5 justify-end pt-2">
              <button 
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleConfirmDelete(jobToDelete.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header section with toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
            Job Descriptions
          </h2>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            Create, manage and activate standard requirements to parse applicant resumes against.
          </p>
        </div>
        {!isCreating && !editingJob && (
          <button
            onClick={() => { resetForm(); setIsCreating(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 select-none self-start cursor-pointer border border-indigo-550/10"
          >
            <Plus className="w-4 h-4" /> Create Job Description
          </button>
        )}
      </div>

      {/* Forms area if editing/creating */}
      {(isCreating || editingJob) && (
        <form onSubmit={isCreating ? handleCreateSubmit : handleEditSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 max-w-4xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-505" /> {isCreating ? 'Create Job Mandate' : `Edit Content: ${editingJob?.title}`}
            </h3>
            <button
              type="button"
              onClick={() => { setIsCreating(false); setEditingJob(null); resetForm(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Job Title <span className="text-indigo-500">*</span></label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Staff Backend Architect"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Department <span className="text-indigo-500">*</span></label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Engineering, Marketing, Product"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Office Location <span className="text-indigo-500">*</span></label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA or Remote"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Experience Threshold</label>
              <input
                type="text"
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(e.target.value)}
                placeholder="e.g., 5+ years"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Employment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Key Required Skills <span className="text-slate-400 font-normal">(Comma separated lists)</span></label>
              <input
                type="text"
                value={keySkillsString}
                onChange={(e) => setKeySkillsString(e.target.value)}
                placeholder="e.g., React, Node.js, Express, Docker"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Job Summary Description <span className="text-indigo-500">*</span></label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a precise overview regarding daily obligations..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Core Requirements & Responsibilities <span className="text-slate-400 font-normal">(One requirement statement per line)</span></label>
            <textarea
              rows={4}
              value={requirementsString}
              onChange={(e) => setRequirementsString(e.target.value)}
              placeholder="e.g. Over 5 years of software engineering in enterprise web spaces..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setIsCreating(false); setEditingJob(null); resetForm(); }}
              className="px-4 py-2 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer border border-indigo-550/10"
            >
              {isCreating ? 'Generate Job' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Grid displays of jobs */}
      {!isCreating && !editingJob && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const isActive = job.id === activeJobId;
            return (
              <div 
                key={job.id}
                className={`flex flex-col justify-between bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative group ${
                  isActive 
                    ? 'border-indigo-500 ring-4 ring-indigo-500/5' 
                    : 'border-slate-200/80 hover:border-slate-350'
                }`}
              >
                {/* Active Indicator Pin */}
                {isActive && (
                  <span className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-15 shadow-sm font-sans flex items-center gap-0.5 animate-pulse">
                    <Check className="w-3 h-3 text-white" /> ACTIVE TARGET
                  </span>
                )}

                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 font-bold mb-1">
                    {job.department}
                  </div>
                  <h3 className="font-display font-bold text-slate-800 text-base leading-tight group-hover:text-indigo-600 transition-colors">
                    {job.title}
                  </h3>

                  {/* Badges details grid */}
                  <div className="flex flex-wrap gap-2.5 mt-3 text-[10.5px] font-sans font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {job.type}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.experienceRequired}
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs mt-3.5 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Required Skills Tag Badges */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-[10px] uppercase font-mono text-slate-400 font-bold mb-2">TARGET SKILLS PROFILE</h4>
                    <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-hidden">
                      {job.keySkills.map((sk) => (
                        <span key={sk} className="text-[9.5px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-sans">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(job)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-all cursor-pointer border border-slate-200/40"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-lg transition-all cursor-pointer border border-rose-200/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => onSetActiveJob(job.id)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Activate Match <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
