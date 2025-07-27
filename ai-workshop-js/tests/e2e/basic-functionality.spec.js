const { test, expect } = require('@playwright/test');

test.describe('Basic Functionality', () => {
  test('should load app and run basic analysis', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await expect(page.locator('h1')).toHaveText('Dependency Visualizer');
    
    // Check initial state
    await expect(page.locator('#pathInput')).toHaveValue('./');
    
    // Trigger analysis
    await page.locator('#analyzeBtn').click();
    
    // Wait for results
    await page.waitForFunction(() => {
      const fileCount = document.querySelector('#fileCount');
      return fileCount && fileCount.textContent !== '-' && parseInt(fileCount.textContent) > 0;
    });
    
    // Verify stats are updated
    const fileCount = await page.locator('#fileCount').textContent();
    const dependencyCount = await page.locator('#dependencyCount').textContent();
    const directoryCount = await page.locator('#directoryCount').textContent();
    
    expect(parseInt(fileCount)).toBeGreaterThan(0);
    expect(parseInt(dependencyCount)).toBeGreaterThanOrEqual(0);
    expect(parseInt(directoryCount)).toBeGreaterThan(0);
    
    // Check that graph is rendered
    const nodes = page.locator('.node');
    await expect(nodes.first()).toBeVisible();
    
    // Check that we have the expected number of nodes
    const nodeCount = await nodes.count();
    expect(nodeCount).toBe(parseInt(fileCount));
  });

  test('should toggle labels', async ({ page }) => {
    await page.goto('/');
    
    // Wait for graph to load
    await page.waitForFunction(() => {
      return document.querySelectorAll('.node').length > 0;
    });
    
    const checkbox = page.locator('#showLabels');
    const nodeTexts = page.locator('.node text');
    
    // Labels should be visible initially
    await expect(checkbox).toBeChecked();
    
    if (await nodeTexts.count() > 0) {
      // Toggle off
      await checkbox.uncheck();
      
      // Check that at least one label is hidden
      const firstText = nodeTexts.first();
      await expect(firstText).toHaveCSS('display', 'none');
      
      // Toggle back on
      await checkbox.check();
      await expect(firstText).toHaveCSS('display', 'block');
    }
  });
});