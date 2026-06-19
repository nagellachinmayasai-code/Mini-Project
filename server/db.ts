import fs from 'fs';
import path from 'path';
import { User, JobDescription, Candidate } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'src_db_store.json');

interface AuthUser extends User {
  passwordHash: string;
}

interface DatabaseSchema {
  users: AuthUser[];
  jobDescriptions: JobDescription[];
  candidates: Candidate[];
}

const DEFAULT_JOBS: JobDescription[] = [
  {
    id: 'job-1',
    title: 'Lead Full-Stack Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA (Remote)',
    type: 'Remote',
    experienceRequired: '5+ years',
    status: 'Active',
    description: 'We are seeking a Lead Full-Stack Engineer to build and scale our multi-tenant SaaS application pipelines. You will own the core architecture, design cloud services, and lead our software development sprint cycles.',
    keySkills: ['React', 'Node.js', 'TypeScript', 'Express', 'PostgreSQL', 'System Architecture', 'AI Integration', 'Docker'],
    requirements: [
      'Over 5 years of software development experience with modern JS/TS frameworks.',
      'Proven track record of designing and scaling robust architectural frameworks.',
      'Deep, hands-on production experience with React 18/19 and server-side Express implementations.',
      'Familiarity with cloud hosting, CI/CD pipelines, and microservices engines.'
    ],
    createdAt: new Date('2026-06-10').toISOString()
  },
  {
    id: 'job-2',
    title: 'Senior Product Designer',
    department: 'Design',
    location: 'New York, NY',
    type: 'Full-time',
    experienceRequired: '4+ years',
    status: 'Active',
    description: 'We are looking for a Senior Product Designer who is passionate about creating elegant, highly intuitive, and accessible user interfaces. You will work directly with our recruiters and developers to spearhead standard visual solutions.',
    keySkills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'UI/UX Design', 'Tailwind CSS', 'Wireframing', 'Typography'],
    requirements: [
      '4+ years designing production-level SaaS platforms or consumer apps.',
      'A portfolio showcasing complete UX discovery flows, wireframes, and high-fidelity mockups.',
      'Exceptional grasp of design system practices, prototyping interactions, and clean spacing concepts.',
      'Basic front-end familiarity (Tailwind / HTML / CSS) to assist developers in seamless hand-offs.'
    ],
    createdAt: new Date('2026-06-12').toISOString()
  },
  {
    id: 'job-3',
    title: 'Data Scientist - AI Solutions',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    experienceRequired: '3+ years',
    status: 'Active',
    description: 'Join our AI applications squad to pioneer state-of-the-art intelligent processing pipelines. You will build and fine-tune models, leverage Large Language Models (LLMs), and run performance telemetry.',
    keySkills: ['Python', 'Machine Learning', 'NLP', 'Large Language Models', 'SQL', 'PyTorch', 'Data Science', 'Data Engineering', 'TensorFlow'],
    requirements: [
      '3+ years of experience analyzing data stacks and training machine learning algorithms.',
      'Practical expertise utilizing LLMs (Gemini, Claude, GPT) and developing custom vector spaces.',
      'Highly pro-efficient with Python (Pandas, NumPy, Scikit-Learn, PyTorch).',
      'Strong relational data modeling skills and experience with big data clusters.'
    ],
    createdAt: new Date('2026-06-15').toISOString()
  }
];

