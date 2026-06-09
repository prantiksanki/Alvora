import api from './api';

export const resumeService = {
  getMasterResume:    ()        => api.get('/resume/master'),
  saveMasterResume:   (rawText) => api.post('/resume/master', { rawText }),
  getGitHubAnalysis:  ()        => api.get('/resume/github-analysis'),
  analyzeGitHub:      ()        => api.post('/resume/analyze-github'),
  scrapeJob:          (url)     => api.post('/resume/scrape-job', { url }),
  generate:           (jobDescriptionId) => api.post('/resume/generate', { jobDescriptionId }),
  getVersions:        ()        => api.get('/resume/versions'),
  downloadPdf:        (id)      => api.get(`/resume/download/${id}`, { responseType: 'blob', timeout: 30000 }),
};
