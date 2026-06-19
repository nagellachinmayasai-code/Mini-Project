// Skills Sanitization, Normalization, and Categorization Utility

export interface CategorizedSkills {
  'Programming Languages': string[];
  'Web Technologies': string[];
  'Databases': string[];
  'Tools & Platforms': string[];
  'Cloud Technologies': string[];
  'Frameworks & Libraries': string[];
  'Soft Skills': string[];
}

// Extensive canonical map of synonym/raw-term to normalized term and category
export const SKILLS_TAXONOMY: Record<string, { name: string; category: keyof CategorizedSkills }> = {
  // Programming Languages
  'javascript': { name: 'JavaScript', category: 'Programming Languages' },
  'js': { name: 'JavaScript', category: 'Programming Languages' },
  'typescript': { name: 'TypeScript', category: 'Programming Languages' },
  'ts': { name: 'TypeScript', category: 'Programming Languages' },
  'python': { name: 'Python', category: 'Programming Languages' },
  'py': { name: 'Python', category: 'Programming Languages' },
  'java': { name: 'Java', category: 'Programming Languages' },
  'c++': { name: 'C++', category: 'Programming Languages' },
  'cpp': { name: 'C++', category: 'Programming Languages' },
  'c#': { name: 'C#', category: 'Programming Languages' },
  'csharp': { name: 'C#', category: 'Programming Languages' },
  'ruby': { name: 'Ruby', category: 'Programming Languages' },
  'rb': { name: 'Ruby', category: 'Programming Languages' },
  'go': { name: 'Go', category: 'Programming Languages' },
  'golang': { name: 'Go', category: 'Programming Languages' },
  'rust': { name: 'Rust', category: 'Programming Languages' },
  'php': { name: 'PHP', category: 'Programming Languages' },
  'swift': { name: 'Swift', category: 'Programming Languages' },
  'kotlin': { name: 'Kotlin', category: 'Programming Languages' },
  'scala': { name: 'Scala', category: 'Programming Languages' },
  'objective-c': { name: 'Objective-C', category: 'Programming Languages' },
  'objective c': { name: 'Objective-C', category: 'Programming Languages' },
  'bash': { name: 'Bash', category: 'Programming Languages' },
  'sh': { name: 'Shell Scripting', category: 'Programming Languages' },
  'shell': { name: 'Shell Scripting', category: 'Programming Languages' },
  'shell scripting': { name: 'Shell Scripting', category: 'Programming Languages' },
  'powershell': { name: 'PowerShell', category: 'Programming Languages' },
  'r': { name: 'R', category: 'Programming Languages' },
  'perl': { name: 'Perl', category: 'Programming Languages' },
  'dart': { name: 'Dart', category: 'Programming Languages' },
  'haskell': { name: 'Haskell', category: 'Programming Languages' },
  'assembly': { name: 'Assembly', category: 'Programming Languages' },
  'clojure': { name: 'Clojure', category: 'Programming Languages' },
  'elixir': { name: 'Elixir', category: 'Programming Languages' },
  'erlang': { name: 'Erlang', category: 'Programming Languages' },

  // Frameworks & Libraries
  'react': { name: 'React', category: 'Frameworks & Libraries' },
  'reactjs': { name: 'React', category: 'Frameworks & Libraries' },
  'react.js': { name: 'React', category: 'Frameworks & Libraries' },
  'angular': { name: 'Angular', category: 'Frameworks & Libraries' },
  'angularjs': { name: 'Angular', category: 'Frameworks & Libraries' },
  'angular.js': { name: 'Angular', category: 'Frameworks & Libraries' },
  'vue': { name: 'Vue', category: 'Frameworks & Libraries' },
  'vuejs': { name: 'Vue', category: 'Frameworks & Libraries' },
  'vue.js': { name: 'Vue', category: 'Frameworks & Libraries' },
  'svelte': { name: 'Svelte', category: 'Frameworks & Libraries' },
  'nextjs': { name: 'Next.js', category: 'Frameworks & Libraries' },
  'next.js': { name: 'Next.js', category: 'Frameworks & Libraries' },
  'nodejs': { name: 'Node.js', category: 'Frameworks & Libraries' },
  'node.js': { name: 'Node.js', category: 'Frameworks & Libraries' },
  'node': { name: 'Node.js', category: 'Frameworks & Libraries' },
  'express': { name: 'Express.js', category: 'Frameworks & Libraries' },
  'expressjs': { name: 'Express.js', category: 'Frameworks & Libraries' },
  'express.js': { name: 'Express.js', category: 'Frameworks & Libraries' },
  'django': { name: 'Django', category: 'Frameworks & Libraries' },
  'flask': { name: 'Flask', category: 'Frameworks & Libraries' },
  'spring boot': { name: 'Spring Boot', category: 'Frameworks & Libraries' },
  'springboot': { name: 'Spring Boot', category: 'Frameworks & Libraries' },
  'spring': { name: 'Spring Boot', category: 'Frameworks & Libraries' },
  'laravel': { name: 'Laravel', category: 'Frameworks & Libraries' },
  'fastapi': { name: 'FastAPI', category: 'Frameworks & Libraries' },
  'nestjs': { name: 'NestJS', category: 'Frameworks & Libraries' },
  'nest': { name: 'NestJS', category: 'Frameworks & Libraries' },
  'asp.net': { name: 'ASP.NET', category: 'Frameworks & Libraries' },
  'asp.net core': { name: 'ASP.NET Core', category: 'Frameworks & Libraries' },
  'dotnet': { name: '.NET', category: 'Frameworks & Libraries' },
  '.net': { name: '.NET', category: 'Frameworks & Libraries' },
  'jquery': { name: 'jQuery', category: 'Frameworks & Libraries' },
  'redux': { name: 'Redux', category: 'Frameworks & Libraries' },
  'redux-toolkit': { name: 'Redux', category: 'Frameworks & Libraries' },
  'rtk': { name: 'Redux', category: 'Frameworks & Libraries' },
  'tailwind': { name: 'Tailwind CSS', category: 'Frameworks & Libraries' },
  'tailwindcss': { name: 'Tailwind CSS', category: 'Frameworks & Libraries' },
  'bootstrap': { name: 'Bootstrap', category: 'Frameworks & Libraries' },
  'sass': { name: 'Sass', category: 'Frameworks & Libraries' },
  'scss': { name: 'Sass', category: 'Frameworks & Libraries' },
  'less': { name: 'Less', category: 'Frameworks & Libraries' },
  'pytorch': { name: 'PyTorch', category: 'Frameworks & Libraries' },
  'tensorflow': { name: 'TensorFlow', category: 'Frameworks & Libraries' },
  'tf': { name: 'TensorFlow', category: 'Frameworks & Libraries' },
  'keras': { name: 'Keras', category: 'Frameworks & Libraries' },
  'pandas': { name: 'Pandas', category: 'Frameworks & Libraries' },
  'numpy': { name: 'NumPy', category: 'Frameworks & Libraries' },
  'scikit-learn': { name: 'Scikit-Learn', category: 'Frameworks & Libraries' },
  'scikitlearn': { name: 'Scikit-Learn', category: 'Frameworks & Libraries' },
  'sklearn': { name: 'Scikit-Learn', category: 'Frameworks & Libraries' },
  'matplotlib': { name: 'Matplotlib', category: 'Frameworks & Libraries' },
  'seaborn': { name: 'Seaborn', category: 'Frameworks & Libraries' },
  'huggingface': { name: 'Hugging Face', category: 'Frameworks & Libraries' },
  'hugging face': { name: 'Hugging Face', category: 'Frameworks & Libraries' },
  'opencv': { name: 'OpenCV', category: 'Frameworks & Libraries' },
  'graphql': { name: 'GraphQL', category: 'Frameworks & Libraries' },
  'hibernate': { name: 'Hibernate', category: 'Frameworks & Libraries' },
  'prisma': { name: 'Prisma', category: 'Frameworks & Libraries' },
  'drizzle': { name: 'Drizzle ORM', category: 'Frameworks & Libraries' },
  'sequelize': { name: 'Sequelize', category: 'Frameworks & Libraries' },
  'mongoose': { name: 'Mongoose', category: 'Frameworks & Libraries' },
  'flutter': { name: 'Flutter', category: 'Frameworks & Libraries' },
  'react native': { name: 'React Native', category: 'Frameworks & Libraries' },
  'xamarin': { name: 'Xamarin', category: 'Frameworks & Libraries' },
  'ionic': { name: 'Ionic', category: 'Frameworks & Libraries' },
  'playwright': { name: 'Playwright', category: 'Frameworks & Libraries' },
  'cypress': { name: 'Cypress', category: 'Frameworks & Libraries' },
  'jest': { name: 'Jest', category: 'Frameworks & Libraries' },
  'mocha': { name: 'Mocha', category: 'Frameworks & Libraries' },
  'selenium': { name: 'Selenium', category: 'Frameworks & Libraries' },

  // Web Technologies (Core specifications and standards)
  'html': { name: 'HTML', category: 'Web Technologies' },
  'html5': { name: 'HTML', category: 'Web Technologies' },
  'css': { name: 'CSS', category: 'Web Technologies' },
  'css3': { name: 'CSS', category: 'Web Technologies' },
  'rest': { name: 'REST API', category: 'Web Technologies' },
  'rest api': { name: 'REST API', category: 'Web Technologies' },
  'restful api': { name: 'REST API', category: 'Web Technologies' },
  'restful apis': { name: 'REST API', category: 'Web Technologies' },
  'apis': { name: 'REST API', category: 'Web Technologies' },
  'web3': { name: 'Web3', category: 'Web Technologies' },
  'solidity': { name: 'Solidity', category: 'Web Technologies' },
  'pwa': { name: 'PWA', category: 'Web Technologies' },
  'progressive web app': { name: 'PWA', category: 'Web Technologies' },
  'websocket': { name: 'WebSockets', category: 'Web Technologies' },
  'websockets': { name: 'WebSockets', category: 'Web Technologies' },
  'ajax': { name: 'AJAX', category: 'Web Technologies' },
  'oauth': { name: 'OAuth 2.0', category: 'Web Technologies' },
  'oauth2': { name: 'OAuth 2.0', category: 'Web Technologies' },
  'saml': { name: 'SAML', category: 'Web Technologies' },
  'jwt': { name: 'JWT', category: 'Web Technologies' },
  'json web token': { name: 'JWT', category: 'Web Technologies' },
  'cors': { name: 'CORS', category: 'Web Technologies' },
  'seo': { name: 'SEO', category: 'Web Technologies' },
  'sem': { name: 'SEM', category: 'Web Technologies' },
  'json': { name: 'JSON', category: 'Web Technologies' },
  'xml': { name: 'XML', category: 'Web Technologies' },
  'http': { name: 'HTTP', category: 'Web Technologies' },
  'grpc': { name: 'gRPC', category: 'Web Technologies' },
  'soap': { name: 'SOAP', category: 'Web Technologies' },

  // Databases
  'sql': { name: 'SQL', category: 'Databases' },
  'mysql': { name: 'MySQL', category: 'Databases' },
  'postgresql': { name: 'PostgreSQL', category: 'Databases' },
  'postgres': { name: 'PostgreSQL', category: 'Databases' },
  'mongodb': { name: 'MongoDB', category: 'Databases' },
  'mongo': { name: 'MongoDB', category: 'Databases' },
  'redis': { name: 'Redis', category: 'Databases' },
  'sqlite': { name: 'SQLite', category: 'Databases' },
  'mariadb': { name: 'MariaDB', category: 'Databases' },
  'cassandra': { name: 'Cassandra', category: 'Databases' },
  'dynamodb': { name: 'DynamoDB', category: 'Databases' },
  'neo4j': { name: 'Neo4j', category: 'Databases' },
  'firestore': { name: 'Firestore', category: 'Databases' },
  'supabase': { name: 'Supabase', category: 'Databases' },
  'firebase': { name: 'Firebase', category: 'Databases' },
  'oracle': { name: 'Oracle', category: 'Databases' },
  'elasticsearch': { name: 'Elasticsearch', category: 'Databases' },
  'db2': { name: 'IBM DB2', category: 'Databases' },
  'ibm db2': { name: 'IBM DB2', category: 'Databases' },
  'ms sql': { name: 'MS SQL Server', category: 'Databases' },
  'sql server': { name: 'MS SQL Server', category: 'Databases' },
  'mssql': { name: 'MS SQL Server', category: 'Databases' },
  'influxdb': { name: 'InfluxDB', category: 'Databases' },
  'snowflake': { name: 'Snowflake', category: 'Databases' },
  'redshift': { name: 'Amazon Redshift', category: 'Databases' },
  'bigquery': { name: 'Google BigQuery', category: 'Databases' },
  'couchdb': { name: 'CouchDB', category: 'Databases' },

  // Cloud Technologies
  'aws': { name: 'AWS', category: 'Cloud Technologies' },
  'amazon web services': { name: 'AWS', category: 'Cloud Technologies' },
  'azure': { name: 'Azure', category: 'Cloud Technologies' },
  'microsoft azure': { name: 'Azure', category: 'Cloud Technologies' },
  'gcp': { name: 'GCP', category: 'Cloud Technologies' },
  'google cloud': { name: 'GCP', category: 'Cloud Technologies' },
  'google cloud platform': { name: 'GCP', category: 'Cloud Technologies' },
  'heroku': { name: 'Heroku', category: 'Cloud Technologies' },
  'netlify': { name: 'Netlify', category: 'Cloud Technologies' },
  'vercel': { name: 'Vercel', category: 'Cloud Technologies' },
  'digitalocean': { name: 'DigitalOcean', category: 'Cloud Technologies' },
  'digital ocean': { name: 'DigitalOcean', category: 'Cloud Technologies' },
  'cloudflare': { name: 'Cloudflare', category: 'Cloud Technologies' },
  'openshift': { name: 'OpenShift', category: 'Cloud Technologies' },
  'ecs': { name: 'Amazon ECS', category: 'Cloud Technologies' },
  'eks': { name: 'Amazon EKS', category: 'Cloud Technologies' },
  's3': { name: 'Amazon S3', category: 'Cloud Technologies' },
  'lambda': { name: 'AWS Lambda', category: 'Cloud Technologies' },

  // Tools & Platforms
  'git': { name: 'Git', category: 'Tools & Platforms' },
  'github': { name: 'Git', category: 'Tools & Platforms' },
  'gitlab': { name: 'Git', category: 'Tools & Platforms' },
  'docker': { name: 'Docker', category: 'Tools & Platforms' },
  'kubernetes': { name: 'Kubernetes', category: 'Tools & Platforms' },
  'k8s': { name: 'Kubernetes', category: 'Tools & Platforms' },
  'terraform': { name: 'Terraform', category: 'Tools & Platforms' },
  'jenkins': { name: 'Jenkins', category: 'Tools & Platforms' },
  'jira': { name: 'Jira', category: 'Tools & Platforms' },
  'figma': { name: 'Figma', category: 'Tools & Platforms' },
  'canva': { name: 'Canva', category: 'Tools & Platforms' },
  'tableau': { name: 'Tableau', category: 'Tools & Platforms' },
  'power bi': { name: 'Power BI', category: 'Tools & Platforms' },
  'powerbi': { name: 'Power BI', category: 'Tools & Platforms' },
  'excel': { name: 'Excel', category: 'Tools & Platforms' },
  'scrum': { name: 'Scrum', category: 'Tools & Platforms' },
  'agile': { name: 'Agile', category: 'Tools & Platforms' },
  'devops': { name: 'DevOps', category: 'Tools & Platforms' },
  'ci/cd': { name: 'CI/CD', category: 'Tools & Platforms' },
  'cicd': { name: 'CI/CD', category: 'Tools & Platforms' },
  'webpack': { name: 'Webpack', category: 'Tools & Platforms' },
  'vite': { name: 'Vite', category: 'Tools & Platforms' },
  'postman': { name: 'Postman', category: 'Tools & Platforms' },
  'ansible': { name: 'Ansible', category: 'Tools & Platforms' },
  'linux': { name: 'Linux', category: 'Tools & Platforms' },
  'unix': { name: 'Unix', category: 'Tools & Platforms' },
  'npm': { name: 'NPM', category: 'Tools & Platforms' },
  'yarn': { name: 'Yarn', category: 'Tools & Platforms' },
  'pnpm': { name: 'PNPN', category: 'Tools & Platforms' },
  'unity': { name: 'Unity', category: 'Tools & Platforms' },
  'unreal engine': { name: 'Unreal Engine', category: 'Tools & Platforms' },
  'unreal': { name: 'Unreal Engine', category: 'Tools & Platforms' },
  'photoshop': { name: 'Adobe Photoshop', category: 'Tools & Platforms' },
  'illustrator': { name: 'Adobe Illustrator', category: 'Tools & Platforms' },
  'adobe xd': { name: 'Adobe XD', category: 'Tools & Platforms' },
  'xd': { name: 'Adobe XD', category: 'Tools & Platforms' },
  'gradle': { name: 'Gradle', category: 'Tools & Platforms' },
  'maven': { name: 'Maven', category: 'Tools & Platforms' },
  'prometheus': { name: 'Prometheus', category: 'Tools & Platforms' },
  'grafana': { name: 'Grafana', category: 'Tools & Platforms' },
  'elastic stack': { name: 'Elastic Stack', category: 'Tools & Platforms' },
  'elk': { name: 'Elastic Stack', category: 'Tools & Platforms' },

  // Soft Skills
  'communication': { name: 'Communication', category: 'Soft Skills' },
  'leadership': { name: 'Leadership', category: 'Soft Skills' },
  'teamwork': { name: 'Teamwork', category: 'Soft Skills' },
  'collaboration': { name: 'Collaboration', category: 'Soft Skills' },
  'problem solving': { name: 'Problem Solving', category: 'Soft Skills' },
  'problem-solving': { name: 'Problem Solving', category: 'Soft Skills' },
  'time management': { name: 'Time Management', category: 'Soft Skills' },
  'adaptability': { name: 'Adaptability', category: 'Soft Skills' },
  'creativity': { name: 'Creativity', category: 'Soft Skills' },
  'critical thinking': { name: 'Critical Thinking', category: 'Soft Skills' },
  'work ethic': { name: 'Work Ethic', category: 'Soft Skills' },
  'interpersonal': { name: 'Interpersonal Skills', category: 'Soft Skills' },
  'interpersonal skills': { name: 'Interpersonal Skills', category: 'Soft Skills' },
  'emotional intelligence': { name: 'Emotional Intelligence', category: 'Soft Skills' },
  'negotiation': { name: 'Negotiation', category: 'Soft Skills' },
  'conflict resolution': { name: 'Conflict Resolution', category: 'Soft Skills' },
  'public speaking': { name: 'Public Speaking', category: 'Soft Skills' },
  'active listening': { name: 'Active Listening', category: 'Soft Skills' },
  'mentoring': { name: 'Mentorship', category: 'Soft Skills' },
  'mentorship': { name: 'Mentorship', category: 'Soft Skills' },
  'problem solver': { name: 'Problem Solving', category: 'Soft Skills' },
  'analytical': { name: 'Analytical Thinking', category: 'Soft Skills' },
  'analytical skills': { name: 'Analytical Thinking', category: 'Soft Skills' },
  'presentation': { name: 'Presentations', category: 'Soft Skills' },
  'presentation skills': { name: 'Presentations', category: 'Soft Skills' }
};

