# Copilot Assignment for Auto-Generated Issues

Due to GitHub API limitations, Copilot cannot be assigned to issues via the CLI or REST API. However, we've implemented several workarounds:

## Option 1: Automatic Assignment (Observed Behavior)

In some cases, GitHub Copilot automatically assigns itself to issues with specific patterns:
- Issues with "[Auto-Generated]" in the title
- Issues containing error reports with stack traces
- This was observed with issue #15 where Copilot self-assigned

## Option 2: Web Automation (Playwright)

We've created `assign-copilot-web.js` which uses Playwright to automate the web interface:

```bash
# Install playwright if not already installed
npm install playwright

# Run with issue number
GITHUB_TOKEN=your_token node assign-copilot-web.js 17

# Or enable in error handler
ENABLE_COPILOT_ASSIGNMENT=true npm start
```

## Option 3: Manual Assignment

1. Go to the issue page
2. Click the gear icon next to "Assignees" 
3. Search for "Copilot"
4. Click on Copilot to assign

## Option 4: MCP Browser Automation

If you have MCP browser tools available, you can use these steps:

1. Navigate to the issue URL
2. Click on `[aria-label="Select assignees"]`
3. Type "Copilot" in the search field
4. Click on the Copilot option in the dropdown

## Implementation Details

The error handler now:
1. Creates GitHub issues for client-side errors
2. Includes comprehensive error details and stack traces
3. Can optionally attempt Copilot assignment via web automation
4. Logs whether assignment succeeded or failed

## Configuration

Set these environment variables:
- `ENABLE_COPILOT_ASSIGNMENT=true` - Enable web automation for assignment
- `GITHUB_TOKEN=your_token` - GitHub authentication for web automation

## Notes

- The GitHub CLI (`gh`) cannot assign bot users like Copilot
- The REST API also cannot assign Copilot (returns validation errors)
- Only the web interface allows Copilot assignment
- Copilot may automatically assign itself to certain issues