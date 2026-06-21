import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function main() {
  const dbData = JSON.parse(fs.readFileSync('src_db_store.json', 'utf8'));
  const activeJob = dbData.jobDescriptions.find((j: any) => j.id === 'job-1781967584977');
  const candidate = dbData.candidates.find((c: any) => c.id === 'cand-1781968285608');

  if (!activeJob || !candidate) {
    console.error('Job or Candidate not found in DB!');
    return;
  }

  const textContext = candidate.resumeText;

  let queryPrompt = `You are a professional hiring manager and ATS screening agent.
Analyze this resume in detail, extracting candidate information and grading them against the following Job Description.

JOB DESCRIPTION DETAILS:
Job Title: ${activeJob.title}
Department: ${activeJob.department}
Experience required: ${activeJob.experienceRequired}
Key Required Skills: ${activeJob.keySkills.join(', ')}
Requirements:
${activeJob.requirements.map((r: any) => ` - ${r}`).join('\n')}
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

  const contents = [{ text: `RESUME TEXT:\n${textContext}\n\n${queryPrompt}` }];

  let response: any;
  const modelsToTry = [
    'gemini-3.5-flash', 
    'gemini-3.1-flash-lite', 
    'gemini-flash-latest'
  ];
  let success = false;

  console.log('Initiating modelsToTry loop...');

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
        console.log('API call succeeded for model:', activeModel);
        break; // Success with this try!
      } catch (err: any) {
        console.log('--- EXCEPTION DETECTED ---');
        console.log('Active model:', activeModel);
        console.log('Try number:', retry);
        console.log('Is last attempt of last model?', (retry === maxRetriesForThisModel && mIdx === modelsToTry.length - 1));
        console.log('Error Name:', err?.name);
        console.log('Error Class/Constructor:', err?.constructor?.name);
        console.log('Error Message:', err?.message);
        console.log('Error Stack Trace:\n', err?.stack);
        console.log('Error Object Keys:', Object.getOwnPropertyNames(err));
        
        const responseJson = JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
        console.log('Full Error Object JSON:\n', responseJson);
        
        // Let's print out the exact status/code properties
        console.log('err.status:', err?.status);
        console.log('err.code:', err?.code);
        console.log('err.statusCode:', err?.statusCode);
        console.log('err.error?.code:', err?.error?.code);
        console.log('err.error?.status:', err?.error?.status);
        
        const errString = err?.message + '\n' + (err?.stack || '');
        const errLower = errString.toLowerCase();
        const status = err?.status || err?.code || err?.statusCode || err?.error?.code || err?.error?.status;
        
        const isOverloaded = errLower.includes('503') || 
                             errLower.includes('unavailable') || 
                             errLower.includes('demand') || 
                             errLower.includes('overloaded') ||
                             status === 503 || status === 'UNAVAILABLE';

        if (isOverloaded && mIdx < modelsToTry.length - 1) {
          console.log(`Model ${activeModel} is currently overloaded. Falling back to the next model...`);
          break;
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
          console.log(`Transient error. Retrying...`);
        } else {
          if (retry === maxRetriesForThisModel && mIdx === modelsToTry.length - 1) {
            console.log('Throwing final error as we exhausted all models & retries!');
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

  if (success) {
    console.log('Final success response keys:', Object.keys(response || {}));
    console.log('Final response text snippet:\n', response.text ? response.text.substring(0, 1000) : 'No response text');
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(response.text);
      console.log('Successfully converted response text to JSON.');
    } catch (parseErr: any) {
      console.log('Failed to parse final text directly. Parsing exception:\n', parseErr);
    }
  }
}

main().catch(e => {
  console.log('=== MAIN CRASHED WITH ERROR ===');
  console.log(e);
});