// Explicitly ignored keywords/descriptive words that must never be treated as valid skills
export const BLACKLIST_WORDS = new Set([
  'and', 'or', 'for', 'the', 'with', 'from', 'to', 'on', 'of', 'at', 'by', 'an', 'a', 'in', 'is', 'as',
  'real', 'chat', 'developed', 'designed', 'implemented', 'building', 'prototype', 'project',
  'headings', 'heading', 'section', 'experience', 'description', 'profile', 'multi-user', 'based',
  'user', 'testing', 'deployment', 'framework', 'frameworks', 'languages', 'tool', 'tools',
  'technology', 'technologies', 'concept', 'concepts', 'etc', 'other', 'various', 'application',
  'applications', 'database', 'databases', 'platform', 'platforms', 'system', 'systems', 'service',
  'services', 'solution', 'solutions', 'accessibility', 'responsiveness', 'developed a multi', 'user real',
  'based prototype', 'responsive', 'mobile', 'web', 'frontend', 'backend', 'fullstack', 'full-stack',
  'developer', 'engineer', 'making', 'created', 'creating', 'work', 'school', 'degree', 'resume', 'cv',
  'summary', 'about', 'detail', 'details', 'contact', 'information', 'phone', 'email', 'website', 'link',
  'github.com', 'linkedin.com', 'http', 'https', 'www', 'com', 'org', 'net', 'edu', 'key', 'role', 'roles',
  'team', 'teams', 'management', 'manager', 'lead', 'analysis', 'analyst', 'design', 'designer', 'program',
  'programmer', 'code', 'coding', 'development', 'software', 'using', 'build', 'implemented with',
  'expert in', 'proficient', 'knowledge', 'understanding', 'ability', 'focused', 'including', 'skills',
  'candidate', 'recruiter', 'job', 'description', 'requirements', 'responsibilities', 'duties', 'achievements',
  'achievement', 'accomplishment', 'accomplishments', 'responsiveness', 'accessibility', 'sentence',
  'fragment', 'fragments', 'word', 'words', 'random', 'title', 'titles', 'interactive', 'main', 'secondary'
]);

