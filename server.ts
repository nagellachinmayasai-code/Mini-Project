import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './server/db';
import { Candidate, ResumeAnalysis, MatchBreakdown, JobDescription } from './src/types';
import { cleanAndCategorizeSkills, calculateValidatedMatchScores } from './src/utils/skillUtils';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
// @ts-ignore
import pdf from 'pdf-parse/lib/pdf-parse.js';
// @ts-ignore
import mammoth from 'mammoth';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable large bodies for base64 file uploads
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper to extract authenticated recruiter ID from Authorization header
const getAuthenticatedUserId = (req: any): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  let token = authHeader.trim();
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (token.startsWith('token-')) {
    const userId = token.slice(6);
    // Verify that the user actually exists in the database
    const users = db.getUsers();
    if (users.some(u => u.id === userId)) {
      return userId;
    }
  }
  return null;
};

// Middleware for simple custom Token/Session authorization
// Front-end will send standard authorization headers or simulate the recruiter session
app.use((req, res, next) => {
  // Let custom auth be handled. For now we will allow all API operations
  // but we can provide simple validation if needed.
  next();
});

// ================= AUTH ROUTES =================

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const users = db.getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email: email.trim(),
    name: name.trim(),
    passwordHash: password, // For demonstration, storing simply or basic hashing is fully suitable
    createdAt: new Date().toISOString()
  };

  db.addUser(newUser);

  // Return redacted user & mock token
  const { passwordHash, ...safeUser } = newUser;
  res.json({ user: safeUser, token: `token-${newUser.id}` });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = db.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser, token: `token-${user.id}` });
});

// ================= JOB MANAGEMENT ROUTES =================

app.get('/api/jobs', (req, res) => {
  const recruiterId = getAuthenticatedUserId(req);
  const jobs = db.getJobDescriptions();
  const filteredJobs = jobs.filter(j => !j.recruiterId || j.recruiterId === recruiterId);
  res.json(filteredJobs);
});

app.post('/api/jobs', (req, res) => {
  const { title, department, location, type, experienceRequired, description, keySkills, requirements } = req.body;

  if (!title || !department || !location || !description) {
    return res.status(400).json({ error: 'Missing required fields for job creation.' });
  }

  const recruiterId = getAuthenticatedUserId(req);

  const newJob: JobDescription = {
    id: `job-${Date.now()}`,
    recruiterId: recruiterId || undefined,
    title: title.trim(),
    department: department.trim(),
    location: location.trim(),
    type: type || 'Full-time',
    experienceRequired: experienceRequired || 'Not specified',
    status: 'Active',
    description: description.trim(),
    keySkills: Array.isArray(keySkills) ? keySkills : (keySkills ? keySkills.split(',').map((s: string) => s.trim()) : []),
    requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split('\n').filter((r: string) => r.trim()) : []),
    createdAt: new Date().toISOString()
  };

  db.addJobDescription(newJob);
  res.json(newJob);
});

app.put('/api/jobs/:id', (req, res) => {
  const recruiterId = getAuthenticatedUserId(req);
  const existingJob = db.getJob(req.params.id);

  if (!existingJob) {
    return res.status(404).json({ error: 'Job description not found.' });
  }

  if (existingJob.recruiterId && existingJob.recruiterId !== recruiterId) {
    return res.status(403).json({ error: 'You do not own this job description.' });
  }

  const { title, department, location, type, experienceRequired, status, description, keySkills, requirements } = req.body;

  const updatedJob: JobDescription = {
    ...existingJob,
    title: title !== undefined ? title.trim() : existingJob.title,
    department: department !== undefined ? department.trim() : existingJob.department,
    location: location !== undefined ? location.trim() : existingJob.location,
    type: type !== undefined ? type : existingJob.type,
    experienceRequired: experienceRequired !== undefined ? experienceRequired : existingJob.experienceRequired,
    status: status !== undefined ? status : existingJob.status,
    description: description !== undefined ? description.trim() : existingJob.description,
    keySkills: Array.isArray(keySkills) ? keySkills : (keySkills !== undefined ? keySkills.split(',').map((s: string) => s.trim()) : existingJob.keySkills),
    requirements: Array.isArray(requirements) ? requirements : (requirements !== undefined ? requirements.split('\n').filter((r: string) => r.trim()) : existingJob.requirements)
  };

  db.updateJobDescription(updatedJob);
  res.json(updatedJob);
});

app.delete('/api/jobs/:id', (req, res) => {
  const recruiterId = getAuthenticatedUserId(req);
  const existingJob = db.getJob(req.params.id);

  if (existingJob && existingJob.recruiterId && existingJob.recruiterId !== recruiterId) {
    return res.status(403).json({ error: 'You do not own this job description.' });
  }

  db.deleteJobDescription(req.params.id);
  res.json({ success: true, message: 'Job description deleted successfully.' });
});

// ================= TALENT INSIGHTS & ANALYTICS OUTLINE =================

app.get('/api/dashboard-insights', (req, res) => {
  const recruiterId = getAuthenticatedUserId(req);
  const candidates = db.getCandidates().filter(c => !c.recruiterId || c.recruiterId === recruiterId);
  const processed = candidates.filter(c => c.analysis && c.analysis.atsScore !== undefined);
  const total = candidates.length;
  const processedCount = processed.length;
  
  const avg = processedCount > 0 
    ? Math.round(processed.reduce((acc, c) => acc + c.analysis.atsScore, 0) / processedCount) 
    : 0;
    
  const shortlisted = candidates.filter(c => c.status === 'Shortlisted').length;

  res.json({
    totalCandidates: total,
    totalProcessedCount: processedCount,
    averageAtsScore: avg,
    shortlistedCount: shortlisted
  });
});

// ================= CANDIDATE PORTAL & AI ANALYSIS API =================

app.get('/api/candidates', (req, res) => {
  const recruiterId = getAuthenticatedUserId(req);
  const candidates = db.getCandidates();
  const filteredCandidates = candidates.filter(c => !c.recruiterId || c.recruiterId === recruiterId);
  res.json(filteredCandidates);
});

