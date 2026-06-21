export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface JobDescription {
  id: string;
  recruiterId?: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  experienceRequired: string;
  status: 'Active' | 'Closed';
  description: string;
  keySkills: string[];
  requirements: string[];
  createdAt: string;
}

export interface MatchBreakdown {
  skills: number;
  keywords: number;
  experience: number;
  education: number;
}

export interface ResumeAnalysis {
  atsScore: number;
  skillsMatch: number;
  keywordMatch: number;
  experienceMatch: number;
  educationMatch: number;
  matchBreakdown: MatchBreakdown;
  skills: string[];
  education: string[];
  projects: string[];
  certifications: string[];
  experience: string[];
  softSkills: string[];
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  improvementSuggestions: string[];
  summary?: string[];
  skillsCitations?: string[];
  educationCitations?: string[];
  projectsCitations?: string[];
  certificationsCitations?: string[];
  experienceCitations?: string[];
  summaryCitations?: string[];
}

export interface Candidate {
  id: string;
  recruiterId?: string;
  name: string;
  email: string;
  phone?: string;
  activeJobId: string;
  status: 'New' | 'Screened' | 'Shortlisted' | 'Rejected';
  uploadedAt: string;
  resumeFileName: string;
  resumeText: string;
  analysis: ResumeAnalysis;
  isLocalFallback?: boolean;
}

export interface HiringInsights {
  totalCandidates: number;
  totalProcessedCount: number;
  averageAtsScore: number;
  shortlistedCount: number;
}
