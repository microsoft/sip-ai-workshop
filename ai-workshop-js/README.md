# Code Dependency Visualizer - AI Enhancement Workshop

Welcome to the AI-powered code enhancement workshop! In this 45-minute hands-on session, you'll learn how to effectively use AI to enhance existing codebases by adding features to a dependency visualization tool.

## 🎯 Overview

This tool visualizes JavaScript/TypeScript file dependencies as an interactive force-directed graph. Your mission is to use AI to enhance it with new features and capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Open http://localhost:3000 in your browser
```

## 📋 Current Features

- **Dependency Scanning**: Automatically detects imports/requires in JS/TS files
- **Interactive Visualization**: Force-directed graph with D3.js
- **Drag & Drop**: Rearrange nodes to explore relationships
- **Hover Details**: See file information in tooltips
- **Directory Colors**: Visual grouping by folder structure
- **Real-time Analysis**: Analyze any directory path
- **Statistics**: File count, dependency count, directory count

## 🏃‍♂️ Workshop Flow

### Phase 1: Observation (5 minutes)
- Explore the existing tool
- Try analyzing different directories
- Note what works well and what could be improved
- Check console logs for AI observation points

### Phase 2: Ideation (5 minutes)
- Brainstorm enhancement ideas with AI
- Consider user needs and pain points
- Prioritize features by impact and feasibility

### Phase 3: Planning (5 minutes)
- Choose 1-2 features to implement
- Discuss implementation approach with AI
- Identify code locations to modify

### Phase 4: Implementation (20 minutes)
- Work with AI to implement your features
- Test incrementally
- Debug issues together

### Phase 5: Testing (5 minutes)
- Verify your enhancements work correctly
- Check edge cases
- Ensure existing features still function

### Phase 6: Try It Out (5 minutes)
- Use your enhanced tool on real projects
- Share what you built
- Discuss learnings

## 💡 Enhancement Ideas

### Filtering & Search
- 🔍 Search for files by name with highlighting
- 🎯 Filter by file type (.js, .ts, .jsx, .tsx)
- 📁 Show/hide specific directories
- 🔗 Filter by dependency depth

### Visual Enhancements
- 📏 Size nodes by file size or complexity
- 🎨 Custom color schemes
- 🔄 Animate graph changes
- 📊 Different layout algorithms (circular, hierarchical)

### Analysis Features
- 🔴 Highlight circular dependencies
- 📈 Show most connected files (hubs)
- 🏝️ Identify isolated files
- 📊 Complexity metrics

### Interactivity
- 🖱️ Double-click to expand/collapse node connections
- 📌 Pin nodes in place
- 🔍 Zoom to specific nodes
- 📝 Add notes to files

### Export & Integration
- 📸 Export graph as PNG/SVG
- 📄 Generate dependency reports
- 🔄 Watch mode for live updates
- 🛠️ Git integration (show changed files)

## 🔧 Technical Details

### File Structure
```
├── server.js          # Express server with dependency analysis
├── public/
│   ├── index.html     # Main UI with D3.js visualization
│   └── observation.js # User interaction tracking
├── package.json       # Dependencies
└── README.md         # This file
```

### Key Technologies
- **Backend**: Node.js, Express
- **Frontend**: D3.js v7, Vanilla JavaScript
- **Analysis**: Regular expressions for import detection

### Enhancement Hooks

The codebase includes special comments marking good places for AI enhancements:

```javascript
// AI Enhancement Hook: Add more file extensions here
// AI Enhancement Hook: Add search/filter controls here
```

Look for these hooks to quickly find extensible areas.

## 🎓 Tips for Participants

1. **Start Small**: Pick one feature and get it working before adding more
2. **Use Console Logs**: The code includes observation points - use them!
3. **Test Often**: Verify changes work after each modification
4. **Ask AI for Help**: Stuck? Ask AI to explain the code or debug issues
5. **Explore D3.js**: Many visual enhancements use D3 methods
6. **Check the Hooks**: Look for "AI Enhancement Hook" comments

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Ensure you ran `npm install`
- Verify Node.js is installed (`node --version`)

### Graph doesn't appear
- Check browser console for errors
- Ensure the path exists and contains JS/TS files
- Try analyzing the current directory (`./`)

### Dependencies not detected
- Check if files use supported import syntax
- Verify file extensions are .js, .jsx, .ts, or .tsx
- Look for errors in server console

## 🎉 Ready to Enhance!

Your AI assistant is ready to help you transform this tool. Start by observing how it works, then let your creativity guide you. Remember: there's no wrong way to enhance - every improvement teaches you something new about AI-assisted development!

Happy coding! 🚀