#!/usr/bin/env node

/**
 * Assigns GitHub Copilot to an issue using MCP Playwright automation
 * This bypasses the API limitation by using the web interface
 */

const { execSync } = require('child_process');

async function assignCopilotToIssue(issueNumber) {
  console.log(`Assigning Copilot to issue #${issueNumber} via web automation...`);
  
  // Get repository info from git remote
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
  const repoMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^.]+)/);
  
  if (!repoMatch) {
    throw new Error('Could not parse GitHub repository from remote URL');
  }
  
  const [, owner, repo] = repoMatch;
  const issueUrl = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;
  
  console.log(`Issue URL: ${issueUrl}`);
  
  // Create a simple Node.js script that uses the MCP server
  // Note: This requires the MCP server to be running
  const automationScript = `
const WebSocket = require('ws');

async function assignCopilot() {
  // Connect to MCP server (default port)
  const ws = new WebSocket('ws://localhost:3000/mcp');
  
  return new Promise((resolve, reject) => {
    ws.on('open', async () => {
      try {
        // Navigate to issue
        ws.send(JSON.stringify({
          method: 'playwright.navigate',
          params: { url: '${issueUrl}' }
        }));
        
        // Wait for page load
        await new Promise(r => setTimeout(r, 3000));
        
        // Click assignees gear icon
        ws.send(JSON.stringify({
          method: 'playwright.click',
          params: { selector: '[aria-label="Select assignees"]' }
        }));
        
        // Wait for dropdown
        await new Promise(r => setTimeout(r, 1000));
        
        // Search for Copilot
        ws.send(JSON.stringify({
          method: 'playwright.type',
          params: { 
            selector: 'input[placeholder="Search users"]',
            text: 'Copilot'
          }
        }));
        
        // Wait for search results
        await new Promise(r => setTimeout(r, 1500));
        
        // Click on Copilot option
        ws.send(JSON.stringify({
          method: 'playwright.click',
          params: { selector: 'div[role="option"]:has-text("Copilot")' }
        }));
        
        // Close dropdown by clicking outside
        ws.send(JSON.stringify({
          method: 'playwright.click',
          params: { selector: 'body' }
        }));
        
        ws.close();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
    
    ws.on('error', reject);
  });
}

assignCopilot().then(() => {
  console.log('Successfully assigned Copilot');
  process.exit(0);
}).catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
`;
  
  // For now, return instructions since we don't have MCP server details
  return {
    success: false,
    message: 'MCP automation prepared but requires MCP server configuration',
    instructions: [
      '1. Ensure MCP Playwright server is running',
      '2. Configure WebSocket connection details',
      '3. Run the automation script',
      `4. Or manually assign at: ${issueUrl}`
    ],
    issueUrl
  };
}

// Export for use in error-handler.js
module.exports = { assignCopilotToIssue };

// Allow direct CLI usage
if (require.main === module) {
  const issueNumber = process.argv[2];
  
  if (!issueNumber) {
    console.error('Usage: node assign-copilot-mcp.js <issue-number>');
    process.exit(1);
  }
  
  assignCopilotToIssue(issueNumber)
    .then(result => {
      console.log('Result:', result);
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}