# AI Prompts Guide for Code Dependency Visualizer

This guide provides example prompts for each phase of the workshop to help participants collaborate effectively with AI.

## 🔍 Observation Phase

### Understanding the Codebase
```
"Help me understand this dependency visualizer code. What are the main components and how do they work together?"

"Walk me through the flow from when a user clicks 'Analyze Dependencies' to when the graph appears on screen."

"What libraries and frameworks is this project using? Explain the choice of D3.js for visualization."
```

### Identifying Improvement Areas
```
"I've been using this tool for a few minutes. Based on the console logs and observation data, what patterns do you notice? What improvements would be most valuable?"

"Look at the 'AI Enhancement Hook' comments in the code. Which of these would be the easiest to implement first?"

"What are some common pain points users might have with dependency visualization tools like this?"
```

## 💡 Ideation Phase

### Feature Brainstorming
```
"I want to add search functionality to this dependency visualizer. What would be the most user-friendly way to implement this?"

"Suggest 5 features that would make this tool more useful for developers analyzing large codebases."

"The current visualization uses color to show directories. What other visual encodings could we use to show meaningful information about files?"
```

### Prioritization Help
```
"I have these feature ideas: [list your ideas]. Help me prioritize them based on implementation difficulty and user value."

"Which of these enhancements would provide the biggest 'wow factor' for workshop participants: search, node sizing, or circular dependency detection?"

"I only have 20 minutes to implement features. What's the most impressive thing we could build in that time?"
```

## 📋 Planning Phase

### Technical Planning
```
"I want to implement file search with highlighting. Walk me through the steps to add this feature, including where to add UI controls and how to modify the D3.js visualization."

"Help me plan how to add node sizing based on file size. What changes do I need to make to the server API and the frontend visualization?"

"I want to detect circular dependencies. Explain the algorithm I'd need and how to integrate it into the existing code structure."
```

### Code Location Guidance
```
"Where in the codebase should I add a search input field? Show me the specific HTML section and CSS classes I should use."

"I need to modify the D3.js node rendering to support variable sizes. Point me to the exact function and lines to change."

"Where should I add the API endpoint for additional file metadata? Show me how to structure the Express route."
```

## ⚡ Implementation Phase

### Step-by-Step Implementation
```
"Let's implement the search feature step by step. Start by adding the HTML search input to the sidebar."

"Now that I have the search input, help me write the JavaScript function to filter and highlight nodes based on the search term."

"The search is working but the highlighting looks wrong. Help me debug the CSS and D3.js selection logic."
```

### Problem Solving
```
"I'm getting this error: [paste error]. Help me understand what's wrong and how to fix it."

"The node sizes are not updating correctly when I change the metric. Walk me through debugging this issue."

"My new feature works but it's breaking the existing drag functionality. How can I fix this conflict?"
```

### Code Enhancement
```
"This function works but it's quite long. Help me refactor it to be more readable and maintainable."

"Can you suggest a more efficient way to implement this graph filtering algorithm?"

"Add error handling to this feature to make it more robust for edge cases."
```

## 🧪 Testing Phase

### Manual Testing Guidance
```
"I just implemented [feature]. What are the most important test cases I should verify to ensure it works correctly?"

"Help me create a test plan for this search feature. What edge cases should I check?"

"I want to test this on a large codebase. Suggest some open-source projects that would make good test subjects."
```

### Debugging Help
```
"The feature works on small projects but fails on large ones. Help me identify potential performance bottlenecks."

"Users might enter invalid search terms. How should the UI handle these gracefully?"

"Test my understanding: if I search for 'component', what exactly should happen in the visualization?"
```

## 🚀 Emergency Prompts (When Stuck)

### Code Not Working
```
"I'm completely stuck. My [feature] isn't working and I'm getting [error/behavior]. Can you help me start over with a simpler approach?"

"Nothing is appearing on screen after my changes. Help me methodically debug this step by step."

"I broke something and now the original functionality doesn't work. Help me identify what I changed and how to fix it."
```

### Time Running Out
```
"I have 5 minutes left. What's the quickest improvement I can make that will still be impressive?"

"I started implementing [complex feature] but won't finish. Help me scale it back to something simpler that still demonstrates the concept."

"Give me a simple one-line change that would visually improve the tool for the demo."
```

## 🎯 Enhancement-Specific Prompts

### Search Functionality
```
"Add a search input that highlights matching nodes in the graph and dims the others."

"Implement fuzzy search that matches partial filenames and shows results as you type."

"Create a search history dropdown that remembers previous searches."
```

### Visual Improvements
```
"Make node sizes proportional to file size. Larger files should have bigger circles."

"Add a color legend that explains what each directory color represents."

"Animate the graph when nodes are added or removed."
```

### Analysis Features
```
"Implement circular dependency detection and highlight cycles in red."

"Add a 'most connected files' panel that shows files with the most imports/exports."

"Create a complexity score for each file based on its connections and file size."
```

### Interactive Features
```
"Add double-click to focus on a node and show only its direct connections."

"Implement a 'pin node' feature that prevents specific nodes from moving during force simulation."

"Create breadcrumb navigation for when users drill down into specific parts of the graph."
```

## 💡 Tips for Effective AI Collaboration

### Be Specific
- ❌ "Make the graph better"
- ✅ "Add a search input that highlights matching filenames and dims other nodes"

### Provide Context
- ❌ "This doesn't work"
- ✅ "The search highlighting works but it's not clearing when I clear the search input"

### Ask for Explanations
- ❌ Just copy-paste code
- ✅ "Explain how this D3.js selection works before I add it"

### Iterate Incrementally
- ❌ "Build a complete dashboard with all features"
- ✅ "First add the search input, then we'll add the filtering logic"

### Debug Together
- ❌ "Fix my code"
- ✅ "Help me understand why the nodes aren't updating when I change this property"

Remember: The AI is your pair programming partner. Explain your goals, share what you're seeing, and ask questions when you're unsure!