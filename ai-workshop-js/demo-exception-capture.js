#!/usr/bin/env node

/**
 * Demo script for Exception Capture Feature
 * Shows how the error handling system automatically creates GitHub issues
 */

const { execSync } = require('child_process');
const http = require('http');

console.log('🎯 Exception Capture Feature Demo');
console.log('=================================\n');

console.log('This demo will show how the error handling system:');
console.log('1. Captures client-side JavaScript errors');
console.log('2. Reports them to the server');
console.log('3. Creates GitHub issues automatically');
console.log('4. Assigns issues to @copilot\n');

console.log('📋 Current GitHub Issues:');
try {
  const issues = execSync('gh issue list --limit 5 --state all', { encoding: 'utf-8' });
  console.log(issues);
} catch (error) {
  console.log('Could not list issues:', error.message);
}

console.log('\n🔄 Testing the Exception Capture...\n');

console.log('The application has a known bug:');
console.log('- Files without extensions (README, LICENSE, Dockerfile)');
console.log('- Cause tooltip errors when hovering');
console.log('- Error: Cannot read properties of undefined (reading \'toUpperCase\')\n');

console.log('When this error occurs:');
console.log('1. Client-side error-reporter.js captures it');
console.log('2. Sends POST to /api/report-error');
console.log('3. Server error-handler.js processes it');
console.log('4. Creates GitHub issue with full context');
console.log('5. Assigns to @copilot for resolution\n');

console.log('📊 Key Features:');
console.log('- Rate limiting: Same error only creates issue once per 5 minutes');
console.log('- Rich context: Stack trace, environment, memory usage');
console.log('- Markdown formatting: Clean, readable issue body');
console.log('- Copilot integration: Auto-assignment for fixes\n');

console.log('🚀 To see it in action:');
console.log('1. Open http://localhost:3000');
console.log('2. Click "Analyze Dependencies"');
console.log('3. Hover over README, LICENSE, or Dockerfile nodes');
console.log('4. Check browser console for error');
console.log('5. Wait ~10 seconds for issue creation');
console.log('6. Run: gh issue list --limit 1\n');

console.log('✅ Success Indicators:');
console.log('- Browser console shows: "[ClientErrorReporter] Error reported successfully"');
console.log('- Server logs show: "[ErrorHandler] Created issue: https://..."');
console.log('- New issue appears in GitHub with [Auto-Generated] prefix');
console.log('- Issue assigned to @copilot (if available)\n');

console.log('📝 Example Issue Created:');
console.log('Title: [Auto-Generated] TypeError: Cannot read properties of undefined');
console.log('Body includes:');
console.log('  - Full stack trace');
console.log('  - Browser information'); 
console.log('  - Memory usage stats');
console.log('  - Instructions for @copilot to fix\n');

console.log('🔍 Checking for recent auto-generated issues...');
setTimeout(() => {
  try {
    const recentIssues = execSync(
      'gh issue list --state all --limit 10 --json number,title,createdAt,assignees | ' +
      'jq -r \'.[] | select(.title | startswith("[Auto-Generated]")) | "Issue #\\(.number): \\(.title)"\'',
      { encoding: 'utf-8' }
    );
    
    if (recentIssues.trim()) {
      console.log('\n✅ Found auto-generated issues:');
      console.log(recentIssues);
      
      // Get details of the most recent one
      const issueNumber = recentIssues.match(/#(\d+)/)[1];
      console.log(`\n📄 Details of issue #${issueNumber}:`);
      
      const issueBody = execSync(`gh issue view ${issueNumber} --json body | jq -r .body | head -20`, {
        encoding: 'utf-8'
      });
      console.log(issueBody);
      console.log('... (truncated)\n');
      
    } else {
      console.log('\n⚠️  No auto-generated issues found yet.');
      console.log('Try triggering the bug and wait for rate limit to expire.\n');
    }
    
  } catch (error) {
    console.log('\nCould not check issues:', error.message);
  }
  
  console.log('🎉 Demo complete!');
  console.log('\nThis exception capture system ensures no errors go unnoticed');
  console.log('and provides a seamless workflow for fixing bugs with @copilot.\n');
  
}, 2000);