export function cleanAndCategorizeSkills(
  skills: string[],
  softSkills: string[] = []
): { cleanedSkills: string[]; cleanedSoftSkills: string[]; categorized: CategorizedSkills } {
  const result: CategorizedSkills = {
    'Programming Languages': [],
    'Web Technologies': [],
    'Databases': [],
    'Tools & Platforms': [],
    'Cloud Technologies': [],
    'Frameworks & Libraries': [],
    'Soft Skills': []
  };

  const added = new Set<string>();

  const processRawSkill = (raw: string, isForcedSoft = false) => {
    if (!raw) return;

    // Clean brackets, quotes, bullet markers, dashes, or star symbols
    let cleanVal = raw.replace(/[\[\]"'\(\)•\-\*]/g, '').trim();
    if (cleanVal.length < 2 || cleanVal.length > 30) return;

    const lower = cleanVal.toLowerCase();

    // 1. Exclude if any exact match of the value or segments is part of Blacklisted phrases
    if (BLACKLIST_WORDS.has(lower)) return;

    // 2. Split into words to perform strict word-level blacklist filtering
    const words = cleanVal.split(/\s+/).filter(w => w.length > 0);
    const containsBlacklist = words.some(w => {
      const wClean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      return BLACKLIST_WORDS.has(wClean) || BLACKLIST_WORDS.has(w.toLowerCase());
    });
    if (containsBlacklist) {
      return;
    }

    // 3. Reject long list descriptors or project snippets (if length > 2 words and not found exactly in target taxonomy)
    if (words.length > 2 && !SKILLS_TAXONOMY[lower]) {
      return; // Reject sentence fragments, achievement text, headers or descriptive titles
    }

    // 4. Reject pure numeric strings or strings with no letters
    if (/^\d+$/.test(cleanVal) || !/[a-zA-Z]/.test(cleanVal)) {
      return;
    }

    // 5. Look up strictly against predefined SKILLS_TAXONOMY.
    // If it's a valid technical/soft skill, it MUST match an entry in our taxonomy exactly or as a clean synonym.
    if (SKILLS_TAXONOMY[lower]) {
      const entry = SKILLS_TAXONOMY[lower];
      const targetCategory = isForcedSoft ? 'Soft Skills' : entry.category;
      const normKey = `${targetCategory}:${entry.name}`;
      if (!added.has(normKey)) {
        added.add(normKey);
        result[targetCategory].push(entry.name);
      }
      return;
    }

    // 6. Support fuzzy lookup or synonym match with other taxonomy elements (e.g., lowercase sub-phrase match)
    for (const taxonomyKey of Object.keys(SKILLS_TAXONOMY)) {
      if (taxonomyKey.length >= 3 && (lower === taxonomyKey || lower.includes(` ${taxonomyKey}`) || lower.endsWith(` ${taxonomyKey}`))) {
        const entry = SKILLS_TAXONOMY[taxonomyKey];
        const targetCategory = isForcedSoft ? 'Soft Skills' : entry.category;
        const normKey = `${targetCategory}:${entry.name}`;
        if (!added.has(normKey)) {
          added.add(normKey);
          result[targetCategory].push(entry.name);
        }
        return;
      }
    }

    // If it passes all other blacklist filters and represents a 1-2 word soft skill, map it directly for softSkills matching
    if (isForcedSoft && words.length <= 2) {
      const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const normKey = `Soft Skills:${capitalized}`;
      if (!added.has(normKey)) {
        added.add(normKey);
        result['Soft Skills'].push(capitalized);
      }
    }
  };

  // Process technical skills
  skills.forEach(skill => processRawSkill(skill, false));

  // Process soft skills (forcing Soft Skills classification)
  softSkills.forEach(skill => processRawSkill(skill, true));

  // Consolidate list elements
  const cleanedSkills: string[] = [];
  const cleanedSoftSkills: string[] = [];

  for (const cat of Object.keys(result) as Array<keyof CategorizedSkills>) {
    if (cat === 'Soft Skills') {
      cleanedSoftSkills.push(...result[cat]);
    } else {
      cleanedSkills.push(...result[cat]);
    }
  }

  return {
    cleanedSkills,
    cleanedSoftSkills,
    categorized: result
  };
}

/**
 * Calculates a verified ATS score based only on validated skills.
 * - Skills Match (40%): proportion of job's required keySkills present in the candidate's validated/cleaned skills list.
 * - Combined Weighted ATS score (100%): 40% skillsMatch + 30% keywordMatch + 20% experienceMatch + 10% educationMatch.
 */
export function calculateValidatedMatchScores(
  validatedSkills: string[],
  jobKeySkills: string[],
  keywordMatch: number,
  experienceMatch: number,
  educationMatch: number
): { skillsMatch: number; atsScore: number } {
  let skillsMatch = 0;
  if (jobKeySkills && jobKeySkills.length > 0) {
    const valSkillsLower = validatedSkills.map(s => s.toLowerCase());
    const matches = jobKeySkills.filter(reqSkill => {
      const rLower = reqSkill.toLowerCase();
      // Match if they are exactly equal, or if one is a substring of another
      return valSkillsLower.some(candSkill => 
        candSkill === rLower || candSkill.includes(rLower) || rLower.includes(candSkill)
      );
    }).length;
    skillsMatch = Math.round((matches / jobKeySkills.length) * 100);
  } else {
    skillsMatch = 100;
  }

  const atsScore = Math.round(
    (skillsMatch * 0.40) +
    (keywordMatch * 0.30) +
    (experienceMatch * 0.20) +
    (educationMatch * 0.10)
  );

  return { skillsMatch, atsScore };
}

