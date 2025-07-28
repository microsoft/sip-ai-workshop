#!/usr/bin/env node

/**
 * Assigns GitHub Copilot to an issue using Playwright browser automation
 * This works around the API limitation by using the web interface
 */

const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function assignCopilotToIssue(issueNumber, options = {}) {
  const { headless = true, githubToken = process.env.GITHUB_TOKEN } = options;
  
  console.log(`[AssignCopilot] Assigning Copilot to issue #${issueNumber} via web automation...`);
  
  // Get repository info
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
  const repoMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^.]+)/);
  
  if (!repoMatch) {
    throw new Error('Could not parse GitHub repository from remote URL');
  }
  
  const [, owner, repo] = repoMatch;
  const issueUrl = `https://github.com/${owner}/${repo}/issues/${issueNumber}`;
  
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  
  try {
    // Set GitHub auth cookie if token provided
    if (githubToken) {
      await context.addCookies([{
        name: 'user_session',
        value: githubToken,
        domain: 'github.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
      }]);
    }
    
    const page = await context.newPage();
    
    // Navigate to issue
    console.log(`[AssignCopilot] Navigating to ${issueUrl}`);
    await page.goto(issueUrl);
    
    // Wait for page to load
    await page.waitForSelector('button[aria-label="Select assignees"]', { timeout: 10000 });
    
    // Click the assignees gear icon
    console.log('[AssignCopilot] Opening assignees dropdown...');
    await page.click('button[aria-label="Select assignees"]');
    
    // Wait for dropdown to open
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });
    
    // Type "Copilot" in search
    console.log('[AssignCopilot] Searching for Copilot...');
    await page.fill('input[placeholder*="Search"]', 'Copilot');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Look for Copilot in the results
    const copilotOption = await page.locator('div[role="option"]').filter({ hasText: 'Copilot' }).first();
    
    if (await copilotOption.count() > 0) {
      console.log('[AssignCopilot] Found Copilot, clicking to assign...');
      await copilotOption.click();
      
      // Click outside to close dropdown
      await page.click('body');
      
      // Wait for assignment to process
      await page.waitForTimeout(2000);
      
      console.log(`[AssignCopilot] Successfully assigned Copilot to issue #${issueNumber}`);
      return { success: true, issueUrl };
    } else {
      throw new Error('Copilot option not found in assignees dropdown');
    }
    
  } catch (error) {
    console.error('[AssignCopilot] Error:', error.message);
    return { 
      success: false, 
      error: error.message,
      issueUrl,
      suggestion: 'Ensure you are logged into GitHub or provide GITHUB_TOKEN environment variable'
    };
  } finally {
    await browser.close();
  }
}

// Export for use in other modules
module.exports = { assignCopilotToIssue };

// CLI usage
if (require.main === module) {
  const issueNumber = process.argv[2];
  
  if (!issueNumber) {
    console.error('Usage: node assign-copilot-web.js <issue-number>');
    console.error('Set GITHUB_TOKEN environment variable for authentication');
    process.exit(1);
  }
  
  assignCopilotToIssue(issueNumber, { headless: false })
    .then(result => {
      console.log('Result:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}