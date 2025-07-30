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
        console.log(`[ErrorHandler] Rate limited - skipping issue creation for: ${errorKey}`);
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
      // Create the issue using GitHub CLI
      const command = `gh issue create --title "${this.escapeShellArg(title)}" --body "${this.escapeShellArg(body)}"`;
      const result = execSync(command, { encoding: 'utf-8' });
      
      const issueUrl = result.trim();
      console.log(`[ErrorHandler] Created issue: ${issueUrl}`);
      
      // Extract issue number from URL
      const issueMatch = issueUrl.match(/\\/issues\\/(\d+)$/);
      if (issueMatch) {
        const issueNumber = issueMatch[1];
        
        // Assign to Copilot (if available) - this might fail if no Copilot user exists
        try {
          execSync(`gh issue edit ${issueNumber} --add-assignee github-copilot`, { encoding: 'utf-8' });
        } catch (assignError) {
          console.log(`[ErrorHandler] Could not assign to Copilot: ${assignError.message}`);
        }
      }
      
      return issueUrl;
      
    } catch (error) {
      console.error('[ErrorHandler] Failed to create GitHub issue:', error.message);
    }
  }

  formatIssueBody(errorReport) {
    return `## 🐛 Automatic Error Report

**Timestamp:** ${errorReport.timestamp}
**Source:** ${errorReport.error.source}

### Error Details
\`\`\`
${errorReport.error.name}: ${errorReport.error.message}
\`\`\`

### Stack Trace
\`\`\`
${errorReport.error.stack}
\`\`\`

### Environment Information
- **Node Version:** ${errorReport.context.nodeVersion}
- **Platform:** ${errorReport.context.platform}
- **Working Directory:** ${errorReport.context.workingDirectory}
- **Memory Usage:** ${JSON.stringify(errorReport.context.memoryUsage, null, 2)}
- **Uptime:** ${errorReport.context.uptime}s

### Application Context
\`\`\`json
${JSON.stringify(errorReport.context, null, 2)}
\`\`\`

### Environment Variables
\`\`\`json
${JSON.stringify(errorReport.environment, null, 2)}
\`\`\`

---

## 🤖 Instructions for Copilot

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