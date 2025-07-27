const { test, expect } = require('@playwright/test');

test.describe('Bug Testing - Tooltip Error', () => {
  test('should trigger tooltip error on files without extensions', async ({ page }) => {
    await page.goto('/');
    
    // Wait for graph to load
    await page.waitForFunction(() => {
      const nodes = document.querySelectorAll('.node');
      return nodes.length > 0;
    });
    
    // Look for files without extensions that should cause the bug
    const noExtensionFiles = ['README', 'LICENSE', 'Dockerfile'];
    let bugTriggered = false;
    
    // Set up console error listener
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Try to find and hover over a file without extension
    const nodes = page.locator('.node text');
    const nodeCount = await nodes.count();
    
    for (let i = 0; i < nodeCount; i++) {
      const nodeText = await nodes.nth(i).textContent();
      if (noExtensionFiles.some(file => nodeText.includes(file))) {
        console.log(`Found file without extension: ${nodeText}`);
        
        // Try to hover - this should trigger the bug
        try {
          await nodes.nth(i).hover();
          await page.waitForTimeout(500); // Give time for error to occur
          
          // Check if we got a console error
          if (consoleErrors.some(error => 
            error.includes('Cannot read') || 
            error.includes('undefined') ||
            error.includes('toUpperCase')
          )) {
            bugTriggered = true;
            console.log('Bug successfully triggered!');
            break;
          }
        } catch (error) {
          // Expected - the bug should cause issues
          bugTriggered = true;
          console.log('Bug triggered (caught exception):', error.message);
          break;
        }
      }
    }
    
    // Verify that we found files without extensions and the bug was triggered
    expect(bugTriggered).toBe(true);
  });
  
  test('should still work normally for files with extensions', async ({ page }) => {
    await page.goto('/');
    
    // Wait for graph to load
    await page.waitForFunction(() => {
      const nodes = document.querySelectorAll('.node');
      return nodes.length > 0;
    });
    
    // Find a file WITH an extension
    const nodes = page.locator('.node text');
    const nodeCount = await nodes.count();
    
    let foundFileWithExtension = false;
    
    for (let i = 0; i < nodeCount; i++) {
      const nodeText = await nodes.nth(i).textContent();
      if (nodeText.includes('.js') || nodeText.includes('.html') || nodeText.includes('.json')) {
        console.log(`Testing file with extension: ${nodeText}`);
        
        // This should work fine
        await nodes.nth(i).hover();
        
        // Check that tooltip appears
        const tooltip = page.locator('#tooltip');
        await expect(tooltip).toHaveCSS('opacity', '0.9');
        
        foundFileWithExtension = true;
        break;
      }
    }
    
    expect(foundFileWithExtension).toBe(true);
  });
});