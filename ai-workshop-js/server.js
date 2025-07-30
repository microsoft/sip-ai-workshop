const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { execSync } = require('child_process');
const ErrorHandler = require('./error-handler');

// Initialize error handling
const errorHandler = new ErrorHandler({
  enabled: process.env.NODE_ENV !== 'test', // Disable in test environment
  rateLimitMinutes: 5
});

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use(express.json());
app.use(express.static('public'));

// AI Enhancement Hook: Add more file extensions here
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

// Common files without extensions that should be included
const FILES_WITHOUT_EXTENSIONS = ['README', 'LICENSE', 'Dockerfile', 'Makefile', 'Gemfile'];

// AI Enhancement Hook: Add more import patterns
const IMPORT_PATTERNS = [
  /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g,
  /import\s*\(['"]([^'"]+)['"]\)/g,
  /require\s*\(['"]([^'"]+)['"]\)/g,
  /export\s+(?:{[^}]+}|\*)\s+from\s+['"]([^'"]+)['"]/g
];

const scanDirectory = errorHandler.wrapFunction(function(dirPath, baseDir) {
  console.log(`[AI Observation] Scanning directory: ${dirPath}`);
  const files = [];
  
  // Update error handler context
  errorHandler.updateContext({ 
    currentOperation: 'scanDirectory',
    dirPath,
    baseDir 
  });
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // AI Enhancement Hook: Add directory filtering logic here
        if (!item.startsWith('.') && item !== 'node_modules') {
          files.push(...scanDirectory(fullPath, baseDir));
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (FILE_EXTENSIONS.includes(ext) || FILES_WITHOUT_EXTENSIONS.includes(item)) {
          files.push(path.relative(baseDir, fullPath));
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
    throw error; // Let error handler catch this
  }
  
  return files;
}, 'scanDirectory');

function extractImports(filePath, baseDir) {
  console.log(`[AI Observation] Extracting imports from: ${filePath}`);
  const imports = new Set();
  
  try {
    const content = fs.readFileSync(path.join(baseDir, filePath), 'utf-8');
    
    for (const pattern of IMPORT_PATTERNS) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const importPath = match[1];
        
        // AI Enhancement Hook: Add import resolution logic here
        if (importPath.startsWith('.')) {
          const resolvedPath = resolveImportPath(importPath, filePath, baseDir);
          if (resolvedPath) {
            imports.add(resolvedPath);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
  
  return Array.from(imports);
}

function resolveImportPath(importPath, fromFile, baseDir) {
  const fromDir = path.dirname(fromFile);
  let resolvedPath = path.join(fromDir, importPath);
  
  // Try different extensions
  const possiblePaths = [
    resolvedPath,
    ...FILE_EXTENSIONS.map(ext => resolvedPath + ext),
    ...FILE_EXTENSIONS.map(ext => path.join(resolvedPath, 'index' + ext))
  ];
  
  for (const possiblePath of possiblePaths) {
    const fullPath = path.join(baseDir, possiblePath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return path.normalize(possiblePath);
    }
  }
  
  return null;
}

function buildDependencyGraph(targetPath) {
  console.log(`[AI Observation] Building dependency graph for: ${targetPath}`);
  const baseDir = path.resolve(targetPath);
  
  // Check if the target path exists and is a directory
  if (!fs.existsSync(baseDir)) {
    throw new Error(`Path does not exist: ${targetPath}`);
  }
  
  const stat = fs.statSync(baseDir);
  if (!stat.isDirectory()) {
    throw new Error(`Path is not a directory: ${targetPath}`);
  }
  
  const files = scanDirectory(baseDir, baseDir);
  
  // AI Enhancement Hook: Add file metadata here
  const nodes = files.map(file => ({
    id: file,
    name: path.basename(file),
    directory: path.dirname(file),
    extension: path.extname(file)
  }));
  
  const links = [];
  const linkMap = new Map();
  
  for (const file of files) {
    const imports = extractImports(file, baseDir);
    
    for (const importedFile of imports) {
      const linkKey = `${file}->${importedFile}`;
      
      // Avoid duplicate links
      if (!linkMap.has(linkKey)) {
        links.push({
          source: file,
          target: importedFile
        });
        linkMap.set(linkKey, true);
      }
    }
  }
  
  console.log(`[AI Observation] Found ${nodes.length} files and ${links.length} dependencies`);
  
  // AI Enhancement Hook: Add graph analysis metrics here
  return {
    nodes,
    links,
    stats: {
      fileCount: nodes.length,
      dependencyCount: links.length,
      directories: [...new Set(nodes.map(n => n.directory))].length
    }
  };
}

// API endpoint for dependency analysis
app.post('/api/analyze', errorHandler.wrapFunction((req, res) => {
  console.log('[AI Observation] Received analysis request');
  const { path: targetPath } = req.body;
  
  // Update error handler context with request info
  errorHandler.updateContext({
    currentOperation: 'analyze',
    requestPath: targetPath,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  if (!targetPath) {
    return res.status(400).json({ error: 'Path is required' });
  }
  
  try {
    const graph = buildDependencyGraph(targetPath);
    res.json(graph);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
    throw error; // Let error handler catch this
  }
}, 'apiAnalyze'));

// API endpoint for client-side error reporting
app.post('/api/report-error', errorHandler.wrapFunction((req, res) => {
  console.log('[AI Observation] Received client error report');
  const errorInfo = req.body;
  
  // Update error handler context
  errorHandler.updateContext({
    currentOperation: 'clientErrorReport',
    clientErrorType: errorInfo.type,
    clientUrl: errorInfo.url
  });
  
  // Create a synthetic error object from client data
  const clientError = new Error(`Client Error: ${errorInfo.message}`);
  clientError.stack = errorInfo.stack || `Client Error at ${errorInfo.url}`;
  clientError.clientContext = errorInfo;
  
  // Handle the client error through our error handler
  errorHandler.handleError(clientError, 'client', { 
    clientErrorInfo: errorInfo,
    pageContext: errorInfo.pageContext 
  });
  
  res.json({ status: 'received', timestamp: new Date().toISOString() });
}, 'clientErrorReport'));

// API endpoint for screenshot annotation and issue creation
app.post('/api/screenshot', upload.single('screenshot'), errorHandler.wrapFunction(async (req, res) => {
  console.log('[AI Observation] Received screenshot submission');
  
  try {
    const { annotations, context } = req.body;
    const screenshotPath = req.file.path;
    
    // Parse JSON data
    const annotationData = JSON.parse(annotations);
    const contextData = JSON.parse(context);
    
    // Update error handler context
    errorHandler.updateContext({
      currentOperation: 'screenshotSubmission',
      annotationCount: annotationData.length,
      screenshotSize: req.file.size
    });
    
    // Create issue title and body
    const title = `[Visual Report] User annotation from ${contextData.url}`;
    const body = formatScreenshotIssue(annotationData, contextData, screenshotPath);
    
    // Create GitHub issue with screenshot
    const issueUrl = await createGitHubIssueWithScreenshot(title, body, screenshotPath);
    
    // Clean up uploaded file
    fs.unlinkSync(screenshotPath);
    
    res.json({ issueUrl, status: 'success' });
    
  } catch (error) {
    console.error('[Screenshot] Error creating issue:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: error.message });
  }
}, 'screenshotSubmission'));

function formatScreenshotIssue(annotations, context, screenshotPath) {
  const annotationList = annotations.map((ann, index) => {
    return `${index + 1}. ${ann.text || '(No text provided)'}`;
  }).join('\\n');
  
  return `## 📸 Visual Bug Report / Enhancement Request

**Submitted at:** ${context.timestamp}
**Page URL:** ${context.url}
**Viewport:** ${context.viewport.width}x${context.viewport.height}

### User Annotations
${annotationList || 'No annotations provided'}

### Screenshot
See attached screenshot with red markers indicating areas of interest.

### Context
This issue was created using the visual annotation feature. The user pressed 's' to capture the visualization and added annotations to highlight specific areas.

---

## 🤖 Instructions for Copilot

Please review the attached screenshot and annotations to:

1. **Analyze the Issue**: Understand what the user is reporting based on the visual markers
2. **Determine the Type**: Is this a bug report or enhancement request?
3. **Create a Test**: If it's a bug, write a test that reproduces the issue
4. **Implement Solution**: Create the necessary changes to address the concern
5. **Submit PR**: Create a pull request with your changes

### Suggested Investigation Areas:
- UI/UX issues highlighted in the screenshot
- Visual glitches or rendering problems
- Feature enhancements suggested by annotations
- Accessibility improvements

**Priority:** Medium - User-submitted visual feedback

---

*This issue was automatically generated from user screenshot annotation*`;
}

async function createGitHubIssueWithScreenshot(title, body, screenshotPath) {
  try {
    // First, create the issue without the image
    const createCommand = `gh issue create --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
    const result = execSync(createCommand, { encoding: 'utf-8' });
    const issueUrl = result.trim();
    
    // Extract issue number from URL
    const issueMatch = issueUrl.match(/\/issues\/(\d+)$/);
    if (issueMatch) {
      const issueNumber = issueMatch[1];
      
      // Add screenshot as a comment (GitHub CLI doesn't support direct image upload in issue creation)
      const commentCommand = `gh issue comment ${issueNumber} --body "![Screenshot](attachment:screenshot.png)" --attach ${screenshotPath}`;
      try {
        execSync(commentCommand, { encoding: 'utf-8' });
      } catch (commentError) {
        console.log('[Screenshot] Could not attach image:', commentError.message);
      }
      
      // Try to assign to Copilot
      try {
        execSync(`gh issue edit ${issueNumber} --add-assignee github-copilot`, { encoding: 'utf-8' });
      } catch (assignError) {
        console.log('[Screenshot] Could not assign to Copilot:', assignError.message);
      }
    }
    
    return issueUrl;
    
  } catch (error) {
    console.error('[Screenshot] Failed to create GitHub issue:', error.message);
    throw error;
  }
}

// AI Enhancement Hook: Add more API endpoints here

app.listen(PORT, () => {
  console.log(`[AI Observation] Server running at http://localhost:${PORT}`);
  console.log('Ready for dependency visualization!');
  console.log('[ErrorHandler] Automatic error capture and issue creation enabled');
});

// Cleanup error handler periodically
setInterval(() => {
  errorHandler.cleanup();
}, 60000); // Every minute