const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

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

function scanDirectory(dirPath, baseDir) {
  console.log(`[AI Observation] Scanning directory: ${dirPath}`);
  const files = [];
  
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
  }
  
  return files;
}

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
app.post('/api/analyze', (req, res) => {
  console.log('[AI Observation] Received analysis request');
  const { path: targetPath } = req.body;
  
  if (!targetPath) {
    return res.status(400).json({ error: 'Path is required' });
  }
  
  try {
    const graph = buildDependencyGraph(targetPath);
    res.json(graph);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI Enhancement Hook: Add more API endpoints here

app.listen(PORT, () => {
  console.log(`[AI Observation] Server running at http://localhost:${PORT}`);
  console.log('Ready for dependency visualization!');
});