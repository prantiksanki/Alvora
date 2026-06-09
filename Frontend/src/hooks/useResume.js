import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { resumeService } from '../services/resumeService';

export const useResume = () => {
  const [masterResume,   setMasterResume]   = useState(null);
  const [githubAnalysis, setGithubAnalysis] = useState(null);
  const [jobDescription, setJobDescription] = useState(null);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [versions,       setVersions]       = useState([]);

  const [loadingMaster,   setLoadingMaster]   = useState(false);
  const [loadingGithub,   setLoadingGithub]   = useState(false);
  const [loadingJob,      setLoadingJob]      = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const fetchMasterResume = useCallback(async () => {
    setLoadingMaster(true);
    try {
      const { data } = await resumeService.getMasterResume();
      setMasterResume(data.resume);
    } catch {
      // null is valid — first time user
    } finally {
      setLoadingMaster(false);
    }
  }, []);

  const saveMasterResume = useCallback(async (rawText) => {
    setLoadingMaster(true);
    try {
      const { data } = await resumeService.saveMasterResume(rawText);
      setMasterResume(data.resume);
      toast.success('Resume saved and parsed successfully');
      return data.resume;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save resume');
      throw err;
    } finally {
      setLoadingMaster(false);
    }
  }, []);

  const fetchGitHubAnalysis = useCallback(async () => {
    setLoadingGithub(true);
    try {
      const { data } = await resumeService.getGitHubAnalysis();
      setGithubAnalysis(data.analysis);
    } catch {
      // null is valid
    } finally {
      setLoadingGithub(false);
    }
  }, []);

  const analyzeGitHub = useCallback(async () => {
    setLoadingGithub(true);
    try {
      const { data } = await resumeService.analyzeGitHub();
      setGithubAnalysis(data.analysis);
      toast.success('GitHub repositories analyzed');
      return data.analysis;
    } catch (err) {
      toast.error(err.response?.data?.message || 'GitHub analysis failed');
      throw err;
    } finally {
      setLoadingGithub(false);
    }
  }, []);

  const scrapeJob = useCallback(async (url) => {
    setLoadingJob(true);
    try {
      const { data } = await resumeService.scrapeJob(url);
      setJobDescription(data.jobDescription);
      toast.success('Job description parsed');
      return data.jobDescription;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to parse job URL');
      throw err;
    } finally {
      setLoadingJob(false);
    }
  }, []);

  const generateResume = useCallback(async (jobDescriptionId) => {
    setLoadingGenerate(true);
    try {
      const { data } = await resumeService.generate(jobDescriptionId);
      setGeneratedResume(data.resume);
      if (data.resume.dockerUnavailable) {
        toast('Resume built! Docker is not running so a .tex file is available for download instead of PDF. Start Docker Desktop and regenerate for PDF.', { duration: 8000 });
      } else {
        toast.success('Resume generated! PDF ready.');
      }
      return data.resume;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate resume');
      throw err;
    } finally {
      setLoadingGenerate(false);
    }
  }, []);

  const fetchVersions = useCallback(async () => {
    setLoadingVersions(true);
    try {
      const { data } = await resumeService.getVersions();
      setVersions(data.versions || []);
    } catch {
      // silent
    } finally {
      setLoadingVersions(false);
    }
  }, []);

  const downloadResume = useCallback(async (id) => {
    try {
      const { data, headers } = await resumeService.downloadPdf(id);
      const blob = new Blob([data], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = headers['content-disposition']?.match(/filename="(.+)"/)?.[1] || 'resume.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed. The PDF may still be compiling.');
    }
  }, []);

  return {
    masterResume, githubAnalysis, jobDescription, generatedResume, versions,
    loadingMaster, loadingGithub, loadingJob, loadingGenerate, loadingVersions,
    fetchMasterResume, saveMasterResume,
    fetchGitHubAnalysis, analyzeGitHub,
    scrapeJob,
    generateResume,
    fetchVersions, downloadResume,
  };
};
