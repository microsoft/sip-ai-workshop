# Reusable Agents

This directory contains specialized agent configurations that can be invoked for specific tasks.

## Available Agents

### test-solver
- **Purpose**: Fix failing tests, especially Playwright E2E tests
- **Strengths**: Debugging, cross-browser compatibility, timing issues
- **Usage**: When tests are failing and need systematic fixes

## How to Use Agents

These agents are designed to be invoked using the Task tool with the general-purpose subagent type:

```javascript
Task({
  description: "Fix failing tests",
  prompt: `/agent:test-solver
    
    Context: We have failing Playwright tests that need to be fixed.
    - Total tests: X
    - Failing: Y
    - Browsers: Chrome, Firefox, Safari
    
    Please analyze and fix all failing tests.`,
  subagent_type: "general-purpose"
})
```

## Creating New Agents

To create a new reusable agent:

1. Create a new `.md` file in this directory
2. Follow the template structure used in existing agents
3. Include:
   - Clear purpose and activation criteria
   - Specific competencies
   - Approach methodology
   - Example solutions
   - Success metrics

## Agent Design Principles

1. **Specialization**: Each agent should excel at a specific type of task
2. **Reusability**: Agents should be generic enough to handle similar problems
3. **Documentation**: Include examples and patterns from successful uses
4. **Integration**: Design for easy invocation from the main agent
5. **Measurable**: Define clear success criteria

## Future Agents

Potential agents to create:
- `performance-optimizer`: Optimize code performance
- `security-auditor`: Security vulnerability detection
- `refactoring-expert`: Code refactoring and cleanup
- `documentation-writer`: Generate comprehensive docs
- `accessibility-checker`: Ensure WCAG compliance