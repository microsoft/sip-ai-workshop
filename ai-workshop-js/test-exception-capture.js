#!/usr/bin/env node

/**
 * Manual test script for exception capture feature
 * This script helps verify that the error handling system works correctly
 */

const { execSync } = require('child_process');
const http = require('http');

console.log('🧪 Testing Exception Capture Feature');
console.log('====================================\n');

// Step 1: Check if server is running
console.log('1️⃣ Checking if server is running...');
const checkServer = () => {
  return new Promise((resolve) => {
    http.get('http://localhost:3000', (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
};

(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running!');
    console.log('Please start the server with: npm start');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  
  // Step 2: Get initial issue count
  console.log('2️⃣ Getting current GitHub issue count...');
  let initialIssueCount = 0;
  try {
    const issues = execSync('gh issue list --state all --json number', { encoding: 'utf-8' });
    initialIssueCount = JSON.parse(issues).length;
    console.log(`✅ Current issues: ${initialIssueCount}\n`);
  } catch (error) {
    console.log('⚠️  Could not get issue count:', error.message);
  }
  
  // Step 3: Instructions for manual testing
  console.log('3️⃣ Manual Test Instructions:');
  console.log('----------------------------');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Click "Analyze Dependencies" button');
  console.log('3. Wait for the visualization to load');
  console.log('4. Hover over different nodes until you find one without an extension');
  console.log('   (Look for files like README, LICENSE, Dockerfile)');
  console.log('5. You should see an error in the browser console');
  console.log('6. Wait about 5-10 seconds for the issue to be created\n');
  
  console.log('Press Enter after you\'ve triggered the error...');
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  // Step 4: Check for new issues
  console.log('\n4️⃣ Checking for new GitHub issues...');
  
  setTimeout(() => {
    try {
      const issues = execSync('gh issue list --state all --json number,title,createdAt --limit 5', { 
        encoding: 'utf-8' 
      });
      const allIssues = JSON.parse(issues);
      const newIssueCount = allIssues.length;
      
      // Find recent auto-generated issues
      const fiveMinutesAgo = new Date(Date.now() - 300000);
      const recentIssues = allIssues.filter(issue => {
        const createdAt = new Date(issue.createdAt);
        return createdAt > fiveMinutesAgo && issue.title.includes('[Auto-Generated]');
      });
      
      if (recentIssues.length > 0) {
        console.log(`✅ Found ${recentIssues.length} new auto-generated issue(s):\n`);
        
        recentIssues.forEach(issue => {
          console.log(`   Issue #${issue.number}: ${issue.title}`);
          console.log(`   Created: ${new Date(issue.createdAt).toLocaleString()}`);
          
          // Get issue details
          try {
            const details = execSync(`gh issue view ${issue.number} --json body,assignees`, {
              encoding: 'utf-8',
              stdio: 'pipe'
            });
            const issueData = JSON.parse(details);
            
            console.log('   Content preview:');
            const preview = issueData.body.substring(0, 200).replace(/\n/g, ' ');
            console.log(`   ${preview}...`);
            
            if (issueData.assignees && issueData.assignees.length > 0) {
              console.log(`   Assigned to: ${issueData.assignees.map(a => a.login).join(', ')}`);
            }
            
            console.log('');
          } catch (e) {
            console.log('   Could not get issue details\n');
          }
        });
        
        console.log('🎉 Exception capture is working correctly!');
        
        // Offer to close test issues
        console.log('\nWould you like to close these test issues? (y/n)');
        
        process.stdin.once('data', (data) => {
          if (data.toString().trim().toLowerCase() === 'y') {
            recentIssues.forEach(issue => {
              try {
                execSync(`gh issue close ${issue.number} --comment "Test issue - closed after verification"`, {
                  stdio: 'pipe'
                });
                console.log(`Closed issue #${issue.number}`);
              } catch (e) {
                console.log(`Could not close issue #${issue.number}`);
              }
            });
          }
          process.exit(0);
        });
        
      } else {
        console.log('❌ No new auto-generated issues found');
        console.log('\nPossible reasons:');
        console.log('- The error handler might be disabled (check NODE_ENV)');
        console.log('- The error might be rate-limited (wait 5 minutes and try again)');
        console.log('- There might be an issue with GitHub CLI authentication');
        console.log('- The server might not have the error handling code');
        
        process.exit(1);
      }
      
    } catch (error) {
      console.log('❌ Error checking issues:', error.message);
      process.exit(1);
    }
  }, 2000);
  
})();