const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ErrorHandler {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.rateLimitMinutes = options.rateLimitMinutes || 5;
    this.recentIssues = new Map();
    this.appState = {};
    
    if (this.enabled) {
      this.setupGlobalHandlers();
    }
  }

  setupGlobalHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleError(error, 'uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.handleError(error, 'unhandledRejection', { promise });
    });

    // Override console.error to catch logged errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      // Look for Error objects in console.error calls
      const errorArg = args.find(arg => arg instanceof Error);
      if (errorArg) {
        this.handleError(errorArg, 'consoleError');
      }
    };
  }

  // Method to wrap functions with error handling
  wrapFunction(fn, context = '') {
    return (...args) => {
      try {
        const result = fn.apply(this, args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch(error => {
            this.handleError(error, 'wrappedFunction', { context, args });
            throw error; // Re-throw to maintain original behavior
          });
        }
        
        return result;
      } catch (error) {
        this.handleError(error, 'wrappedFunction', { context, args });
        throw error; // Re-throw to maintain original behavior
      }
    };
  }

  // Method to update application state context
  updateContext(newState) {
    this.appState = { ...this.appState, ...newState };
  }

  async handleError(error, source, additionalContext = {}) {
    try {
      const errorKey = this.getErrorKey(error);
      
      // Rate limiting: don't create issues for the same error too frequently
      if (this.isRateLimited(errorKey)) {
        const lastReported = this.recentIssues.get(errorKey);
        const timeRemaining = Math.ceil((this.rateLimitMinutes * 60 * 1000 - (Date.now() - lastReported)) / 1000);
        console.log(`[ErrorHandler] Rate limited - skipping issue creation for: ${errorKey}`);
        console.log(`[ErrorHandler] Time remaining: ${timeRemaining} seconds`);
        return;
      }

      const errorReport = this.captureErrorState(error, source, additionalContext);
      await this.createGitHubIssue(errorReport);
      
      // Mark this error as recently reported
      this.recentIssues.set(errorKey, Date.now());
      
    } catch (handlerError) {
      console.error('[ErrorHandler] Failed to handle error:', handlerError);
    }
  }

  getErrorKey(error) {
    // Create a unique key for this error type
    const stack = error.stack || '';
    const firstStackLine = stack.split('\\n')[1] || '';
    return `${error.message}-${firstStackLine}`.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
  }

  isRateLimited(errorKey) {
    const lastReported = this.recentIssues.get(errorKey);
    if (!lastReported) return false;
    
    const now = Date.now();
    const timeDiff = now - lastReported;
    const rateLimitMs = this.rateLimitMinutes * 60 * 1000;
    
    return timeDiff < rateLimitMs;
  }

  captureErrorState(error, source, additionalContext) {
    const timestamp = new Date().toISOString();
    
    return {
      timestamp,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        source
      },
      context: {
        ...this.appState,
        ...additionalContext,
        nodeVersion: process.version,
        platform: process.platform,
        workingDirectory: process.cwd(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        npm_package_name: process.env.npm_package_name,
        npm_package_version: process.env.npm_package_version
      }
    };
  }

  async createGitHubIssue(errorReport) {
    const title = `[Auto-Generated] ${errorReport.error.name}: ${errorReport.error.message}`;
    const body = this.formatIssueBody(errorReport);
    
    try {
      // Create temporary markdown file for issue body
      const tempFile = path.join(process.cwd(), `issue-${Date.now()}.md`);
      fs.writeFileSync(tempFile, body);
      
      // Create the issue using GitHub CLI with markdown file
      // First try without assignee, then try to assign
      const createCommand = `gh issue create --title "${this.escapeShellArg(title)}" --body-file "${tempFile}"`;
      const result = execSync(createCommand, { encoding: 'utf-8' });
      
      const issueUrl = result.trim();
      console.log(`[ErrorHandler] Created issue: ${issueUrl}`);
      
      // Try to assign to @copilot after creation
      const issueMatch = issueUrl.match(/\/issues\/(\d+)$/);
      if (issueMatch) {
        const issueNumber = issueMatch[1];
        try {
          execSync(`gh issue edit ${issueNumber} --add-assignee @copilot`, { 
            encoding: 'utf-8',
            stdio: 'pipe' 
          });
          console.log(`[ErrorHandler] Assigned issue to @copilot`);
        } catch (assignError) {
          console.log(`[ErrorHandler] Could not assign to @copilot: ${assignError.message}`);
        }
      }
      
      // Clean up temp file
      fs.unlinkSync(tempFile);
      
      return issueUrl;
      
    } catch (error) {
      console.error('[ErrorHandler] Failed to create GitHub issue:', error.message);
      
      // Clean up temp file if it exists
      const tempFiles = fs.readdirSync(process.cwd()).filter(f => f.startsWith('issue-') && f.endsWith('.md'));
      tempFiles.forEach(f => {
        try {
          fs.unlinkSync(path.join(process.cwd(), f));
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    }
  }

  formatIssueBody(errorReport) {
    const { error, context, environment, timestamp } = errorReport;
    
    // Format the error details properly
    const errorName = error.name || 'UnknownError';
    const errorMessage = error.message || 'No error message provided';
    const errorStack = error.stack || 'No stack trace available';
    const errorSource = error.source || 'unknown';
    
    // Extract key context details
    const nodeVersion = context.nodeVersion || 'Unknown';
    const platform = context.platform || 'Unknown';
    const workingDir = context.workingDirectory || 'Unknown';
    const memoryUsage = context.memoryUsage ? JSON.stringify(context.memoryUsage, null, 2) : 'Not available';
    const uptime = context.uptime || 0;
    
    // Clean up context for display (remove duplicates)
    const cleanContext = { ...context };
    delete cleanContext.nodeVersion;
    delete cleanContext.platform;
    delete cleanContext.workingDirectory;
    delete cleanContext.memoryUsage;
    delete cleanContext.uptime;
    
    return `## 🐛 Automatic Error Report

**Timestamp:** ${timestamp}  
**Source:** ${errorSource}  
**Error Type:** ${errorName}  

### Error Details

**Message:**
\`\`\`
${errorMessage}
\`\`\`

### Stack Trace
\`\`\`javascript
${errorStack}
\`\`\`

### Environment Information

| Property | Value |
|----------|-------|
| **Node Version** | ${nodeVersion} |
| **Platform** | ${platform} |
| **Working Directory** | \`${workingDir}\` |
| **Process Uptime** | ${uptime.toFixed(2)}s |

**Memory Usage:**
\`\`\`json
${memoryUsage}
\`\`\`

### Application Context

\`\`\`json
${JSON.stringify(cleanContext, null, 2)}
\`\`\`

### Environment Variables

<details>
<summary>Click to expand environment variables</summary>

\`\`\`json
${JSON.stringify(environment, null, 2)}
\`\`\`

</details>

---

## 🤖 Instructions for @copilot

Please help resolve this automatically generated error report by following these steps:

1. **Analyze the Error**: Review the stack trace and context to understand the root cause
2. **Create a Failing Test**: Write a test that reproduces this error
3. **Implement the Fix**: Create a solution that resolves the issue
4. **Create a Pull Request**: Submit your changes with:
   - The failing test demonstrating the bug
   - The fix that makes the test pass
   - Clear explanation of the solution

### Suggested Investigation Areas:
- Check for null/undefined values in the stack trace
- Verify error handling in async operations
- Look for missing validation or edge cases
- Consider defensive programming improvements

**Priority:** High - Automatic error detection indicates real user impact

---

*This issue was automatically generated by the ErrorHandler system*`;
  }

  escapeShellArg(arg) {
    return arg.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  }

  // Cleanup method
  cleanup() {
    // Clean up old rate limit entries
    const now = Date.now();
    const rateLimitMs = this.rateLimitMinutes * 60 * 1000;
    
    for (const [key, timestamp] of this.recentIssues.entries()) {
      if (now - timestamp > rateLimitMs) {
        this.recentIssues.delete(key);
      }
    }
  }
}

module.exports = ErrorHandler;