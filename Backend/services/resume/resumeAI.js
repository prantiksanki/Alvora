const axios = require('axios');
const logger = require('../../utils/logger');

const callGemini = async (prompt) => {
  const { data } = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'google/gemini-2.5-flash-lite',
      messages: [
        {
          role: 'system',
          content: `You are an expert resume writer and ATS optimization specialist.
Your task is to tailor a developer's resume for a specific job posting.

CRITICAL RULES — violating these is not acceptable:
1. ONLY use projects and experience that are explicitly provided in the input data
2. NEVER invent, fabricate, or hallucinate any project, metric, technology, or achievement
3. If a project has no quantifiable metrics in its description/README, write bullets WITHOUT numbers
4. Output ONLY valid JSON — no markdown fences, no explanation, no preamble
5. Select the 3-4 projects that BEST match the job requirements from what is provided`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  let raw = data.choices?.[0]?.message?.content || '{}';
  raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  return JSON.parse(raw);
};

const matchAndGenerate = async ({ jobDescription, githubAnalysis, masterResume }) => {
  const job = jobDescription.structured;

  // Build the project pool from GitHub + master resume (deduplicated)
  const ghProjects = (githubAnalysis.repos || []).map((r) => ({
    source: 'github',
    name: r.name,
    description: r.description,
    summary: r.summary,
    techStack: r.skillTags,
    readme: r.readme?.slice(0, 600),
    stars: r.stars,
    githubUrl: r.githubUrl,
  }));

  const resumeProjects = (masterResume.structured?.projects || []).map((p) => ({
    source: 'resume',
    name: p.name,
    description: p.description,
    summary: p.description,
    techStack: p.techStack,
    bullets: p.bullets,
    githubUrl: p.githubUrl || '',
  }));

  const allProjects = [...ghProjects, ...resumeProjects];
  const currentSkills = masterResume.structured?.skills || [];

  const prompt = `You must tailor this resume for the job posting below.

=== JOB POSTING ===
Title: ${jobDescription.title}
Company: ${jobDescription.company}
Role Type: ${job.roleType}
Seniority: ${job.seniorityLevel}
Required Skills: ${(job.requiredSkills || []).join(', ')}
Preferred Skills: ${(job.preferredSkills || []).join(', ')}
ATS Keywords: ${(job.atsKeywords || []).join(', ')}
Technologies: ${(job.technologies || []).join(', ')}

=== AVAILABLE PROJECTS (use ONLY these — do not invent others) ===
${allProjects.map((p, i) => `
[Project ${i + 1}]
Name: ${p.name}
Source: ${p.source}
Tech Stack: ${(p.techStack || []).join(', ')}
Description: ${p.description || ''}
Summary: ${p.summary || ''}
${p.readme ? `README excerpt: ${p.readme}` : ''}
${p.bullets ? `Existing bullets: ${p.bullets.join(' | ')}` : ''}
GitHub: ${p.githubUrl || 'N/A'}
Stars: ${p.stars || 0}
`).join('\n')}

=== CURRENT SKILLS (use ONLY skills from here or from the job posting that the user clearly has) ===
${currentSkills.join(', ')}
GitHub skills found: ${(githubAnalysis.allSkills || []).join(', ')}

=== YOUR TASK ===
1. Select the 3-4 projects that best match the job requirements
2. For each selected project, write 3-4 impactful bullet points:
   - Start with strong action verbs (Built, Developed, Implemented, Designed, Optimized, etc.)
   - Include technical details from the README/description
   - Only include metrics/numbers if they appear in the provided data
   - Naturally incorporate relevant ATS keywords from the job posting
3. Reorder and filter the skills list to put job-relevant skills first
4. Estimate an ATS match score (0-100) based on skill overlap

Respond with ONLY this JSON (no markdown):
{
  "selectedProjects": [
    {
      "name": "exact project name from input",
      "techStack": ["tech1", "tech2"],
      "bullets": ["bullet1", "bullet2", "bullet3"],
      "githubUrl": "url or empty string"
    }
  ],
  "skills": {
    "languages": ["lang1", "lang2"],
    "frameworks": ["fw1", "fw2"],
    "tools": ["tool1", "tool2"],
    "databases": ["db1", "db2"]
  },
  "atsScore": 75
}`;

  logger.info('resumeAI: calling Gemini for matching');
  const result = await callGemini(prompt);

  // Validate — ensure no invented projects slipped through
  const allowedNames = new Set(allProjects.map((p) => p.name.toLowerCase()));
  if (result.selectedProjects) {
    result.selectedProjects = result.selectedProjects.filter((p) => {
      const isReal = allowedNames.has(p.name.toLowerCase());
      if (!isReal) logger.warn('resumeAI: rejected hallucinated project', { name: p.name });
      return isReal;
    });
  }

  return result;
};

module.exports = { matchAndGenerate };