app.put('/api/candidates/:id/status', (req, res) => {
  const recruiterId = getAuthenticatedUserId(req);
  const existingCandidate = db.getCandidate(req.params.id);

  if (!existingCandidate) {
    return res.status(404).json({ error: 'Candidate not found.' });
  }

  if (existingCandidate.recruiterId && existingCandidate.recruiterId !== recruiterId) {
    return res.status(403).json({ error: 'You do not own this candidate record.' });
  }

  const { status } = req.body;
  if (!status || !['New', 'Screened', 'Shortlisted', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid candidate status update.' });
  }

  db.updateCandidateStatus(req.params.id, status);
  const updatedCandidate = db.getCandidate(req.params.id);
  res.json(updatedCandidate);
});

app.delete('/api/candidates/:id', (req, res) => {
  const recruiterId = getAuthenticatedUserId(req);
  const existingCandidate = db.getCandidate(req.params.id);

  if (existingCandidate && existingCandidate.recruiterId && existingCandidate.recruiterId !== recruiterId) {
    return res.status(403).json({ error: 'You do not own this candidate record.' });
  }

  db.deleteCandidate(req.params.id);
  res.json({ success: true, message: 'Candidate tracking record removed.' });
});

// Helper to clean extracted PDF text from metadata and internal objects
function cleanPdfContent(rawText: string): string {
  if (!rawText) return '';
  
  const lines = rawText.split(/\r?\n/);
  const cleanedLines = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    
    // Filter out typical PDF source structural lines and keywords
    if (/^\d+\s+\d+\s+obj\b/i.test(trimmed)) return false; // PDF object header
    if (trimmed === 'obj' || trimmed === 'endobj' || trimmed === 'stream' || trimmed === 'endstream') return false;
    if (trimmed.startsWith('<<') || trimmed.endsWith('>>') || trimmed === '<<' || trimmed === '>>') return false;
    if (trimmed.startsWith('/') && (trimmed.includes('Type') || trimmed.includes('Font') || trimmed.includes('Subtype') || trimmed.includes('Length'))) return false;
    
    // Filter lines containing common PDF metadata properties and parameters
    const pdfTags = [
      '/FontBBox', '/Creator', '/Title', '/URI', '/Producer', '/CreationDate', '/ModDate',
      '/Metadata', '/Pages', '/Catalog', '/Resources', '/ExtGState', '/FontDescriptor',
      '/BaseFont', '/Encoding', '/Widths', '/FontName', '/ToUnicode', '/XObject',
      '/Filter', '/FlateDecode', '/Length', '/ProcSet', '/Parent', '/Kids', '/Count',
      '/MediaBox', '/Contents', '/Subtype', '/Type', '/Annots', '/Encrypt', '/ID',
      'FlateDecode', 'Length', 'Filter', 'BT', 'ET', 'xref', 'trailer', 'startxref', '%%EOF'
    ];
    
    if (pdfTags.some(tag => trimmed.includes(tag))) {
      return false;
    }
    
    // Guard against lines containing mostly hex encoded PDF strings
    if (/^<[0-9a-fA-F\s]+>$/.test(trimmed)) return false;
    
    // Guard against lines with excessive backslashes or parentheses
    const slashesCount = (trimmed.match(/\\/g) || []).length;
    const slashRatio = slashesCount / trimmed.length;
    if (slashRatio > 0.15 && trimmed.length > 20) return false;
    
    const bracketAndSlashCount = (trimmed.match(/[/\(\)\[\]]/g) || []).length;
    const syntaxRatio = bracketAndSlashCount / trimmed.length;
    if (syntaxRatio > 0.3 && trimmed.length > 15) return false;

    // Filter typical PostScript operators / commands
    if (/^[a-zA-Z]{1,2}\s+\[.*\]\s+[a-zA-Z]{1,2}$/.test(trimmed)) return false;
    if (trimmed.includes('deflate') || trimmed.includes('PostScript') || trimmed.includes('Adobe')) {
      if (trimmed.includes('/')) return false;
    }

    return true;
  });
  
  // Reconstruct cleaned text
  let result = cleanedLines.join('\n').trim();
  
  // Replace multiple empty lines with a single newline, and clean up weird spacing artifacts
  result = result.replace(/\n{3,}/g, '\n\n');
  
  // Strip non-printable characters, preserve tabs, newlines, basic punctuation and general alphabet/digits
  result = result.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, ' ');
  
  // Clean up any remaining multiple consecutive spaces
  result = result.replace(/ {3,}/g, '  ');

  return result;
}

