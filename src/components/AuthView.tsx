import React, { useState } from 'react';
import { Mail, Lock, User, Briefcase, ChevronRight, Sparkles, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthViewProps {
  onAuthSuccess: (user: { email: string; name: string; token: string }) => void;
}

export default function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password } 
        : { name, email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please check inputs.');
      }

      // Success
      onAuthSuccess({
        email: data.user.email,
        name: data.user.name,
        token: data.token
      });
    } catch (err: any) {
      setError(err.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoRecruiter = () => {
    setEmail('recruiter@hightech.io');
    setPassword('demopass123');
    setName('Sarah Jenkins');
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-slate-900 overflow-hidden font-sans">
      {/* Visual branding column */}
      <div className="hidden lg:flex lg:col-span-7 bg-radial from-slate-800 to-slate-950 p-12 flex-col justify-between relative border-r border-slate-800/80">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 relative z-10 select-none">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/10 border border-indigo-400/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-white">TalentFlow</span>
            <span className="text-[10px] block font-mono text-cyan-400 tracking-wider">ENTERPRISE ATS</span>
          </div>
        </div>

        {/* Dynamic visual hook */}
        <div className="relative z-10 max-w-xl pr-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/80 text-xs font-medium text-indigo-300 mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Powered by Gemini 3.5 Flash
          </div>
          <h1 className="text-4xl xl:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15]">
            Screen talent in seconds, <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              not spreadsheets.
            </span>
          </h1>
          <p className="mt-4 text-slate-400 leading-relaxed max-w-lg">
            An intelligent Applicant Tracking System (ATS) optimizing recruit workflows. Automatically score resumes against job requirements with case-insensitive synonym mapping and education/experience insights.
          </p>

          {/* Testimonial preview */}
          <div className="mt-12 p-5 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm max-w-md">
            <p className="text-sm italic text-slate-300">
              "We slashed our resume screening cycle by 80%. The contextual similarity scorer is remarkably precise at understanding skills synonym alignment."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                M
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Marcus Sterling</div>
                <div className="text-[10px] text-slate-500">VP of Talent, CloudNative Innovations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="text-xs text-slate-500 relative z-10">
          © 2026 TalentFlow Technologies Inc. All rights reserved. Secure Cloud Storage.
        </div>
      </div>

      {/* Auth Form Column */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 md:p-12 bg-slate-950 relative">
        <div className="absolute inset-y-0 right-0 w-80 bg-indigo-500/10 blur-[120px] rounded-full -mr-40 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-80 bg-cyan-500/5 blur-[120px] rounded-full -ml-40 pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo overlay for mobile viewports */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-lg text-white">TalentFlow ATS</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-display font-extrabold text-white tracking-tight shadow-sm">
              {isLogin ? 'Sign in to Recruitment Suite' : 'Create Recruitment Workspace'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {isLogin 
                ? 'Manage active candidates, parse skill gaps, and explore insights.' 
                : 'Get started and access our candidate ranking suite instantly.'}
            </p>
          </div>

          {/* Core Submit Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-left animate-pulse">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1 text-left">
                <label className="text-xs text-slate-400 font-medium">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-xs text-slate-300 font-medium">Work Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-300 font-medium font-sans">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium text-sm rounded-xl transition-all shadow-lg active:scale-[0.98] select-none flex items-center justify-center gap-2 border border-indigo-500/20 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In to Dashboard' : 'Create Recruiter Account'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sandbox seed demo helper button */}
          <div className="mt-6 border-t border-slate-800/85 pt-6 text-center">
            <p className="text-xs text-slate-500 mb-2">Want to try TalentFlow with our pre-seeded recruiter credentials?</p>
            <button
              type="button"
              onClick={fillDemoRecruiter}
              className="px-4 py-1.5 rounded-full text-xs font-mono bg-slate-900 border border-slate-850 text-indigo-400 hover:text-indigo-300 hover:border-slate-700 transition-all inline-flex items-center gap-1.5 select-none hover:bg-slate-800/40 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Auto-fill Demo Credentials
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-slate-500">
            {isLogin ? (
              <p>
                Don't have an enterprise account?{' '}
                <button
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Log In instead
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
