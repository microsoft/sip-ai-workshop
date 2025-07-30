#!/usr/bin/env node

/**
 * Assigns Copilot to GitHub issues using the GitHub MCP server
 * Requires: GitHub MCP server to be configured and running
 * 
 * GitHub MCP Server: https://github.com/github/github-mcp-server
 */

const { execSync } = require('child_process');

class GitHubMCPAssigner {
  constructor() {
    // Parse repository info from git remote
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
    const repoMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^.]+)/);
    
    if (!repoMatch) {
      throw new Error('Could not parse GitHub repository from remote URL');
    }
    
    this.owner = repoMatch[1];
    this.repo = repoMatch[2].replace('.git', '');
  }

  /**
   * Assigns Copilot to an issue using GitHub MCP server
   * @param {number} issueNumber - The issue number to assign
   */
  async assignCopilot(issueNumber) {
    console.log(`[GitHubMCP] Assigning Copilot to ${this.owner}/${this.repo}#${issueNumber}`);
    
    try {
      // If we have access to the GitHub MCP server tools
      if (typeof mcp__github__assign_copilot_to_issue === 'function') {
        const result = await mcp__github__assign_copilot_to_issue({
          owner: this.owner,
          repo: this.repo,
          issueNumber: parseInt(issueNumber)
        });
        
        console.log(`[GitHubMCP] Successfully assigned Copilot to issue #${issueNumber}`);
        return { success: true, result };
      } else {
        // Generate the MCP call for manual execution
        const mcpCall = {
          tool: 'mcp__github__assign_copilot_to_issue',
          params: {
            owner: this.owner,
            repo: this.repo,
            issueNumber: parseInt(issueNumber)
          }
        };
        
        console.log('[GitHubMCP] GitHub MCP tools not available in current environment');
        console.log('[GitHubMCP] Execute this MCP call:');
        console.log(JSON.stringify(mcpCall, null, 2));
        
        return { 
          success: false, 
          mcpCall,
          message: 'GitHub MCP server not available - see mcpCall for manual execution'
        };
      }
    } catch (error) {
      console.error('[GitHubMCP] Error assigning Copilot:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generates the code to call GitHub MCP server
   */
  generateMCPCode(issueNumber) {
    return `
// GitHub MCP Server call to assign Copilot
await mcp__github__assign_copilot_to_issue({
  owner: "${this.owner}",
  repo: "${this.repo}",
  issueNumber: ${issueNumber}
});
`;
  }
}

// Export for use in error handler
module.exports = GitHubMCPAssigner;

// CLI usage
if (require.main === module) {
  const issueNumber = process.argv[2];
  
  if (!issueNumber) {
    console.error('Usage: node github-mcp-assign.js <issue-number>');
    console.error('\nRequires GitHub MCP server to be configured');
    console.error('See: https://github.com/github/github-mcp-server');
    process.exit(1);
  }
  
  const assigner = new GitHubMCPAssigner();
  
  assigner.assignCopilot(issueNumber)
    .then(result => {
      console.log('\nResult:', JSON.stringify(result, null, 2));
      
      if (!result.success && result.mcpCall) {
        console.log('\nTo execute manually in an MCP environment:');
        console.log(assigner.generateMCPCode(issueNumber));
      }
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}