const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@techmail.com',
    phone: '+1 (555) 304-9281',
    activeJobId: 'job-1',
    status: 'Shortlisted',
    uploadedAt: new Date('2026-06-16T10:30:00Z').toISOString(),
    resumeFileName: 'elena_rostova_senior_eng.pdf',
    resumeText: `ELENA ROSTOVA
Senior software professional with 6 years of expertise building and deploying responsive full-stack applications.
Email: elena.rostova@techmail.com | Phone: +1 (555) 304-9281
Skills: React, Node.js, TypeScript, Express, PostgreSQL, System Architecture, AI Integration, Docker, Redis, Kubernetes, GCP

Experience:
Lead Web Architect at ScaleOps (2023 - Present)
- Designed and scaled reactive full-stack SaaS pipelines.
- Upgraded Core architectures reducing service latency by 35%.
- Maintained production instances of React 18/19 and Node.js REST servers.
Full Stack Engineer at ByteCode Corp (2020 - 2023)
- Engineered database schemas with PostgreSQL and Express.
- Developed cloud deployments with Docker.

Education:
MS in Computer Science, Stanford University (2020)`,
    analysis: {
      atsScore: 94,
      skillsMatch: 95,
      keywordMatch: 92,
      experienceMatch: 96,
      educationMatch: 95,
      matchBreakdown: {
        skills: 95,
        keywords: 92,
        experience: 96,
        education: 95
      },
      skills: ['React', 'Node.js', 'TypeScript', 'Express', 'PostgreSQL', 'System Architecture', 'AI Integration', 'Docker', 'Redis', 'Kubernetes', 'GCP'],
      education: ['MS in Computer Science, Stanford University (2020)', 'BS in Software Engineering, UC Berkeley (2018)'],
      projects: ['SaaS Data Analytics Pipeline with Docker', 'Real-time Event Streaming Engine with Redis'],
      certifications: ['GCP Certified Professional Cloud Architect', 'AWS Developer Associate'],
      experience: [
        'Lead Web Architect at ScaleOps (2023 - Present): Managed team of 6, built real-time Express endpoints, integrated Gemini LLM workflows, reduced latency.',
        'Full Stack Engineer at ByteCode Corp (2020 - 2023): Designed PostgreSQL database queries, improved frontend query times by 40%.'
      ],
      softSkills: ['Team Technical Guidance', 'Analytical Diagnostics', 'Agile Facilitation', 'Collaborative Coordination'],
      strengths: [
        'Exquisite alignment with required tech stack (React, Node, TS, Express, PostgreSQL, Docker)',
        'Extensive architectural background leading microservices at scale',
        'Direct experience with Cloud Run / Google Cloud platforming and AI LLM APIs'
      ],
      weaknesses: [
        'Strong emphasis on enterprise web engines, minor legacy infrastructure handling credentials'
      ],
      missingSkills: [],
      improvementSuggestions: [
        'Add brief metrics regarding security auditing of backend API routes.',
        'Highlight experience with Kubernetes clustering in the core dashboard summary.'
      ]
    }
  },
  {
    id: 'cand-2',
    name: 'Alex Mercer',
    email: 'alex.mercer.dev@innovations.org',
    phone: '+1 (555) 892-0044',
    activeJobId: 'job-1',
    status: 'Shortlisted',
    uploadedAt: new Date('2026-06-16T14:15:00Z').toISOString(),
    resumeFileName: 'alex_mercer_resume.pdf',
    resumeText: `ALEX MERCER
Full Stack Dev. 5 Years Experience. React, UI frameworks, Node.js, TS, Express.
Email: alex.mercer.dev@innovations.org | Phone: +1 (555) 892-0044
Skills: React, React-native, Redux, Node.js, Express, JavaScript, TypeScript, Tailwind CSS, MongoDB, Git

Experience:
Senior Developer - DevSuite Labs (2022 - Present)
- Developed responsive React dashboard layouts.
- Formulated Express API endpoints serving over 50k active daily sessions.
Software Specialist - WebStream Co (2021 - 2022)
- Spearheaded visual overhauls using Tailwind CSS.

Education:
BS in Computer Science, Ohio State University`,
    analysis: {
      atsScore: 82,
      skillsMatch: 80,
      keywordMatch: 85,
      experienceMatch: 85,
      educationMatch: 80,
      matchBreakdown: {
        skills: 80,
        keywords: 85,
        experience: 85,
        education: 80
      },
      skills: ['React', 'Node.js', 'Express', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux', 'MongoDB', 'Git'],
      education: ['BS in Computer Science, Ohio State University (2021)'],
      projects: ['Responsive Analytics Board (React + ChartJS)', 'Cross-platform Mobile Booking App (React Native)'],
      certifications: ['Certified React Native Expert'],
      experience: [
        'Senior Developer at DevSuite Labs (2022 - Present): Crafted modular UI structures, migrated data endpoints to Express server context.',
        'Software Specialist at WebStream Co (2021 - 2022): Integrated state management with Redux, implemented fluid mobile viewports.'
      ],
      softSkills: ['Technical Problem Solving', 'Creative UI Adaptability', 'Active Communications'],
      strengths: [
        'Solid senior-grade capabilities in client-side React architectures and Tailwind visual designs',
        'Strong competence building unified REST structures and state models'
      ],
      weaknesses: [
        'Lacks standard relational database handling (primarily MongoDB, missing PostgreSQL)',
        'No mentioned expertise with containerizing/managing services like Docker or cloud platform systems'
      ],
      missingSkills: ['PostgreSQL', 'Docker', 'System Architecture', 'AI Integration'],
      improvementSuggestions: [
        'Gain experience or certifications related to relational DB modeling and query design.',
        'Add details of system design achievements or pipeline design.'
      ]
    }
  },
  {
    id: 'cand-3',
    name: 'Chloe Vance',
    email: 'chloe.vance@designstudio.io',
    phone: '+1 (555) 211-5582',
    activeJobId: 'job-2',
    status: 'Screened',
    uploadedAt: new Date('2026-06-17T09:00:00Z').toISOString(),
    resumeFileName: 'chloe_vance_product_design.pdf',
    resumeText: `CHLOE VANCE
Senior Visual & Interaction Designer | Figma Expert | User Discovery
Email: chloe.vance@designstudio.io | Phone: +1 (555) 211-5582
Skills: Figma, Design Systems, Wireframing, User Research, Prototyping, Adobe Creative Cloud, Typography

Experience:
UX Design Specialist at Greenhouse Soft (2022 - Present)
- Built interactive mockups and standardized spacing catalogs.
- Led recruiter workflow feedback study with over 40 corporate representatives.
Visual Designer at PixelForge (2020 - 2022)
- Formed identity systems and vector design assets.

Education:
BFA in Communication Design, Pratt Institute`,
    analysis: {
      atsScore: 85,
      skillsMatch: 88,
      keywordMatch: 80,
      experienceMatch: 90,
      educationMatch: 80,
      matchBreakdown: {
        skills: 88,
        keywords: 80,
        experience: 90,
        education: 80
      },
      skills: ['Figma', 'Design Systems', 'Wireframing', 'User Research', 'Prototyping', 'Adobe Creative Cloud', 'Typography', 'UI/UX Design'],
      education: ['BFA in Communication Design, Pratt Institute (2020)'],
      projects: ['Recruiter ATS Interactive Design System', 'Ecommerce Unified Mobile Checkout overhaul'],
      certifications: [],
      experience: [
        'UX Design Specialist at Greenhouse Soft (2022 - Present): Maintained a standard figma workspace consisting of over 300 UI components, organized user research sessions.',
        'Visual Designer at PixelForge (2020 - 2022): Shaped interactive user menus and micro-animations, oversaw pixel layouts.'
      ],
      softSkills: ['Empathy Advocacy', 'Aesthetic Strategy', 'Active Team Synthesizer'],
      strengths: [
        'Exceptional Figma craftsmanship with high-end, responsive system construction',
        'Deep practical immersion in UX discovery, feedback loops, and design sprints'
      ],
      weaknesses: [
        'No direct resume documentation indicating Tailwind CSS coding proficiency'
      ],
      missingSkills: ['Tailwind CSS'],
      improvementSuggestions: [
        'Mention basic static web builds or HTML/Tailwind styling contributions to facilitate better handoffs with engineering.'
      ]
    }
  },
  {
    id: 'cand-4',
    name: 'Marcus Chen',
    email: 'marcus.m.chen@analyticsnet.org',
    phone: '+1 (555) 723-9911',
    activeJobId: 'job-3',
    status: 'New',
    uploadedAt: new Date('2026-06-17T15:45:00Z').toISOString(),
    resumeFileName: 'marcus_chen_data.pdf',
    resumeText: `MARCUS CHEN
Data Analyst with 3 years of experience. Machine Learning, Python, Pandas, SQL.
Email: marcus.m.chen@analyticsnet.org | Phone: +1 (555) 723-9911
Skills: Python, SQL, PostgreSQL, Pandas, NumPy, Tableau, Machine Learning, Git

Experience:
Data Analyst at FinMetric Corp (2023 - Present)
- Configured PostgreSQL dashboard queries.
- Trained predictive models using Scikit-Learn.

Education:
BS in Applied Mathematics, University of Michigan`,
    analysis: {
      atsScore: 65,
      skillsMatch: 60,
      keywordMatch: 70,
      experienceMatch: 68,
      educationMatch: 70,
      matchBreakdown: {
        skills: 60,
        keywords: 70,
        experience: 68,
        education: 70
      },
      skills: ['Python', 'SQL', 'PostgreSQL', 'Pandas', 'NumPy', 'Machine Learning', 'Git'],
      education: ['BS in Applied Mathematics, University of Michigan (2023)'],
      projects: ['Fraud Detection Pattern Models', 'Customer Churn Analysis and SQL triggers'],
      certifications: [],
      experience: [
        'Data Analyst at FinMetric Corp (2023 - Present): Wrote structured CTEs, clean pipeline migrations, designed basic clustering templates.'
      ],
      softSkills: ['Methodical Integrity', 'Collaborative Integration'],
      strengths: [
        'Competent math and core numerical stack mastery (Python, NumPy, Pandas)',
        'Great foundational SQL schema architecture and basic forecasting models'
      ],
      weaknesses: [
        'Missing modern Natural Language Processing (NLP) or conversational LLM integrations',
        'Lacks frameworks like PyTorch or TensorFlow for advanced generative pipelines'
      ],
      missingSkills: ['NLP', 'Large Language Models', 'PyTorch', 'Data Science', 'TensorFlow', 'Data Engineering'],
      improvementSuggestions: [
        'Develop open-source project models using Gemini API or Langchain to showcase AI grounding capabilities.',
        'Learn deep learning libraries like PyTorch or TensorFlow.'
      ]
    }
  }
];