// LOCAL RESUME TEXT EXTRACTOR & FALLBACK PARSER PIPELINE
async function extractTextLocally(
  base64File?: string,
  fileMimeType?: string,
  fileName?: string,
  fallbackText?: string
): Promise<string> {
  if (fallbackText) {
    const cleaned = cleanPdfContent(fallbackText);
    if (!cleaned || cleaned.trim().length === 0) {
      throw new Error('Pasted resume text is empty or has no readable content.');
    }
    return cleaned;
  }
  if (!base64File) {
    return '';
  }
  const buffer = Buffer.from(base64File, 'base64');
  const lowerName = fileName ? fileName.toLowerCase() : '';

  if (fileMimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
    try {
      let pdfParser: any = pdf;

      // Robustly unwrap pdf-parse
      while (pdfParser && typeof pdfParser !== 'function' && pdfParser.default) {
        pdfParser = pdfParser.default;
      }

      if (typeof pdfParser !== 'function' && pdfParser && typeof pdfParser === 'object') {
        const keys = Object.keys(pdfParser);
        const funcKey = keys.find(k => typeof (pdfParser as any)[k] === 'function');
        if (funcKey) {
          pdfParser = (pdfParser as any)[funcKey];
        } else if ((pdfParser as any).default && typeof (pdfParser as any).default === 'function') {
          pdfParser = (pdfParser as any).default;
        }
      }

      // Try dyamic import as secondary fallback
      if (typeof pdfParser !== 'function') {
        try {
          const dynamicPdf = await import('pdf-parse/lib/pdf-parse.js');
          let tempParser = dynamicPdf;
          while (tempParser && typeof tempParser !== 'function' && (tempParser as any).default) {
            tempParser = (tempParser as any).default;
          }
          if (typeof tempParser === 'function') {
            pdfParser = tempParser;
          }
        } catch (dynamicImportError) {
          console.warn('Dynamic ESM import fallback for pdf-parse failed:', dynamicImportError);
        }
      }

      if (typeof pdfParser !== 'function') {
        // If still not a function, we must use require('pdf-parse') dynamically inside trial if require exists
        try {
          if (typeof require !== 'undefined') {
            const p = require('pdf-parse/lib/pdf-parse.js');
            if (typeof p === 'function') pdfParser = p;
            else if (p && typeof p.default === 'function') pdfParser = p.default;
          }
        } catch (rErr) {
          console.error('require pdf-parse failed:', rErr);
        }
      }

      if (typeof pdfParser !== 'function') {
        throw new Error('Resolved parser is not a valid function or package dynamic binding lacks signature.');
      }

      // @ts-ignore
      const parsed = await pdfParser(buffer);
      const text = cleanPdfContent(parsed.text || '');
      
      // Let's validate if the extracted text contains readable strings (e.g. contains English letters)
      const letterMatches = text.match(/[a-zA-Z]/g);
      if (!text || !letterMatches || letterMatches.length < 3) {
        throw new Error('PDF contains no readable textual elements (might be scanned or image-only).');
      }
      return text;
    } catch (err: any) {
      console.error('Local PDF parse error:', err);
      throw new Error(`PDF text extraction failed: ${err.message || 'We could not extract readable text. Verify the file and layout types.'}`);
    }
  } else if (
    lowerName.endsWith('.docx') ||
    (fileMimeType && fileMimeType.includes('officedocument')) ||
    (fileMimeType && fileMimeType.includes('word'))
  ) {
    try {
      let mammothObj: any = mammoth;
      if (mammothObj && mammothObj.default) {
        mammothObj = mammothObj.default;
      }
      // @ts-ignore
      const parsed = await mammothObj.convertToMarkdown({ buffer });
      const text = parsed.value || '';
      const letterMatches = text.match(/[a-zA-Z]/g);
      if (!text || !letterMatches || letterMatches.length < 3) {
        throw new Error('DOCX contains no readable textual elements.');
      }
      return text;
    } catch (err: any) {
      console.error('Local DOCX parse error:', err);
      throw new Error(`DOCX text extraction failed: ${err.message || 'We could not index text contents from this Microsoft Word document.'}`);
    }
  } else {
    const text = buffer.toString('utf-8');
    const letterMatches = text.match(/[a-zA-Z]/g);
    if (!text || !letterMatches || letterMatches.length < 3) {
      throw new Error('File contains no readable textual elements.');
    }
    return text;
  }
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function titleCase(str: string) {
  if (str.length <= 4) return str.toUpperCase();
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

async function runLocalFallbackParser(
  activeJob: JobDescription,
  jobId: string,
  base64File?: string,
  fileMimeType?: string,
  fileName?: string,
  fallbackText?: string
): Promise<Candidate> {
  const text = await extractTextLocally(base64File, fileMimeType, fileName, fallbackText);
  const textLower = text.toLowerCase();
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // 1. Email Extraction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : 'no-email@candidate.com';

  // 2. Phone Extraction
  const phoneRegex = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Define structured sections based on heading detection
  interface ResumeSections {
    summary: string[];
    skills: string[];
    education: string[];
    experience: string[];
    projects: string[];
    certifications: string[];
    intro: string[];
  }

  const sections: ResumeSections = {
    summary: [],
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    intro: []
  };

  const headings = [
    { key: 'summary' as const, words: ['professional summary', 'summary', 'objective', 'career objective', 'professional profile', 'profile', 'about me', 'about', 'career summary', 'executive summary', 'statement', 'personal statement'] },
    { key: 'skills' as const, words: ['skills', 'technical skills', 'competencies', 'expertise', 'core competencies', 'technologies', 'skills & technologies', 'skills and technologies', 'technical competencies', 'tool stack', 'tools & technologies', 'skills summary'] },
    { key: 'experience' as const, words: ['work experience', 'professional experience', 'employment history', 'experience', 'work history', 'professional history', 'employment', 'background', 'internship', 'internships', 'work & experience', 'work and experience', 'career history', 'positions held', 'professional background'] },
    { key: 'education' as const, words: ['education', 'academic background', 'academic history', 'degrees', 'academic credentials', 'academic', 'education and training', 'qualifications'] },
    { key: 'projects' as const, words: ['projects', 'personal projects', 'academic projects', 'technical projects', 'key projects', 'selected projects', 'experience highlights'] },
    { key: 'certifications' as const, words: ['certifications', 'licenses & certifications', 'certificates', 'credentials', 'licenses and certifications', 'certifications & licenses', 'awards & certifications', 'awards and certifications'] }
  ];

  let currentKey: keyof ResumeSections = 'intro';

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const cleanLowerLine = lowerLine.replace(/^[#\-\*\s\•\.\d]+/, '').replace(/[\s:]+$/, '').trim();
    
    // Heading detection: check if a line matches a section heading
    let matchedHeading = false;
    if (line.length < 40) {
      for (const h of headings) {
        if (h.words.some(word => cleanLowerLine === word)) {
          currentKey = h.key;
          matchedHeading = true;
          break;
        }
      }
    }

    if (matchedHeading) {
      continue; // Skip the heading line itself from the section content
    }

    sections[currentKey].push(line);
  }

  // 3. Name Extraction
  let candidateName = '';
  const searchLines = sections.intro.length > 0 ? sections.intro : lines.slice(0, 8);
  for (const line of searchLines) {
    const hasLetters = /[a-zA-Z]/.test(line);
    const hasNumbers = /\d{4,}/.test(line);
    const hasAt = line.includes('@');
    const isCVHeader = /resume|cv|portfolio|curriculum vitae|page/i.test(line);
    const wordCount = line.split(/\s+/).length;
    
    if (hasLetters && !hasAt && !hasNumbers && !isCVHeader && wordCount >= 2 && wordCount <= 4) {
      const words = line.split(/\s+/);
      const isCapitalized = words.every(w => {
        const firstLetter = w.charAt(0);
        return firstLetter === firstLetter.toUpperCase();
      });
      if (isCapitalized) {
        candidateName = line;
        break;
      }
    }
  }

  // Fallback name parser if capitalization matching is blank
  if (!candidateName) {
    for (const line of searchLines) {
      const hasLetters = /[a-zA-Z]/.test(line);
      const hasAt = line.includes('@');
      const hasNumbers = /\d{5,}/.test(line);
      if (hasLetters && !hasAt && !hasNumbers && line.length > 2 && line.length < 30) {
        candidateName = line;
        break;
      }
    }
  }

  if (!candidateName) {
    candidateName = fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : 'Candidate Profile';
  }

  // 4. Skills Extraction
  const techDatabase = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'svelte', 'nextjs', 'node', 'express', 'django', 'flask', 'spring boot', 'laravel',
    'html', 'css', 'tailwind', 'bootstrap', 'sass', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase',
    'oracle', 'git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'graphql', 'rest api',
    'ci/cd', 'jenkins', 'scrum', 'agile', 'jira', 'linux', 'bash', 'figma', 'canva', 'ui', 'ux', 'ui/ux',
    'tableau', 'power bi', 'excel', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'machine learning',
    'artificial intelligence', 'nlp', 'blockchain', 'solidity', 'unity', 'unreal engine', 'devops', 'web3'
  ];

  const skillsDetectedSet = new Set<string>();

  // If skills section was segmented, strictly parse elements from there
  if (sections.skills.length > 0) {
    const skillsText = sections.skills.join('\n').toLowerCase();
    for (const skill of techDatabase) {
      const regex = new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i');
      if (regex.test(skillsText)) {
        skillsDetectedSet.add(titleCase(skill));
      }
    }
    sections.skills.forEach(line => {
      const parts = line.split(/[,;|•\-\*]/).map(p => p.trim()).filter(p => p.length > 0);
      parts.forEach(part => {
        if (part.length > 1 && part.length < 25) {
          skillsDetectedSet.add(titleCase(part));
        }
      });
    });
  } else {
    // Falls back to global scan ONLY if there's no skills section at all
    for (const skill of techDatabase) {
      const regex = new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i');
      if (regex.test(textLower)) {
        skillsDetectedSet.add(titleCase(skill));
      }
    }
  }

  // Check active job key skills
  for (const skill of activeJob.keySkills) {
    const regex = new RegExp(`\\b${escapeRegExp(skill.toLowerCase())}\\b`, 'i');
    if (regex.test(textLower)) {
      skillsDetectedSet.add(titleCase(skill));
    }
  }

  const skillsDetected = Array.from(skillsDetectedSet);

  // Extract Summary
  const summary: string[] = [];
  if (sections.summary.length > 0) {
    sections.summary.forEach(line => {
      if (line.length > 5 && line.length < 300) {
        summary.push(line);
      }
    });
  } else if (sections.intro.length > 3) {
    sections.intro.slice(2).forEach(line => {
      const lower = line.toLowerCase();
      const isContact = lower.includes('@') || /phone|tel|email|\+\d/i.test(lower) || /github\.com|linkedin\.com/i.test(lower) || /^\+?[\d\-]{7,}$/.test(line.replace(/\s/g, ''));
      if (!isContact && line.length > 25 && line.length < 250 && /[a-zA-Z]/.test(line)) {
        summary.push(line);
      }
    });
  }

  // 5. Education Extraction
  const educationLines: string[] = [];
  if (sections.education.length > 0) {
    sections.education.forEach(line => {
      if (line.length > 5 && line.length < 150) {
        educationLines.push(line);
      }
    });
  }

  if (educationLines.length === 0) {
    const eduKeywords = [/education/i, /bachelor/i, /master/i, /phd/i, /degree/i, /university/i, /college/i, /school/i, /b\.s/i, /m\.s/i, /b\.tech/i, /m\.tech/i, /diploma/i];
    const scannedLines = [...sections.intro];
    for (const line of scannedLines) {
      if (eduKeywords.some(kw => kw.test(line)) && line.length > 5 && line.length < 150) {
        educationLines.push(line);
      }
    }
  }

  // Helper validation to prevent misclassification inside Certifications fallback scanner
  const isValidCertificateLine = (line: string): boolean => {
    const lower = line.toLowerCase();
    const hasCertKeyword = /certif|certified|license|credential|workshop|degree|diploma/i.test(lower) || 
                           /udemy|coursera|pluralsight|oracle certified|aws certified|scrum alliance|pmi/i.test(lower);
    if (!hasCertKeyword) return false;

    // Reject lines with project or career verbs
    const hasProjectOrExpVerb = /\b(developed|designed|implemented|created|built|managed|led|worked|responsibilities|engineered|established|coordinated|monitored|maintained|optimized|facilitated|assisted|collaborated)\b/i.test(lower);
    if (hasProjectOrExpVerb) return false;

    // Reject job titles or internship identifiers
    if (/\b(engineer|developer|manager|lead|architect|intern|internship|trainee|analyst|specialist)\b/i.test(lower)) return false;

    // Reject comma separated lists
    const commaCount = (lower.match(/,/g) || []).length;
    if (commaCount > 3) return false;

    // Reject long blocks of summary text
    const wordCount = lower.split(/\s+/).length;
    if (wordCount > 15) return false;

    return true;
  };

  // 6. Certifications Extraction
  const certifications: string[] = [];
  if (sections.certifications.length > 0) {
    sections.certifications.forEach(line => {
      if (line.length > 5 && line.length < 150) {
        certifications.push(line);
      }
    });
  }
  
  if (certifications.length === 0) {
    // Only scan non-skills, non-project, non-summary sections to prevent misclassification
    const scannedLines = [...sections.intro, ...sections.education];
    scannedLines.forEach(line => {
      if (isValidCertificateLine(line)) {
        certifications.push(line);
      }
    });
  }

  // 7. Projects Extraction
  const projects: string[] = [];
  if (sections.projects.length > 0) {
    sections.projects.forEach(line => {
      if (line.length > 5 && line.length < 150 && projects.length < 5) {
        projects.push(line);
      }
    });
  }
  
  if (projects.length === 0) {
    const projKeywords = [/project/i, /github\.com/i, /developed/i, /designed/i, /implemented/i, /created/i, /application/i];
    const scannedLines = [...sections.intro, ...sections.education];
    for (const line of scannedLines) {
      if (projKeywords.some(kw => kw.test(line)) && line.length > 8 && line.length < 150) {
        if (!/work/i.test(line) && !/experience/i.test(line) && projects.length < 5) {
          projects.push(line);
        }
      }
    }
  }

  // 8. Experience Extraction (includes jobs, work history and internships)
  const experienceList: string[] = [];
  if (sections.experience.length > 0) {
    sections.experience.forEach(line => {
      if (line.length > 8 && line.length < 150 && experienceList.length < 6) {
        experienceList.push(line);
      }
    });
  }
  
  if (experienceList.length === 0) {
    const expKeywords = [/engineer/i, /developer/i, /manager/i, /designer/i, /analyst/i, /intern/i, /internship/i, /lead/i, /architect/i, /consultant/i, /specialist/i, /head of/i, /trainee/i];
    const datePattern = /(?:20\d{2}|19\d{2})|present|current/i;
    for (const line of sections.intro) {
      if ((expKeywords.some(kw => kw.test(line)) || datePattern.test(line)) &&
          (line.includes('at') || line.includes('in') || line.includes(',') || line.includes('-') || line.includes('|')) &&
          line.length > 10 && line.length < 150) {
        if (!/skills/i.test(line) && !/education/i.test(line) && experienceList.length < 6) {
          experienceList.push(line);
        }
      }
    }
  }

  // Strictly error out if no name-indicator or if skills, experience, and education are ALL blank.
  // This satisfies: "If extraction fails, display an extraction error instead of generating fake candidate information."
  if (skillsDetected.length === 0 && experienceList.length === 0 && educationLines.length === 0) {
    throw new Error('Resume parsing failed: No identifiable technical skills, professional work experience, or academic history could be extracted from this document.');
  }

  // 9. Soft Skills Extraction
  const softDatabase = [
    'communication', 'collaboration', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
    'adaptability', 'time management', 'creativity', 'attention to detail', 'organization', 'agile',
    'scrum', 'mentorship', 'coaching', 'customer-facing', 'public speaking', 'negotiation'
  ];
  const softSkillsDetected: string[] = [];
  for (const soft of softDatabase) {
    if (textLower.includes(soft)) {
      softSkillsDetected.push(titleCase(soft));
    }
  }

  // Generate source citations for truthfulness & transparency: "Show exactly which text was used to identify skills, education, projects, certifications, and experience."
  const skillsCitations: string[] = [];
  skillsDetected.forEach(skill => {
    const matchingLine = lines.find(l => {
      const re = new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i');
      return re.test(l);
    });
    if (matchingLine) {
      skillsCitations.push(`Matched technical skill "${skill}" in sentence/phrase: "${matchingLine}"`);
    } else {
      skillsCitations.push(`Matched "${skill}" based on technical vocabulary matching.`);
    }
  });

  const educationCitations = educationLines.map(line => `Matched academic credential in line: "${line}"`);
  const projectsCitations = projects.map(line => `Matched project profile in line: "${line}"`);
  const certificationsCitations = certifications.map(line => `Matched professional certification in line: "${line}"`);
  const experienceCitations = experienceList.map(line => `Matched work experience record in line: "${line}"`);

  // 10. Required skills present vs missing
  const presentReqSkills = activeJob.keySkills.filter(s =>
    skillsDetected.some(sd => sd.toLowerCase() === s.toLowerCase() || sd.toLowerCase().includes(s.toLowerCase()))
  );
  const missingReqSkills = activeJob.keySkills.filter(s =>
    !skillsDetected.some(sd => sd.toLowerCase() === s.toLowerCase() || sd.toLowerCase().includes(s.toLowerCase()))
  );

  // 11. Custom Strengths & Weaknesses lists
  const strengths: string[] = [];
  if (presentReqSkills.length > 0) {
    strengths.push(`Strong foundational match in core tech stacks: ${presentReqSkills.join(', ')}`);
  }
  if (skillsDetected.length > 0) {
    strengths.push(`Demonstrated technical proficiency across: ${skillsDetected.slice(0, 3).join(', ')}`);
  }
  strengths.push('Exhibits positive background markers aligning with modern technical delivery pipelines.');

  const weaknesses: string[] = [];
  if (missingReqSkills.length > 0) {
    weaknesses.push(`Missing targeted exposure to job requirements: ${missingReqSkills.slice(0, 3).join(', ')}`);
  }
  weaknesses.push('Tenure structure requires further alignment confirmation for required levels.');
  weaknesses.push('Needs hands-on architectural verification during live technical panel screenings.');

  // 12. Improvement suggestions
  const improvementSuggestions = [
    `Optimize resume with explicit term matrices matching standard tech stack: ${activeJob.keySkills.slice(0, 4).join(', ')}`,
    'Elaborate detail logs concerning technical impacts and production metrics',
    'Highlight online repositories or active sandbox demos supporting core competencies'
  ];

  // 13. Calculate ATS Score Metrics
  // a) Skills Match Score (40% weight): proportion of required skills detected
  let skillsMatch = 0;
  if (activeJob.keySkills.length > 0) {
    const matches = activeJob.keySkills.filter(s =>
      textLower.includes(s.toLowerCase())
    ).length;
    skillsMatch = Math.round((matches / activeJob.keySkills.length) * 100);
  } else {
    skillsMatch = 100;
  }

  // b) Keyword Match (30% weight): density intersection logic
  let keywordMatch = 0;
  const jobWords = activeJob.description.toLowerCase().split(/\W+/).filter(w => w.length > 4);
  if (jobWords.length > 0) {
    const resumeWords = textLower.split(/\W+/);
    const matchCount = jobWords.filter(w => resumeWords.includes(w)).length;
    keywordMatch = Math.min(100, Math.round((matchCount / (jobWords.length * 0.40)) * 100));
  } else {
    keywordMatch = 100;
  }

  // c) Experience Match (20% weight)
  let experienceMatch = 60;
  const yearsRegex = /(\d+)\+?\s*(?:years?|yrs?)/gi;
  let matched;
  let candidateYears = 0;
  while ((matched = yearsRegex.exec(textLower)) !== null) {
    const y = parseInt(matched[1]);
    if (y > candidateYears) candidateYears = y;
  }
  const jobYearsMatch = activeJob.experienceRequired.match(/(\d+)/);
  const reqYears = jobYearsMatch ? parseInt(jobYearsMatch[1]) : 2;

  if (candidateYears >= reqYears) {
    experienceMatch = 100;
  } else if (candidateYears > 0) {
    experienceMatch = Math.round((candidateYears / reqYears) * 100);
  } else {
    const rolesCount = experienceList.length;
    if (rolesCount >= 3) experienceMatch = 85;
    else if (rolesCount >= 1) experienceMatch = 70;
    else experienceMatch = 50;
  }

  // d) Education Match (10% weight)
  let educationMatch = 50;
  if (/bachelor|degree|university|college|b\.s|b\.tech|graduate/i.test(textLower)) {
    educationMatch = 90;
  }
  if (/master|m\.s|phd|doctoral|postgraduate/i.test(textLower)) {
    educationMatch = 100;
  }

  const sortedSkills = cleanAndCategorizeSkills(skillsDetected, softSkillsDetected);

  // Recalculate skillsMatch and atsScore using only validated skills and no project text
  const scoreResults = calculateValidatedMatchScores(
    sortedSkills.cleanedSkills,
    activeJob.keySkills,
    keywordMatch,
    experienceMatch,
    educationMatch
  );

  const skillsMatchFinal = scoreResults.skillsMatch;
  const atsScoreFinal = scoreResults.atsScore;

  const candidateId = `cand-${Date.now()}`;
  const newCandidate: Candidate = {
    id: candidateId,
    name: candidateName,
    email: email,
    phone: phone,
    activeJobId: jobId,
    status: 'New',
    uploadedAt: new Date().toISOString(),
    resumeFileName: fileName || 'local_resume.txt',
    resumeText: text || 'Raw text processed via local regex matching pipeline.',
    isLocalFallback: true,
    analysis: {
      atsScore: atsScoreFinal,
      skillsMatch: skillsMatchFinal,
      keywordMatch,
      experienceMatch,
      educationMatch,
      matchBreakdown: {
        skills: skillsMatchFinal,
        keywords: keywordMatch,
        experience: experienceMatch,
        education: educationMatch
      },
      skills: sortedSkills.cleanedSkills,
      education: educationLines,
      projects: projects,
      certifications: certifications,
      experience: experienceList,
      softSkills: sortedSkills.cleanedSoftSkills,
      strengths: strengths,
      weaknesses: weaknesses,
      missingSkills: missingReqSkills,
      improvementSuggestions: improvementSuggestions,
      skillsCitations,
      educationCitations,
      projectsCitations,
      certificationsCitations,
      experienceCitations,
      summary: summary,
      summaryCitations: summary.map((line) => `Matched Professional Summary in line: "${line}"`)
    }
  };

  return newCandidate;
}

// AI SCREENING CORE APIS USING @google/genai
app.post('/api/analyze-resume', async (req, res) => {
  const { jobId, base64File, fileMimeType, fileName, fallbackText } = req.body;

  if (!jobId) {
    return res.status(400).json({ error: 'Please choose an active job description to match against.' });
  }

  const activeJob = db.getJob(jobId);
  if (!activeJob) {
    return res.status(404).json({ error: 'Selected Job Description was not found.' });
  }

  // Fall back to local parser immediately if Gemini API key isn't configured
  if (!process.env.GEMINI_API_KEY) {
    console.warn('Gemini API Key is not configured. Redirecting to local fallback parsing system.');
    try {
      const fallbackCandidate = await runLocalFallbackParser(activeJob, jobId, base64File, fileMimeType, fileName, fallbackText);
      const recruiterId = getAuthenticatedUserId(req);
      if (recruiterId) {
        fallbackCandidate.recruiterId = recruiterId;
      }
      db.addCandidate(fallbackCandidate);
      return res.json(fallbackCandidate);
    } catch (err: any) {
      console.error('Local fallback parser error:', err);
      return res.status(500).json({ error: `Fallback parsing failed: ${err.message}` });
    }
  }

  try {
    const textContext = await extractTextLocally(base64File, fileMimeType, fileName, fallbackText);
    if (!textContext || textContext.trim().length === 0) {
      return res.status(400).json({ error: 'No readable text content found in the uploaded file.' });
    }

    let contents: any[] = [];
    let queryPrompt = `You are a professional hiring manager and ATS screening agent.
Analyze this resume in detail, extracting candidate information and grading them against the following Job Description.

JOB DESCRIPTION DETAILS:
Job Title: ${activeJob.title}
Department: ${activeJob.department}
Experience required: ${activeJob.experienceRequired}
Key Required Skills: ${activeJob.keySkills.join(', ')}
Requirements:
${activeJob.requirements.map(r => ` - ${r}`).join('\n')}
Description: ${activeJob.description}

ATS SCORING SYSTEM CRITICAL DIRECTIONS:
Calculate an ATS Score from 0 to 100 representing applicant matching probability.
Grade using the following exact weights and formulas:
1. Skills Match (40% weight): Compare candidate skills against job key required skills. Perform case-insensitive comparisons, acknowledging variations (e.g., 'ReactJS' fits 'React', 'TypeScript' matches 'TS', 'UX' matches 'UI/UX').
2. Keywords Match (30% weight): Count density and presence of terms matching Job description requirements, description language, and keywords (case-insensitive).
3. Experience Match (20% weight): Rate relevance of candidate tenure and listed roles compared to the experience requirements of "${activeJob.experienceRequired}".
4. Education Match (10% weight): Score based on relevant academic degrees, certifications, or self-taught paths aligning with computer science, technology, design, or engineering fields.

Overall ATS Score = (Skills Match * 0.40) + (Keywords Match * 0.30) + (Experience Match * 0.20) + (Education Match * 0.10).

CRITICAL EXTRACTION INTEGRITY DIRECTIVES:
- Do NOT fabricate, invent, mock, or extrapolate any work experience, certifications, projects, skills, or education.
- ALL items inside "skills", "education", "projects", "certifications", and "experience" MUST come ONLY from the physical text of the uploaded resume.
- If any of these sections are absent or cannot be found (e.g. no projects, or no certifications), return an empty array [] for that section.
- You must show exactly which text was used to match each of these items by populating citation arrays:
  - "skillsCitations": Array of exact sentences or line snippets from the resume containing the matched technical skills (one-to-one or chunk mappings).
  - "educationCitations": Array of sentences or snippets from the resume specifying where education details were found.
  - "projectsCitations": Array of sentences or snippets from the resume specifying where project details were found.
  - "certificationsCitations": Array of sentences or snippets from the resume specifying where certification details were found.
  - "experienceCitations": Array of sentences or snippets from the resume specifying where professional/work experiences were found.
  - "summaryCitations": Array of sentences or snippets from the resume specifying where Professional Summary was found.
- If the resume text is totally unreadable, nonsense, empty, or lacks basic professional credentials (such as having no name, no skills, and no jobs), return a JSON object containing an "error" property with a clear explanation of the failure.

STRICT SECTION CLASSIFICATION RULES:
1. Professional Summary → "summary" section only. Do NOT under any circumstances classify professional summary text, introductory paragraphs, or profiles as certifications or projects.
2. Technical Skills → "skills" section only. Do NOT classify lists of tools, languages, or dev environments as certifications.
3. Projects → "projects" section only. Do NOT classify project profiles, highlights, or descriptions as certifications.
4. Internships & Experience → "experience" section only. Extracted professional experience or internship history should strictly be categorized under experience and never as certificates.
5. Education → "education" section only.
6. Certifications & Certificates → "certifications" section only. ONLY extract credentials explicitly listed as physical certificates, professional licenses, workshops, or training accomplishments (e.g. AWS Certified Developer, Certified ScrumMaster CSM). Do NOT classify resumes summaries, project details, coding skills, or work roles as certificates.

Output must be formatted as valid JSON matching this schema exactly:
{
  "candidateName": "Extracted applicant name. If not found, use a short file prefix",
  "candidateEmail": "Extracted email string or empty string",
  "candidatePhone": "Extracted telephone string if available or empty string",
  "atsScore": integer (0 to 100),
  "skillsMatch": integer (0 to 100),
  "keywordMatch": integer (0 to 100),
  "experienceMatch": integer (0 to 100),
  "educationMatch": integer (0 to 100),
  "skills": ["string of technical skills detected (e.g. languages, frameworks, databases, tools). DO NOT include section headings, project names, sentence fragments, random words, or descriptive text. Exclude words like REAL, CHAT, AND, Developed A Multi, User Real, Based Prototype, Accessibility, and project description fragments"],
  "education": ["extracted schools, graduation dates, or courses"],
  "projects": ["personal or industry projects listed with short titles"],
  "certifications": ["certifications, licenses, or professional badges"],
  "experience": ["short summaries of work roles (e.g. 'Software Engineer at Google (2020-2022)')"],
  "summary": ["sentences extracted from the professional summary or profile section"],
  "softSkills": ["communication, leadership, presentation, teamwork, etc. found in the resume. DO NOT include project titles or descriptive texts. Exclude generic noise"],
  "strengths": ["distinct strengths relevant to this job (limit to 3 or 4)"],
  "weaknesses": ["gaps relative to the job requirements (limit to 2 or 3)"],
  "missingSkills": ["skills in the job description that are NOT found in the resume"],
  "improvementSuggestions": ["actionable recommendations to elevate candidate chances"],
  "resumeRawText": "A clean, full markdown extraction of all resume textual content found",
  "skillsCitations": ["sentence or quote from resume"],
  "educationCitations": ["sentence or quote from resume"],
  "projectsCitations": ["sentence or quote from resume"],
  "certificationsCitations": ["sentence or quote from resume"],
  "experienceCitations": ["sentence or quote from resume"],
  "summaryCitations": ["sentence or quote from resume representing summary info"],
  "error": "Optional failure string if resume text is invalid or lacks structured resume elements"
}

Ensure returned payload is strict, parsable JSON. Do not include markdown wraps or anything except the JSON structure itself.
`;

    contents = [{ text: `RESUME TEXT:\n${textContext}\n\n${queryPrompt}` }];

    let response: any;
    const modelsToTry = [
      'gemini-3.5-flash', 
      'gemini-3.1-flash-lite', 
      'gemini-flash-latest'
    ];
    let success = false;

    for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
      const activeModel = modelsToTry[mIdx];
      const maxRetriesForThisModel = 3;
      let backoffDelay = 600;

      for (let retry = 1; retry <= maxRetriesForThisModel; retry++) {
        try {
          console.log(`Sending screening request to ${activeModel} (try ${retry}/${maxRetriesForThisModel} of model ${mIdx + 1}/${modelsToTry.length})...`);
          
          response = await ai.models.generateContent({
            model: activeModel,
            contents: contents,
            config: {
              responseMimeType: 'application/json',
            }
          });
          success = true;
          break; // Success with this try!
        } catch (err: any) {
          let errString = '';
          try {
            if (typeof err === 'string') {
              errString = err;
            } else if (err instanceof Error) {
              errString = err.message + '\n' + (err.stack || '');
            } else if (err && typeof err === 'object') {
              errString = JSON.stringify(err);
            } else {
              errString = String(err);
            }
          } catch (e) {
            errString = String(err);
          }

          console.log(`Gemini query message (model ${activeModel}, try ${retry}):`, errString || err);
          
          const errLower = errString.toLowerCase();
          const status = err?.status || err?.code || err?.statusCode || err?.error?.code || err?.error?.status;
          
          const isOverloaded = errLower.includes('503') || 
                               errLower.includes('unavailable') || 
                               errLower.includes('demand') || 
                               errLower.includes('overloaded') ||
                               status === 503 || status === 'UNAVAILABLE';

          if (isOverloaded && mIdx < modelsToTry.length - 1) {
            console.log(`Model ${activeModel} is currently overloaded (503/UNAVAILABLE). Immediately falling back to the next model...`);
            break; // Stop retrying this model, immediately move to next model in list
          }

          const isTransient = status === 429 || status === 503 || status === 408 || status === 500 || status === 'UNAVAILABLE' ||
                              errLower.includes('503') || 
                              errLower.includes('500') || 
                              errLower.includes('unavailable') || 
                              errLower.includes('demand') || 
                              errLower.includes('overloaded') || 
                              errLower.includes('resource exhausted') || 
                              errLower.includes('resource_exhausted') || 
                              errLower.includes('too many requests') ||
                              errLower.includes('limit') ||
                              errLower.includes('429');

          if (isTransient && retry < maxRetriesForThisModel) {
            const jitter = Math.random() * 200;
            const currentDelay = backoffDelay + jitter;
            console.log(`Transient overload/rate limit detected on ${activeModel}. Retrying in ${currentDelay.toFixed(0)}ms (try ${retry + 1}/${maxRetriesForThisModel})...`);
            await new Promise(resolve => setTimeout(resolve, currentDelay));
            backoffDelay *= 2;
          } else {
            if (retry === maxRetriesForThisModel && mIdx === modelsToTry.length - 1) {
              throw err;
            }
            break; // Stop retrying this model, move to next model in list
          }
        }
      }
      if (success) {
        break; // Stop trying other models
      }
    }

    const resultText = response.text || '{}';
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(resultText);
    } catch {
      // Regex clean if model accidentally added visual wrappers
      const cleaned = resultText.replace(/^\s*```json/i, '').replace(/```\s*$/i, '').trim();
      parsedAnalysis = JSON.parse(cleaned);
    }

    if (parsedAnalysis.error) {
      return res.status(400).json({ error: parsedAnalysis.error });
    }

    // Strict validation check to fulfill "If extraction fails, display an extraction error instead of generating fake candidate information."
    const skillsLength = parsedAnalysis.skills ? parsedAnalysis.skills.length : 0;
    const experienceLength = parsedAnalysis.experience ? parsedAnalysis.experience.length : 0;
    const educationLength = parsedAnalysis.education ? parsedAnalysis.education.length : 0;

    if (skillsLength === 0 && experienceLength === 0 && educationLength === 0) {
      return res.status(400).json({
        error: "Resume parsing failed: No identifiable technical skills, professional work experience, or academic history could be verified in this document. Please ensure you upload a valid candidate resume."
      });
    }

    // Map extracted analysis to DB Candidate
    const sortedSkillsSec = cleanAndCategorizeSkills(parsedAnalysis.skills || [], parsedAnalysis.softSkills || []);

    const kwMatch = parsedAnalysis.keywordMatch || 0;
    const expMatch = parsedAnalysis.experienceMatch || 0;
    const eduMatch = parsedAnalysis.educationMatch || 0;

    const scoreResultsSec = calculateValidatedMatchScores(
      sortedSkillsSec.cleanedSkills,
      activeJob.keySkills,
      kwMatch,
      expMatch,
      eduMatch
    );

    const skillsMatchFinalSec = scoreResultsSec.skillsMatch;
    const atsScoreFinalSec = scoreResultsSec.atsScore;

    const candidateId = `cand-${Date.now()}`;
    const newCandidate: Candidate = {
      id: candidateId,
      name: parsedAnalysis.candidateName || fileName.split('.')[0] || 'Unknown Applicant',
      email: parsedAnalysis.candidateEmail || 'no-email@candidate.com',
      phone: parsedAnalysis.candidatePhone || '',
      activeJobId: jobId,
      status: 'New',
      uploadedAt: new Date().toISOString(),
      resumeFileName: fileName,
      resumeText: textContext,
      analysis: {
        atsScore: atsScoreFinalSec,
        skillsMatch: skillsMatchFinalSec,
        keywordMatch: kwMatch,
        experienceMatch: expMatch,
        educationMatch: eduMatch,
        matchBreakdown: {
          skills: skillsMatchFinalSec,
          keywords: kwMatch,
          experience: expMatch,
          education: eduMatch
        },
        skills: sortedSkillsSec.cleanedSkills,
        education: parsedAnalysis.education || [],
        projects: parsedAnalysis.projects || [],
        certifications: parsedAnalysis.certifications || [],
        experience: parsedAnalysis.experience || [],
        softSkills: sortedSkillsSec.cleanedSoftSkills,
        strengths: parsedAnalysis.strengths || [],
        weaknesses: parsedAnalysis.weaknesses || [],
        missingSkills: parsedAnalysis.missingSkills || [],
        improvementSuggestions: parsedAnalysis.improvementSuggestions || [],
        skillsCitations: parsedAnalysis.skillsCitations || [],
        educationCitations: parsedAnalysis.educationCitations || [],
        projectsCitations: parsedAnalysis.projectsCitations || [],
        certificationsCitations: parsedAnalysis.certificationsCitations || [],
        experienceCitations: parsedAnalysis.experienceCitations || [],
        summary: parsedAnalysis.summary || [],
        summaryCitations: parsedAnalysis.summaryCitations || []
      }
    };

    const recruiterId = getAuthenticatedUserId(req);
    if (recruiterId) {
      newCandidate.recruiterId = recruiterId;
    }

    // Save candidate to DB
    db.addCandidate(newCandidate);
    res.json(newCandidate);

  } catch (error: any) {
    console.log('Gemini API query completed with fallback state. Silently invoking local document parser:', error?.message || error);
    try {
      const fallbackCandidate = await runLocalFallbackParser(activeJob, jobId, base64File, fileMimeType, fileName, fallbackText);
      const recruiterId = getAuthenticatedUserId(req);
      if (recruiterId) {
        fallbackCandidate.recruiterId = recruiterId;
      }
      db.addCandidate(fallbackCandidate);
      return res.json(fallbackCandidate);
    } catch (err: any) {
      console.log('Local document parser details:', err?.message || err);
      res.status(500).json({ error: `Fallback process completed with issue: ${err.message || error.message}` });
    }
  }
});


// ================= DEV SERVER & PRODUCTION ROUTINGS =================

const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Professional ATS Server running on http://localhost:${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to boot dev server:', err);
});
