const { exec } = require('child_process');
const fs   = require('fs');
const path = require('path');
const { promisify } = require('util');
const logger = require('../../utils/logger');

const execAsync = promisify(exec);

const STORAGE_BASE = path.resolve(
  process.env.RESUME_STORAGE_PATH || path.join(__dirname, '../../storage/resumes')
);
const DOCKER_IMAGE = process.env.LATEX_DOCKER_IMAGE || 'texlive/texlive:latest';
const COMPILE_TIMEOUT = 60000; // 60 seconds

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

/**
 * Write LaTeX content to disk and compile it via Docker → PDF.
 * Returns { texPath, pdfPath } as absolute paths.
 */
const compileToPdf = async (userId, resumeId, latexContent) => {
  const workDir = path.join(STORAGE_BASE, userId.toString(), resumeId.toString());
  ensureDir(workDir);

  const texFile = path.join(workDir, 'main.tex');
  const pdfFile = path.join(workDir, 'main.pdf');

  // Write the .tex file
  fs.writeFileSync(texFile, latexContent, 'utf8');
  logger.info('pdfCompiler: tex written', { texFile });

  // On Windows Docker needs forward-slash paths in volume mounts
  const volumePath = workDir.replace(/\\/g, '/');

  // Docker command: mount workDir, compile, timeout protected
  // --network=none for sandboxing — LaTeX doesn't need internet
  const cmd = [
    'docker run --rm',
    '--network=none',
    `--volume "${volumePath}:/workspace"`,
    '--workdir /workspace',
    `--env TEXMFCACHE=/workspace/.texmfcache`,
    `"${DOCKER_IMAGE}"`,
    'sh -c "pdflatex -interaction=nonstopmode -halt-on-error main.tex > /workspace/compile.log 2>&1"',
  ].join(' ');

  logger.info('pdfCompiler: running docker', { cmd });

  try {
    await execAsync(cmd, { timeout: COMPILE_TIMEOUT });
  } catch (err) {
    // Read compile log for better diagnostics
    const logFile = path.join(workDir, 'compile.log');
    const log = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').slice(-1500) : '(no log)';
    logger.error('pdfCompiler: docker failed', { error: err.message, log });

    // Docker not running — return tex-only so the user can still download the source
    const isDockerMissing = err.message.includes('dockerDesktopLinuxEngine') ||
      err.message.includes('Cannot connect') ||
      err.message.includes('cannot find the file') ||
      err.message.includes('Is the docker daemon running');

    if (isDockerMissing) {
      logger.warn('pdfCompiler: Docker not available — returning .tex only');
      return { texPath: texFile, pdfPath: null, dockerUnavailable: true };
    }

    throw new Error(`LaTeX compilation failed.\n\nLog:\n${log}`);
  }

  if (!fs.existsSync(pdfFile)) {
    throw new Error('PDF was not produced after compilation. Check the LaTeX log.');
  }

  logger.info('pdfCompiler: PDF ready', { pdfFile });
  return { texPath: texFile, pdfPath: pdfFile, dockerUnavailable: false };
};

/**
 * Check that Docker is available and the texlive image exists.
 * Call this on startup or before first compile.
 */
const checkDockerAvailable = async () => {
  try {
    await execAsync(`docker run --rm "${DOCKER_IMAGE}" pdflatex --version`, { timeout: 30000 });
    return true;
  } catch {
    return false;
  }
};

module.exports = { compileToPdf, checkDockerAvailable, STORAGE_BASE };
