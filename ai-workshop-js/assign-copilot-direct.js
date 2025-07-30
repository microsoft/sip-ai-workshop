#!/usr/bin/env node

/**
 * Directly assigns Copilot to a GitHub issue using MCP browser automation
 * This script can be called from the error handler to automate assignment
 */

const { execSync } = require('child_process');

async function assignCopilotToIssue(issueNumber) {
  console.log(`[AssignCopilot] Starting MCP browser automation for issue #${issueNumber}`);
  
  // Get repository info
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
  const repoMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^.]+)/);
  
  if (!repoMatch) {
    throw new Error('Could not parse GitHub repository from remote URL');
  }
  
  const [, owner, repo] = repoMatch;
  const issueUrl = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;
  
  // Since we're in Node.js and need to call MCP tools, we'll create a script
  // that outputs the commands needed for the LLM to execute
  
  const mcpScript = `
// MCP Browser Automation Script for Copilot Assignment
// Issue: ${issueUrl}

// Step 1: Navigate to the issue
await mcp__playwright__browser_navigate({ url: "${issueUrl}" });

// Step 2: Wait for page to load and take snapshot
await new Promise(resolve => setTimeout(resolve, 3000));
await mcp__playwright__browser_snapshot();

// Step 3: Click the assignees button
await mcp__playwright__browser_click({
  element: "Assignees settings button",
  ref: "button[aria-label='Select assignees']"
});

// Step 4: Wait for dropdown to open
await new Promise(resolve => setTimeout(resolve, 1000));

// Step 5: Type "Copilot" in the search field
await mcp__playwright__browser_type({
  element: "Assignee search field",
  ref: "input[placeholder*='Search']",
  text: "Copilot"
});

// Step 6: Wait for search results
await new Promise(resolve => setTimeout(resolve, 1500));

// Step 7: Click on Copilot option
await mcp__playwright__browser_click({
  element: "Copilot assignee option",
  ref: "div[role='option']:has-text('Copilot')"
});

// Step 8: Click outside to close dropdown
await mcp__playwright__browser_click({
  element: "Page body to close dropdown",
  ref: "body"
});

console.log("Successfully assigned Copilot to issue #${issueNumber}");
`;

  // Save the script for execution
  const fs = require('fs');
  const scriptPath = `/tmp/assign-copilot-${issueNumber}.mcp.js`;
  fs.writeFileSync(scriptPath, mcpScript);
  
  console.log(`[AssignCopilot] MCP script saved to: ${scriptPath}`);
  console.log(`[AssignCopilot] To execute: Run the script contents through MCP browser tools`);
  
  return {
    success: true,
    issueUrl,
    scriptPath,
    instructions: 'Execute the generated MCP script to assign Copilot'
  };
}

// Export for use in error handler
module.exports = { assignCopilotToIssue };

// CLI usage
if (require.main === module) {
  const issueNumber = process.argv[2];
  
  if (!issueNumber) {
    console.error('Usage: node assign-copilot-direct.js <issue-number>');
    process.exit(1);
  }
  
  assignCopilotToIssue(issueNumber)
    .then(result => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
      
      // Read and display the script
      const fs = require('fs');
      console.log('\nGenerated MCP Script:');
      console.log('=' .repeat(50));
      console.log(fs.readFileSync(result.scriptPath, 'utf-8'));
      console.log('=' .repeat(50));
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}