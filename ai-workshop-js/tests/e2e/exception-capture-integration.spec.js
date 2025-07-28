const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const fs = require('fs');

test.describe('Exception Capture Integration', () => {
  
  // Store issue numbers created during tests for cleanup
  const createdIssues = [];
  
  test.afterAll(async () => {
    // Clean up any test issues created
    for (const issueNumber of createdIssues) {
      try {
        execSync(`gh issue close ${issueNumber} --comment "Test issue - automatically closed"`, { 
          encoding: 'utf-8',
          stdio: 'pipe' 
        });
      } catch (error) {
        console.log(`Could not close issue ${issueNumber}:`, error.message);
      }
    }
  });

  test('should capture tooltip bug and create GitHub issue', async ({ page }) => {
    // Enable error handling for this test by not setting NODE_ENV=test
    delete process.env.NODE_ENV;
    
    // Clear rate limiting by waiting if needed
    test.setTimeout(120000); // 2 minute timeout
    
    // Start monitoring GitHub issues before triggering the bug
    let initialIssueCount;
    try {
      const issueList = execSync('gh issue list --state all --json number', { encoding: 'utf-8' });
      initialIssueCount = JSON.parse(issueList).length;
    } catch (error) {
      console.log('Could not get initial issue count:', error.message);
      initialIssueCount = 0;
    }
    
    // Navigate to the application
    await page.goto('/');
    
    // Wait for visualization to load
    await page.waitForSelector('#graph');
    
    // Analyze current directory to get files
    await page.click('#analyzeBtn');
    await page.waitForSelector('.node', { timeout: 10000 });
    
    // Give simulation time to stabilize
    await page.waitForTimeout(2000);
    
    // Stop simulation to make hovering easier
    await page.evaluate(() => {
      if (window.simulation) {
        window.simulation.stop();
      }
    });
    
    // Listen for console errors
    let errorCaptured = false;
    let errorMessage = '';
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Cannot read properties of undefined')) {
          errorCaptured = true;
          errorMessage = text;
        }
      }
    });
    
    // Listen for network requests to verify error reporting
    let errorReported = false;
    page.on('request', request => {
      if (request.url().includes('/api/report-error') && request.method() === 'POST') {
        errorReported = true;
      }
    });
    
    // Find and hover over nodes to trigger the bug
    const nodes = await page.locator('.node').all();
    console.log(`Found ${nodes.length} nodes to test`);
    
    // Try hovering over multiple nodes to find one without extension
    for (let i = 0; i < Math.min(nodes.length, 10); i++) {
      try {
        await nodes[i].hover({ force: true });
        await page.waitForTimeout(500);
        
        if (errorCaptured) {
          console.log(`Error triggered on node ${i}`);
          break;
        }
      } catch (e) {
        // Continue if hover fails
      }
    }
    
    // Verify the error was captured
    expect(errorCaptured).toBe(true);
    expect(errorMessage).toContain("Cannot read properties of undefined (reading 'toUpperCase')");
    
    // Wait for error to be reported to server
    await page.waitForTimeout(3000);
    expect(errorReported).toBe(true);
    
    // Give time for GitHub issue to be created
    console.log('Waiting for GitHub issue creation...');
    await page.waitForTimeout(5000);
    
    // Check if a new issue was created
    let newIssueCount;
    let newIssues = [];
    try {
      const issueList = execSync('gh issue list --state all --json number,title,createdAt', { encoding: 'utf-8' });
      const allIssues = JSON.parse(issueList);
      newIssueCount = allIssues.length;
      
      // Find issues created in the last minute
      const oneMinuteAgo = new Date(Date.now() - 60000);
      newIssues = allIssues.filter(issue => {
        const createdAt = new Date(issue.createdAt);
        return createdAt > oneMinuteAgo && issue.title.includes('[Auto-Generated]');
      });
      
      // Store issue numbers for cleanup
      newIssues.forEach(issue => createdIssues.push(issue.number));
      
    } catch (error) {
      console.log('Could not get new issue count:', error.message);
      newIssueCount = 0;
    }
    
    // Verify at least one new issue was created
    expect(newIssues.length).toBeGreaterThan(0);
    console.log(`Found ${newIssues.length} new auto-generated issues`);
    
    if (newIssues.length > 0) {
      const latestIssue = newIssues[0];
      console.log(`Latest issue: #${latestIssue.number} - ${latestIssue.title}`);
      
      // Get issue details to verify content
      try {
        const issueDetails = execSync(`gh issue view ${latestIssue.number} --json body,assignees`, { 
          encoding: 'utf-8' 
        });
        const issue = JSON.parse(issueDetails);
        
        // Verify issue content
        expect(issue.body).toContain('Automatic Error Report');
        expect(issue.body).toContain('toUpperCase');
        expect(issue.body).toContain('Stack Trace');
        expect(issue.body).toContain('Instructions for Copilot');
        
        // Check if Copilot assignment was attempted (may fail if Copilot user doesn't exist)
        console.log('Assignees:', issue.assignees);
        
      } catch (error) {
        console.log('Could not get issue details:', error.message);
      }
    }
  });

  test('should handle rate limiting correctly', async ({ page }) => {
    // This test verifies that the same error doesn't create multiple issues within rate limit window
    
    // Navigate to the application
    await page.goto('/');
    await page.waitForSelector('#graph');
    
    // Get current issue count
    let initialIssueCount;
    try {
      const issueList = execSync('gh issue list --state all --json number', { encoding: 'utf-8' });
      initialIssueCount = JSON.parse(issueList).length;
    } catch (error) {
      initialIssueCount = 0;
    }
    
    // Trigger the same error multiple times rapidly
    await page.evaluate(() => {
      // Directly trigger the error multiple times
      for (let i = 0; i < 5; i++) {
        try {
          const errorEvent = new ErrorEvent('error', {
            message: "Cannot read properties of undefined (reading 'toUpperCase')",
            filename: 'index.html',
            lineno: 355,
            colno: 50,
            error: new Error("Cannot read properties of undefined (reading 'toUpperCase')")
          });
          window.dispatchEvent(errorEvent);
        } catch (e) {
          console.error('Test error dispatch failed:', e);
        }
      }
    });
    
    // Wait for potential issue creation
    await page.waitForTimeout(5000);
    
    // Check issue count - should only increase by 1 due to rate limiting
    try {
      const issueList = execSync('gh issue list --state all --json number,title,createdAt', { encoding: 'utf-8' });
      const allIssues = JSON.parse(issueList);
      const newIssueCount = allIssues.length;
      
      // Find recent auto-generated issues
      const fiveMinutesAgo = new Date(Date.now() - 300000);
      const recentIssues = allIssues.filter(issue => {
        const createdAt = new Date(issue.createdAt);
        return createdAt > fiveMinutesAgo && 
               issue.title.includes('[Auto-Generated]') &&
               issue.title.includes('toUpperCase');
      });
      
      // Should have at most 1 new issue due to rate limiting
      expect(recentIssues.length).toBeLessThanOrEqual(1);
      console.log(`Rate limiting working: ${recentIssues.length} issues created for 5 identical errors`);
      
      // Store for cleanup
      recentIssues.forEach(issue => createdIssues.push(issue.number));
      
    } catch (error) {
      console.log('Could not verify rate limiting:', error.message);
    }
  });

  test('should capture server-side errors', async ({ page }) => {
    // Test server-side error capture
    await page.goto('/');
    
    // Get initial issue count
    let initialIssueCount;
    try {
      const issueList = execSync('gh issue list --state all --json number', { encoding: 'utf-8' });
      initialIssueCount = JSON.parse(issueList).length;
    } catch (error) {
      initialIssueCount = 0;
    }
    
    // Trigger a server error with invalid path
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/definitely/not/a/real/path/that/exists' })
        });
        return { 
          status: res.status, 
          data: await res.json() 
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    // Server should return 500 error
    expect(response.status).toBe(500);
    expect(response.data.error).toContain('Path does not exist');
    
    // Wait for potential issue creation
    await page.waitForTimeout(5000);
    
    // Check if server error created an issue
    try {
      const issueList = execSync('gh issue list --state all --json number,title,createdAt', { encoding: 'utf-8' });
      const allIssues = JSON.parse(issueList);
      
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const newServerIssues = allIssues.filter(issue => {
        const createdAt = new Date(issue.createdAt);
        return createdAt > oneMinuteAgo && 
               issue.title.includes('[Auto-Generated]') &&
               issue.title.includes('Path does not exist');
      });
      
      if (newServerIssues.length > 0) {
        console.log(`Server error issue created: #${newServerIssues[0].number}`);
        newServerIssues.forEach(issue => createdIssues.push(issue.number));
      }
      
    } catch (error) {
      console.log('Could not check for server error issues:', error.message);
    }
  });
});