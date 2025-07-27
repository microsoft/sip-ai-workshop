# Claude Code Prompt: Create AI Workshop Dependency Visualizer

Please create a complete workshop project for teaching developers how to use AI to enhance their code. The workshop is 45 minutes and involves participants using AI to add features to a code dependency visualizer.

## Project Structure
Create the following directory structure:
```
ai-workshop-js/
├── server.js
├── package.json
├── README.md
├── AI-prompts-guide.md
├── public/
│   ├── index.html
│   └── observation.js
├── .devcontainer/
│   └── devcontainer.json
└── scripts/
    └── setup-sample-project.sh
```

## File Contents

### 1. server.js
Create an Express server that:
- Scans directories recursively for JavaScript/TypeScript files
- Parses import/require statements using regex
- Builds a dependency graph with nodes (files) and links (imports)
- Provides a POST endpoint `/api/analyze` that accepts a path and returns the graph
- Serves static files from the public directory
- Runs on port 3000

### 2. public/index.html
Create an interactive visualization using D3.js v7 that:
- Shows a force-directed graph of file dependencies
- Colors nodes by directory
- Allows dragging nodes to rearrange
- Highlights connected nodes on hover
- Shows a tooltip with file info
- Has controls to input a path and analyze it
- Shows statistics (file count, dependency count)
- Has a toggle for showing/hiding labels
- Includes basic styling with a clean, modern UI

### 3. package.json
Standard Node.js package file with:
- Name: "code-dependency-visualizer"
- Version: "1.0.0"
- Main: "server.js"
- Scripts: "start" and "dev" (using nodemon)
- Dependencies: express ^4.18.2
- DevDependencies: nodemon ^3.0.1

### 4. README.md
A comprehensive workshop guide that includes:
- Overview of the tool
- Quick start instructions
- Current features list
- Workshop flow with 6 phases (Observation, Ideation, Planning, Implementation, Testing, Try It Out)
- Enhancement ideas categorized by type (Filtering, Visual, Analysis, Interactivity, Export)
- Technical details about the codebase
- Enhancement hooks (places in code designed for AI modifications)
- Tips for participants
- Troubleshooting section

### 5. public/observation.js
A JavaScript module that:
- Tracks user interactions (clicks, hovers, searches)
- Logs actions with timestamps and context
- Provides a summary of user behavior
- Attaches event listeners to UI elements
- Stores observations for AI analysis

### 6. .devcontainer/devcontainer.json
GitHub Codespaces configuration that:
- Uses Node.js 18 image
- Installs dependencies on creation
- Forwards port 3000
- Includes useful VS Code extensions (ESLint, Prettier, Copilot)
- Sets up auto-formatting

### 7. AI-prompts-guide.md
A guide with example prompts for each workshop phase:
- Observation prompts
- Feature ideation prompts
- Planning prompts
- Implementation prompts
- Testing prompts
- Enhancement ideas
- Emergency/troubleshooting prompts
- Tips for effective AI collaboration

### 8. scripts/setup-sample-project.sh
A bash script that creates a sample JavaScript project with:
- Multiple directories (components, utils, services, hooks)
- Various import patterns
- Circular dependency example
- Enough complexity to make the visualization interesting

## Key Requirements

1. **The visualizer must work immediately** after running `npm install && npm start`
2. **Code should be simple and readable** - around 300 lines total for core functionality
3. **Include intentional "hooks"** where AI can easily add enhancements
4. **Frontend must be a single HTML file** with inline JavaScript and CSS
5. **Use only CDN-hosted libraries** (D3.js from https://d3js.org/d3.v7.min.js)
6. **Include console.log statements** for AI observation points

## Workshop Enhancement Ideas to Support

The base code should make it easy for AI to add:
- Search functionality with node highlighting
- Node sizing based on metrics
- Circular dependency detection
- File type filtering
- Export to PNG/SVG
- Clustering algorithms
- Different graph layouts
- Performance optimizations
- Git integration
- Complexity analysis

## Testing
After creating all files, verify that:
1. `npm install` completes successfully
2. `npm start` launches the server
3. The visualization loads at http://localhost:3000
4. The graph displays when analyzing the current directory
5. Nodes are draggable and hoverable

Please create all these files with the specified content, ensuring the workshop will run smoothly and provide a great learning experience for participants exploring AI-assisted development.