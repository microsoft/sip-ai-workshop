# AI-SIP Workshop Repository

## Overview

This repository contains a sample JavaScript application used in the AI-SIP (AI-enhanced Software development In Practice) workshop. The application visualizes file system structures as an interactive graph using D3.js, providing a hands-on environment for demonstrating AI-assisted development workflows, debugging practices, and automated issue management.

The workshop focuses on:
- Leveraging AI tools like Claude Code and GitHub Copilot for efficient development
- Implementing test-driven development with AI assistance
- Creating automated error handling and issue creation workflows
- Building visual debugging and annotation features

## Required Context

**IMPORTANT**: Always read the following file for current context:
- `.github/Memory.md` - Contains current goals, todo list, status, and important context

## How to Run the Application

1. Navigate to the application directory:
   ```bash
   cd ai-workshop-js
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3000` to view the interactive file system visualization

## Development Commands

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Run linter
npm run lint

# Run type checking (if TypeScript is configured)
npm run typecheck

# Format code
npm run format
```

## Using GitHub CLI for Issue and PR Management

### Issues
```bash
# Create a new issue
gh issue create --title "Issue title" --body "Issue description"

# List open issues
gh issue list

# View issue details
gh issue view <issue-number>

# Update issue
gh issue edit <issue-number>

# Close issue
gh issue close <issue-number>
```

### Pull Requests
```bash
# Create a PR
gh pr create --base main --head feature-branch --title "PR title" --body "PR description"

# List PRs
gh pr list

# View PR details
gh pr view <pr-number>

# Check PR status
gh pr checks <pr-number>

# Merge PR
gh pr merge <pr-number>
```

### Workflows
```bash
# List workflow runs
gh workflow run list

# View workflow run details
gh run view <run-id>

# Watch workflow run in real-time
gh run watch <run-id>
```

## Best Practices for AI-Enhanced Development

### 1. Clear Documentation
- Maintain this CLAUDE.md file with up-to-date instructions and context
- Document all major decisions and architectural choices
- Include examples and edge cases in documentation

### 2. Structured Task Management
- Break down complex features into smaller, manageable tasks
- Use GitHub issues to track all work items
- Create detailed implementation plans before coding

### 3. Visual-First Development
- Use screenshots and mockups to guide implementation
- Test UI changes visually using the Playwright MCP service
- Capture and annotate screenshots for bug reports

### 4. Iterative Improvement
- Start with a working prototype and iterate
- Use test-driven development when possible
- Course-correct early based on test results

### 5. Context Management
- Use `/clear` command to reset context when switching tasks
- Keep focused on one feature at a time
- Reference specific files when discussing code changes

## Memory Storage Instructions

### Regular Memory Updates
You should regularly update the memory file at `.github/Memory.md` with:
- Current date and time
- Consolidated summary of completed tasks
- Current todo list with priorities
- Important context and decisions made
- Any blockers or issues encountered

### Memory File Format
```markdown
# AI Assistant Memory
Last Updated: [ISO 8601 timestamp]

## Current Goals
[List of active goals]

## Todo List
[Current tasks with status]

## Recent Accomplishments
[What was completed recently]

## Important Context
[Key decisions, patterns, or information to remember]

## Reflections
[Insights and improvements]
```

### When to Update Memory
- After completing each major task
- When switching between different features
- Before and after creating pull requests
- When encountering significant issues or decisions
- At the start of each new session

### Memory Pruning
Keep the memory file concise by:
- Removing completed tasks older than 7 days
- Consolidating similar context items
- Archiving detailed reflections after incorporating improvements
- Keeping only the most recent 5-10 accomplishments

## Task Completion Reflection

After completing each task, reflect on:

### What Worked Well
- Successful approaches and techniques
- Effective tool usage
- Good architectural decisions

### Areas for Improvement
- What could have been done more efficiently
- Any confusion or missteps
- Missing documentation or context

### User Feedback Integration
If the user expressed frustration or provided feedback:
- Document the specific issue
- Propose improvements to this CLAUDE.md file
- Update relevant sections to prevent recurrence
- Add new best practices based on learnings

### Continuous Improvement
- Update this file with new patterns discovered
- Add commonly used commands
- Document project-specific conventions
- Include solutions to recurring problems

## Project-Specific Guidelines

### Code Style
- Follow existing patterns in the codebase
- Use ES6+ JavaScript features
- Maintain consistent indentation (2 spaces)
- Add meaningful variable and function names

### Git Workflow
1. Create feature branches from main: `feature-<issue-number>-description`
2. Make atomic commits with clear messages
3. Always create PRs for code review
4. Ensure CI/CD passes before merging
5. Delete feature branches after merging

### Testing Strategy
- Write tests for all new features
- Maintain test coverage above 80%
- Use Playwright for E2E testing
- Test error scenarios and edge cases

### Error Handling
- Catch and log all exceptions appropriately
- Create GitHub issues for production errors
- Include stack traces and reproduction steps
- Assign issues to appropriate team members

## Additional Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Playwright Documentation](https://playwright.dev/)
- [D3.js Documentation](https://d3js.org/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)