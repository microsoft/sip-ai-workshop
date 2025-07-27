const { test, expect } = require('@playwright/test');

test.describe('Application Loading', () => {
  test('should load the main page with all UI elements', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle('Code Dependency Visualizer');
    
    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Dependency Visualizer');
    
    // Check sidebar elements
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();
    
    // Check controls
    const pathInput = page.locator('#pathInput');
    await expect(pathInput).toBeVisible();
    await expect(pathInput).toHaveValue('./');
    
    const analyzeBtn = page.locator('#analyzeBtn');
    await expect(analyzeBtn).toBeVisible();
    await expect(analyzeBtn).toHaveText('Analyze Dependencies');
    
    // Check stats section
    const stats = page.locator('#stats');
    await expect(stats).toBeVisible();
    
    // Check options
    const showLabelsCheckbox = page.locator('#showLabels');
    await expect(showLabelsCheckbox).toBeVisible();
    await expect(showLabelsCheckbox).toBeChecked();
    
    // Check visualization area
    const graph = page.locator('#graph');
    await expect(graph).toBeVisible();
  });

  test('should display loading state and render initial graph', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the initial graph to be rendered
    await page.waitForFunction(() => {
      const svg = document.querySelector('#graph');
      return svg && svg.querySelectorAll('.node').length > 0;
    }, { timeout: 10000 });
    
    // Check that nodes are rendered
    const nodes = page.locator('.node');
    await expect(nodes).toHaveCount(await nodes.count());
    expect(await nodes.count()).toBeGreaterThan(0);
    
    // Check that stats are updated
    const fileCount = page.locator('#fileCount');
    await expect(fileCount).not.toHaveText('-');
    
    const dependencyCount = page.locator('#dependencyCount');
    await expect(dependencyCount).not.toHaveText('-');
    
    const directoryCount = page.locator('#directoryCount');
    await expect(directoryCount).not.toHaveText('-');
  });

  test('should handle viewport resizing', async ({ page }) => {
    await page.goto('/');
    
    // Test different viewport sizes
    const viewportSizes = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 768, height: 1024 }
    ];
    
    for (const size of viewportSizes) {
      await page.setViewportSize(size);
      
      // Check that main elements are still visible
      await expect(page.locator('.sidebar')).toBeVisible();
      await expect(page.locator('#graph')).toBeVisible();
      
      // Give the graph time to adjust
      await page.waitForTimeout(500);
    }
  });
});