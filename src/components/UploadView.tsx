import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  Bookmark,
  ChevronRight,
  FileText
} from 'lucide-react';
import { JobDescription, Candidate } from '../types';

interface UploadViewProps {
  jobs: JobDescription[];
  activeJobId: string;
  onUploadSuccess: (candidate: Candidate) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function UploadView({ 
  jobs, 
  activeJobId, 
  onUploadSuccess,
  onNavigateToTab
}: UploadViewProps) {
  const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [isPasting, setIsPasting] = useState(false);
  
  // Progress & feedback states
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf') {
      setError('Please upload a PDF resume.');
      return;
    }
    setFile(selectedFile);
    setIsPasting(false);
  };

  // Convert PDF or other file to Base64 in standard format
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const resultString = reader.result as string;
        // Strip out metadata prefix (e.g. "data:application/pdf;base64,")
        const base64 = resultString.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleParseSubmit = async () => {
    if (!file && !rawText.trim()) {
      setError('Please provide a resume file or paste plain text.');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(15);
    setStatusMessage('Reading upload assets...');

    try {
      let body: any = {
        jobId: activeJobId,
        fileName: file ? file.name : 'pasted_resume_text.txt',
      };

      if (file) {
        setStatusMessage('Processing PDF structure...');
        setProgress(35);
        const base64Data = await getBase64(file);
        body.base64File = base64Data;
        body.fileMimeType = 'application/pdf';
      } else {
        setStatusMessage('Extracting pasted rich-text clipboard...');
        setProgress(35);
        body.fallbackText = rawText;
      }

      setStatusMessage('Queuing analysis to Gemini 3.5 Flash inside sandbox...');
      setProgress(55);

      const savedRecruiter = localStorage.getItem('talentflow_recruiter');
      let token = '';
      if (savedRecruiter) {
        try {
          token = JSON.parse(savedRecruiter).token || '';
        } catch {}
      }

      // Trigger server-side analysis
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      setProgress(85);
      setStatusMessage('Synchronizing scoring matrices in local db...');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Cognitive parsing failed. Verify your Gemini secret configuration.');
      }

      setProgress(100);
      setStatusMessage('Applicant screened successfully!');
      
      setTimeout(() => {
        onUploadSuccess(data);
      }, 700);

    } catch (err: any) {
      setError(err.message || 'Error occurred during AI analysis pipeline.');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans animate-fade-in text-left">
      
      {/* Page Title & context */}
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight leading-none">
          Screen & Audit Candidates
        </h2>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
          Upload resume files or copy-paste text profile portfolios to trigger instant grading weights matching against critical needs.
        </p>
      </div>

      {/* Target active job alert indicator */}
      {activeJob ? (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4.5 max-w-3xl flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="p-2.5 rounded-xl bg-white text-indigo-600 border border-indigo-100/60 shrink-0">
              <Bookmark className="w-5 h-5 text-indigo-600" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-mono tracking-wider text-indigo-600 font-extrabold block">ACTIVE RECRUIT MATCHING TARGET</span>
              <h4 className="text-xs font-bold text-slate-850 truncate font-display">{activeJob.title}</h4>
              <p className="text-[10.5px] text-slate-400 mt-0.5 max-w-lg truncate">
                Department: {activeJob.department} • Experience Required: {activeJob.experienceRequired}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('jobs')}
            className="px-3.5 py-1.5 shrink-0 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[10.5px] font-bold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer shadow-sm"
          >
            Change Active Job
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 max-w-3xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" /> No active job description found. Create one first!
        </div>
      )}

      {/* Main Upload Area Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl">

        <div className="lg:col-span-8 space-y-5">
          {error && (
            <div className="p-4 rounded-xl.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Parsing Failure</span>
                <span className="text-rose-600/90 leading-relaxed block mt-0.5">{error}</span>
              </div>
            </div>
          )}

          {/* Core Drop Zone Element */}
          {!isPasting ? (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer min-h-[280px] transition-all bg-white relative overflow-hidden group ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50/50' 
                  : 'border-slate-200 hover:border-indigo-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />

              <div className="p-4.5 bg-indigo-50 text-indigo-600 rounded-2xl mb-4 group-hover:scale-105 transition-all">
                <UploadCloud className="w-8 h-8" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-indigo-600 font-display flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Selected File: {file.name}
                  </h3>
                  <p className="text-[10.5px] text-slate-400">{(file.size / 1024).toFixed(1)} KB • Click to swap</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-800 font-display">Drag & Drop Resume</h3>
                  <p className="text-[10.5px] text-slate-400">Supports PDF files</p>
                  <p className="text-[10px] text-indigo-500 font-semibold pt-1">Or click to browse standard local directories</p>
                </div>
              )}
            </div>
          ) : (
            /* Plain Text Input Field alternative */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <label className="text-xs font-bold text-slate-700 font-sans flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-505" /> Copy & Paste Plain Text Portfolio
                </label>
                <button
                  type="button"
                  onClick={() => { setIsPasting(false); setRawText(''); }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Upload File instead
                </button>
              </div>
              <textarea
                rows={10}
                required
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste whole resume texts here (contacts, education, skills, work experience lists) to analyze..."
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white font-sans"
              />
            </div>
          )}

          {/* Form Core Action button trigger */}
          <div className="flex items-center justify-between">
            {!isPasting ? (
              <button
                type="button"
                onClick={() => { setIsPasting(true); setFile(null); }}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 cursor-pointer text-left"
              >
                Or alternate: Paste plain text profile
              </button>
            ) : (
              <span className="text-xs text-slate-400">Plain text parser supports direct matching.</span>
            )}

            <button
              onClick={handleParseSubmit}
              disabled={uploading || (!file && !rawText.trim()) || !activeJob}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2 select-none border border-indigo-555"
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin" /> Screen Candidate
                </>
              ) : (
                <>
                  Analyze Match <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Progress Tracker Modal */}
          {uploading && (
            <div className="p-6 bg-slate-900 border border-slate-800 text-white rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> {statusMessage}
                </span>
                <span className="font-mono font-medium text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full transition-all duration-350"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">Please wait while Gemini processes the multimodal parser pipeline...</p>
            </div>
          )}
        </div>

        {/* Right side information box */}
        <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 font-display">Parsing Instructions</h3>
            
            <div className="space-y-3.5">
              <div className="flex items-start gap-2.5 text-xs text-slate-500">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <div>
                  <span className="font-bold text-slate-700 block">Select Target Requirements</span>
                  Select an active job position target in the global sidebar picker before screening.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-500">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <div>
                  <span className="font-bold text-slate-700 block">Provide Digital Files</span>
                  Supports PDF files or plain-text clipboard extractions.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-500">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <div>
                  <span className="font-bold text-slate-700 block">Evaluate Alignment</span>
                  Gemini matches skills synonym mapping, tenure required and issues transparent scoring breakdowns.
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <h4 className="text-[10px] font-mono tracking-wider font-bold text-slate-400 mb-1.5 uppercase">ATS WEIGHTING BREAKDOWN</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Skills Matching:</span>
                <span className="font-bold text-slate-800">40% value</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Keywords Presence:</span>
                <span className="font-bold text-slate-800">30% value</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Experience Alignment:</span>
                <span className="font-bold text-slate-800">20% value</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Education Alignments:</span>
                <span className="font-bold text-slate-800">10% value</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