class Database {
  private data: DatabaseSchema = {
    users: [],
    jobDescriptions: DEFAULT_JOBS,
    candidates: DEFAULT_CANDIDATES
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          users: parsed.users || [],
          jobDescriptions: parsed.jobDescriptions || DEFAULT_JOBS,
          candidates: parsed.candidates || DEFAULT_CANDIDATES
        };
      } else {
        this.save();
      }
    } catch {
      // Suppress, fall back to default
      this.save();
    }
  }

  private save() {
    try {
      // Create parent directories if they don't exist
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database', e);
    }
  }

  // Users Auth
  getUsers(): AuthUser[] {
    return this.data.users;
  }

  addUser(user: AuthUser): void {
    this.data.users.push(user);
    this.save();
  }

  // Jobs
  getJobDescriptions(): JobDescription[] {
    return this.data.jobDescriptions;
  }

  getJob(id: string): JobDescription | undefined {
    return this.data.jobDescriptions.find(j => j.id === id);
  }

  addJobDescription(job: JobDescription): void {
    this.data.jobDescriptions.unshift(job);
    this.save();
  }

  updateJobDescription(job: JobDescription): void {
    const idx = this.data.jobDescriptions.findIndex(j => j.id === job.id);
    if (idx !== -1) {
      this.data.jobDescriptions[idx] = job;
      this.save();
    }
  }

  deleteJobDescription(id: string): void {
    this.data.jobDescriptions = this.data.jobDescriptions.filter(j => j.id !== id);
    // Cascade delete or clean up candidates activeJobId? Or leave as is.
    this.save();
  }

  // Candidates
  getCandidates(): Candidate[] {
    return this.data.candidates;
  }

  getCandidate(id: string): Candidate | undefined {
    return this.data.candidates.find(c => c.id === id);
  }

  addCandidate(candidate: Candidate): void {
    this.data.candidates.unshift(candidate);
    this.save();
  }

  updateCandidateStatus(id: string, status: Candidate['status']): void {
    const candidate = this.data.candidates.find(c => c.id === id);
    if (candidate) {
      candidate.status = status;
      this.save();
    }
  }

  deleteCandidate(id: string): void {
    this.data.candidates = this.data.candidates.filter(c => c.id !== id);
    this.save();
  }
}

export const db = new Database();
