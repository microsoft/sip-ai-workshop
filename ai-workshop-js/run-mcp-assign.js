#!/usr/bin/env node

/**
 * Executable script to assign Copilot to a GitHub issue using MCP
 * Usage: node run-mcp-assign.js <issue-number>
 */

const issueNumber = process.argv[2];

if (!issueNumber) {
  console.error('Usage: node run-mcp-assign.js <issue-number>');
  process.exit(1);
}

// Get repo info
const { execSync } = require('child_process');
const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
const repoMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^.]+)/);

if (!repoMatch) {
  console.error('Could not parse GitHub repository from remote URL');
  process.exit(1);
}

const [, owner, repo] = repoMatch;
const issueUrl = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;

console.log(`Assigning Copilot to: ${issueUrl}`);
console.log('\nMCP Commands to execute:\n');

// Output the MCP commands that need to be run
const commands = [
  `mcp__playwright__browser_navigate({ url: "${issueUrl}" })`,
  `// Wait 3 seconds for page load`,
  `await new Promise(r => setTimeout(r, 3000))`,
  `mcp__playwright__browser_click({ element: "Assignees button", ref: "button[aria-label='Select assignees']" })`,
  `// Wait 1 second for dropdown`,
  `await new Promise(r => setTimeout(r, 1000))`,
  `mcp__playwright__browser_type({ element: "Search field", ref: "input[placeholder*='Search']", text: "Copilot" })`,
  `// Wait 1.5 seconds for search`,
  `await new Promise(r => setTimeout(r, 1500))`,
  `mcp__playwright__browser_click({ element: "Copilot option", ref: "div[role='option']:has-text('Copilot')" })`,
  `mcp__playwright__browser_click({ element: "Body", ref: "body" })`
];

commands.forEach((cmd, i) => {
  console.log(`${i + 1}. ${cmd}`);
});

console.log('\nTo execute: Run these commands in an MCP-enabled environment');

// If this script is run in an environment with MCP tools available,
// it could execute them directly. For now, it outputs the commands.