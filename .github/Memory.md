# AI Assistant Memory
Last Updated: 2025-07-28T02:50:00Z

## Current Goals
- ✅ Test exception capture feature from PR #7
- ✅ Fix error handler formatting and assignment issues
- ✅ Implement Copilot assignment via GitHub MCP server
- Ensure error handling system automatically creates and assigns issues

## Todo List
- [x] Create issue for exception capture testing (#11)
- [x] Create branch based on stacktrace branch
- [x] Implement test for exception capture
- [x] Run application and trigger the bug
- [x] Verify issue creation and Copilot assignment
- [x] Debug and fix any issues
- [x] Create PR for exception testing (#13)

## Recent Accomplishments
1. Fixed error-handler.js regex syntax error that was causing crashes
2. Completely redesigned issue formatting with markdown tables and proper structure
3. Discovered Copilot cannot be assigned via CLI/API - only web interface
4. Implemented GitHub MCP server integration for Copilot assignment
5. Made GitHub MCP the default approach (no configuration needed)
6. Successfully created auto-generated issues (#14, #15, #17, #18, #19)
7. All E2E tests passing for exception capture

## Important Context
- **Copilot Assignment**: GitHub CLI and REST API cannot assign bot users. Only web interface or GitHub MCP server work.
- **Rate Limiting**: Error handler prevents duplicate issues within 5-minute window
- **GitHub MCP Server**: Provides direct `mcp__github__assign_copilot_to_issue` tool
- **Dynamic Parameters**: Owner/repo extracted automatically from git remote
- **Test Issues Created**: #12 (port error), #14-#19 (various test errors)

## Key Technical Decisions
1. Use markdown files for issue body (--body-file) instead of inline text
2. GitHub MCP server as primary method for Copilot assignment
3. Rate limiting based on error message + stack trace hash
4. Graceful fallbacks when assignment fails

## Reflections
### What Worked Well
- Using `--body-file` with gh CLI for better formatting
- Discovering GitHub MCP server simplified Copilot assignment
- Rate limiting prevents issue spam effectively
- E2E tests catch real bugs

### Areas for Improvement
- Should have checked GitHub MCP server documentation earlier
- Memory.md should have been maintained throughout session
- Could have avoided multiple test issues by checking rate limiting first

### User Feedback
- User corrected assignee from github-copilot[bot] to Copilot
- User pointed out GitHub MCP server as better solution than browser automation
- User noted I wasn't maintaining Memory.md as instructed

## Next Steps
- Monitor if Copilot self-assigns to auto-generated issues
- Document the exception capture workflow
- Consider adding more error context (browser info, user actions)