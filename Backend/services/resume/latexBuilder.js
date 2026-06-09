const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '../templates/main.tex');

// Escape all LaTeX special characters — AI output never touches raw LaTeX
const esc = (str = '') =>
  String(str)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}');

const buildContactSection = (contactInfo = {}) => {
  const name    = esc(contactInfo.name    || 'Your Name');
  const email   = esc(contactInfo.email   || '');
  const phone   = esc(contactInfo.phone   || '');
  const linkedin = esc(contactInfo.linkedin || '');
  const github  = esc(contactInfo.github  || '');
  const website = esc(contactInfo.website || '');

  const metaParts = [email, phone, linkedin, github, website].filter(Boolean);
  const metaLine = metaParts.join(' $\\mid$ ');

  return `{\\centering
{\\LARGE \\textbf{${name}}}\\\\[3pt]
{\\small ${metaLine}}\\\\[2pt]
}`;
};

const buildEducationSection = (education = []) => {
  if (!education.length) return '';
  const rows = education.map((edu) => {
    const school = esc(edu.school || edu.institution || '');
    const degree = esc(edu.degree || '');
    const field  = esc(edu.field  || edu.major || '');
    const dates  = esc(edu.dates  || edu.year  || '');
    const gpa    = edu.gpa ? `, GPA: ${esc(String(edu.gpa))}` : '';
    return `\\textbf{${school}} \\hfill ${dates}\\\\
${degree}${field ? `, ${field}` : ''}${gpa}`;
  });

  return `\\section{Education}
${rows.join('\\\\[4pt]\n')}`;
};

const buildExperienceSection = (experience = []) => {
  if (!experience.length) return '';
  const rows = experience.map((exp) => {
    const company  = esc(exp.company  || exp.employer || '');
    const role     = esc(exp.role     || exp.title    || '');
    const dates    = esc(exp.dates    || '');
    const location = esc(exp.location || '');
    const bullets  = (exp.bullets || exp.description ? [exp.description] : []).filter(Boolean);

    const bulletLines = bullets.length
      ? `\\begin{itemize}\n${bullets.map((b) => `  \\item ${esc(b)}`).join('\n')}\n\\end{itemize}`
      : '';

    return `\\textbf{${role}} \\hfill ${dates}\\\\
\\textit{${company}}${location ? `, ${location}` : ''}
${bulletLines}`;
  });

  return `\\section{Experience}
${rows.join('\\\\[6pt]\n')}`;
};

const buildSkillsSection = (skills = {}) => {
  const lines = [];
  if (skills.languages?.length)  lines.push(`\\textbf{Languages:} ${skills.languages.map(esc).join(', ')}`);
  if (skills.frameworks?.length) lines.push(`\\textbf{Frameworks:} ${skills.frameworks.map(esc).join(', ')}`);
  if (skills.databases?.length)  lines.push(`\\textbf{Databases:} ${skills.databases.map(esc).join(', ')}`);
  if (skills.tools?.length)      lines.push(`\\textbf{Tools:} ${skills.tools.map(esc).join(', ')}`);

  if (!lines.length) return '';

  return `\\section{Technical Skills}
${lines.join(' \\\\\n')}`;
};

const buildProjectsSection = (projects = []) => {
  if (!projects.length) return '';

  const blocks = projects.map((proj) => {
    const name    = esc(proj.name || '');
    const stack   = (proj.techStack || []).map(esc).join(', ');
    const url     = proj.githubUrl ? `\\href{${proj.githubUrl}}{GitHub}` : '';
    const header  = `\\textbf{${name}}${stack ? ` $|$ \\textit{${stack}}` : ''}${url ? ` \\hfill ${url}` : ''}`;

    const bullets = (proj.bullets || [])
      .filter(Boolean)
      .map((b) => `  \\item ${esc(b)}`)
      .join('\n');

    return `${header}
\\begin{itemize}
${bullets}
\\end{itemize}`;
  });

  return `\\section{Projects}
${blocks.join('\\vspace{4pt}\n')}`;
};

const buildLatex = (masterResume, aiJson) => {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const contact    = buildContactSection(masterResume.structured?.contactInfo);
  const education  = buildEducationSection(masterResume.structured?.education || []);
  const experience = buildExperienceSection(masterResume.structured?.experience || []);
  const skills     = buildSkillsSection(aiJson.skills || {});
  const projects   = buildProjectsSection(aiJson.selectedProjects || []);

  return template
    .replace('%%CONTACT_SECTION%%',    contact)
    .replace('%%EDUCATION_SECTION%%',  education)
    .replace('%%EXPERIENCE_SECTION%%', experience)
    .replace('%%SKILLS_SECTION%%',     skills)
    .replace('%%PROJECTS_SECTION%%',   projects);
};

module.exports = { buildLatex };
