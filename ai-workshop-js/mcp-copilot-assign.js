#!/usr/bin/env node

/**
 * Assigns Copilot to GitHub issue using MCP browser automation
 * This function actually executes the MCP commands
 */

async function assignCopilotWithMCP(issueNumber) {
  const { execSync } = require('child_process');
  
  // Get repository info
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
  const repoMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^.]+)/);
  
  if (!repoMatch) {
    throw new Error('Could not parse GitHub repository from remote URL');
  }
  
  const [, owner, repo] = repoMatch;
  const issueUrl = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;
  
  console.log(`Assigning Copilot to ${issueUrl} using MCP browser automation...`);
  
  try {
    // Execute MCP browser automation
    // Note: This would need to be called from an environment that has access to MCP tools
    
    // Navigate to issue
    await mcp__playwright__browser_navigate({ url: issueUrl });
    
    // Wait for page load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take snapshot to see current state
    const snapshot = await mcp__playwright__browser_snapshot();
    console.log('Page loaded, looking for assignees button...');
    
    // Click assignees button
    await mcp__playwright__browser_click({
      element: "Assignees settings button",
      ref: "button[aria-label='Select assignees']"
    });
    
    // Wait for dropdown
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Type Copilot in search
    await mcp__playwright__browser_type({
      element: "Assignee search field",
      ref: "input[placeholder*='Search']",
      text: "Copilot"
    });
    
    // Wait for search results
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Click Copilot option
    await mcp__playwright__browser_click({
      element: "Copilot assignee option",
      ref: "div[role='option']:has-text('Copilot')"
    });
    
    // Click outside to close
    await mcp__playwright__browser_click({
      element: "Page body",
      ref: "body"
    });
    
    console.log(`Successfully assigned Copilot to issue #${issueNumber}`);
    return { success: true, issueNumber, issueUrl };
    
  } catch (error) {
    console.error('Failed to assign Copilot:', error.message);
    return { success: false, error: error.message, issueNumber, issueUrl };
  }
}

module.exports = { assignCopilotWithMCP };

// For testing - this won't work directly from Node.js
if (require.main === module) {
  console.log('This script needs to be run in an environment with MCP browser tools');
  console.log('The function assignCopilotWithMCP can be imported and used where MCP tools are available');
}