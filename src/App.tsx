import React, { useState, useEffect } from 'react';
import './index.css';
import { JobDescription, Candidate } from './types';
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import JobsView from './components/JobsView';
import UploadView from './components/UploadView';
import CandidatesView from './components/CandidatesView';
import CandidateAnalysisView from './components/CandidateAnalysisView';
import AnalyticsView from './components/AnalyticsView';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<{ name: string; email: string; token: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  
  // Database states
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activeJobId, setActiveJobId] = useState<string>('');
  
  // Loading & error trackers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check custom local storage on mount to authorize returning recruiters
  useEffect(() => {
    const savedUser = localStorage.getItem('talentflow_recruiter');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('talentflow_recruiter');
      }
    }
  }, []);

  // Hydrate lists from Express API DB
  useEffect(() => {
    if (!user) return;

    const fetchDataset = async () => {
      setLoading(true);
      setError('');
      try {
        const [jobsRes, candidatesRes] = await Promise.all([
          fetch('/api/jobs', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          }),
          fetch('/api/candidates', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          })
        ]);

        if (!jobsRes.ok || !candidatesRes.ok) {
          throw new Error('Database connection failed. Please restart development services.');
        }

        const jobsData = await jobsRes.json();
        const candidatesData = await candidatesRes.json();

        setJobs(jobsData);
        setCandidates(candidatesData);

        // Auto-select first active job as comparator
        if (jobsData.length > 0) {
          setActiveJobId(jobsData[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Error occurred while loading recruitment datasets.');
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  }, [user]);

  const handleAuthSuccess = (recruiter: { email: string; name: string; token: string }) => {
    setUser(recruiter);
    localStorage.setItem('talentflow_recruiter', JSON.stringify(recruiter));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('talentflow_recruiter');
    setActiveTab('dashboard');
    setSelectedCandidateId('');
  };

  // State manipulation triggers (syncing client state with server modifications)
  const handleAddJob = (newJob: JobDescription) => {
    setJobs(prev => [newJob, ...prev]);
    // Optionally set as active target immediately
    setActiveJobId(newJob.id);
  };

  const handleUpdateJob = (updatedJob: JobDescription) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const handleDeleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    // Re-triage active job selection
    setJobs(current => {
      if (current.length > 0) {
        setActiveJobId(current[0].id);
      } else {
        setActiveJobId('');
      }
      return current;
    });
  };

  const handleUploadSuccess = (newCandidate: Candidate) => {
    setCandidates(prev => [newCandidate, ...prev]);
    // Instant drill-down to Candidate deep dive analysis!
    setSelectedCandidateId(newCandidate.id);
    setActiveTab('candidate-analysis');
  };

  const handleUpdateStatus = (id: string, newStatus: Candidate['status']) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const handleDeleteCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
    if (selectedCandidateId === id) {
      setSelectedCandidateId('');
      setActiveTab('candidates');
    }
  };

  const handleViewCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setActiveTab('candidate-analysis');
  };

  // Login Gate
  if (!user) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans space-y-4 select-none">
        <div className="p-4 bg-white border border-slate-200/80 rounded-3xl shadow-sm text-center max-w-sm space-y-4">
          <div className="relative w-12 h-12 mx-auto">
            <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin" />
          </div>
          <h3 className="text-sm font-bold text-slate-850 font-display">Initializing Workspace...</h3>
          <p className="text-xs text-slate-400">Syncing active job mandates and candidate portfolios from database store.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab === 'candidate-analysis' ? 'candidates' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCandidateId('');
        }}
        user={user}
        onLogout={handleLogout}
        jobs={jobs}
        activeJobId={activeJobId}
        setActiveJobId={setActiveJobId}
      />

      {/* Main viewport Container */}
      <main className="flex-1 overflow-y-auto h-screen relative bg-slate-50 px-6 py-8 md:px-10">
        
        {/* Connection/error header alert banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <span className="font-bold block">Datastore Sync Conflict</span>
              <span className="text-rose-600 block">{error}</span>
            </div>
          </div>
        )}

        {/* Dynamic page routers */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            candidates={candidates}
            jobs={jobs}
            activeJobId={activeJobId}
            onNavigateToTab={setActiveTab}
            onViewCandidate={handleViewCandidate}
            user={user}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsView 
            jobs={jobs}
            activeJobId={activeJobId}
            onSetActiveJob={setActiveJobId}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
          />
        )}

        {activeTab === 'upload' && (
          <UploadView 
            jobs={jobs}
            activeJobId={activeJobId}
            onUploadSuccess={handleUploadSuccess}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'candidates' && (
          <CandidatesView 
            candidates={candidates}
            jobs={jobs}
            onViewCandidate={handleViewCandidate}
            onUpdateStatus={handleUpdateStatus}
            onDeleteCandidate={handleDeleteCandidate}
          />
        )}

        {activeTab === 'candidate-analysis' && selectedCandidateId && (
          <CandidateAnalysisView 
            candidateId={selectedCandidateId}
            candidates={candidates}
            jobs={jobs}
            onBackToList={() => {
              setActiveTab('candidates');
              setSelectedCandidateId('');
            }}
            onUpdateStatus={handleUpdateStatus}
            onDeleteCandidate={handleDeleteCandidate}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView 
            candidates={candidates}
            jobs={jobs}
            activeJobId={activeJobId}
          />
        )}

      </main>
    </div>
  );
}
