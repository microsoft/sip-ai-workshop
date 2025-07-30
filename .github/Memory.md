# AI Assistant Memory
Last Updated: 2025-07-28T03:00:00Z

## Current Goals
- ✅ Test exception capture feature from PR #7
- ✅ Fix error handler formatting and assignment issues
- ✅ Implement Copilot assignment via GitHub MCP server
- ✅ Improve Memory.md maintenance instructions

## Todo List
- [x] Create issue for exception capture testing (#11)
- [x] Create branch based on stacktrace branch
- [x] Implement test for exception capture
- [x] Run application and trigger the bug
- [x] Verify issue creation and Copilot assignment
- [x] Debug and fix any issues
- [x] Create PR for exception testing (#13)
- [x] Create PR for memory instruction improvements (#20)

## Recent Accomplishments
1. Fixed error-handler.js regex syntax error
2. Redesigned issue formatting with markdown tables
3. Discovered GitHub MCP server for Copilot assignment
4. Made GitHub MCP the default approach
5. Created PR #13 for exception testing
6. Created PR #20 for memory instruction improvements
7. Successfully separated concerns into different PRs

## Important Context
- **Copilot Assignment**: Only works via web interface or GitHub MCP server
- **GitHub MCP Tool**: `mcp__github__assign_copilot_to_issue`
- **PR #13**: Exception capture testing (feature-11-test-exception-capture)
- **PR #20**: Memory.md instruction improvements (improve-memory-instructions)

## User Feedback Integration
- User pointed out I wasn't maintaining Memory.md as instructed
- Created stronger, more prominent instructions in response
- Added visual warnings and mandatory triggers

## Reflections
### What Worked Well
- GitHub MCP server simplified Copilot assignment
- Separating changes into focused PRs
- Rate limiting prevents issue spam

### Areas for Improvement
- Must maintain Memory.md throughout sessions
- Should check for existing solutions (like GitHub MCP) earlier