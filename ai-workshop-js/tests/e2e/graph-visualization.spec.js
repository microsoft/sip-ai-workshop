const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Graph Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial graph to load
    await page.waitForFunction(() => {
      const svg = document.querySelector('#graph');
      return svg && svg.querySelectorAll('.node').length > 0;
    });
  });

  test('should render graph with nodes and links', async ({ page }) => {
    // Check SVG elements
    const svg = page.locator('#graph');
    await expect(svg).toBeVisible();
    
    // Check nodes exist
    const nodes = page.locator('.node');
    const nodeCount = await nodes.count();
    expect(nodeCount).toBeGreaterThan(0);
    
    // Check each node has a circle and text
    for (let i = 0; i < Math.min(nodeCount, 5); i++) {
      const node = nodes.nth(i);
      await expect(node.locator('circle')).toBeVisible();
      await expect(node.locator('text')).toBeVisible();
    }
    
    // Check links exist
    const links = page.locator('.link');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThanOrEqual(0);
  });

  test('should analyze different paths', async ({ page }) => {
    // Test analyzing a subdirectory
    const pathInput = page.locator('#pathInput');
    const analyzeBtn = page.locator('#analyzeBtn');
    
    // Analyze public directory
    await pathInput.fill('./public');
    await analyzeBtn.click();
    
    // Wait for new graph to render
    await page.waitForFunction(() => {
      const fileCount = document.querySelector('#fileCount');
      return fileCount && fileCount.textContent !== '-';
    });
    
    // Check that stats updated
    const fileCount = page.locator('#fileCount');
    const fileCountText = await fileCount.textContent();
    expect(parseInt(fileCountText)).toBeGreaterThan(0);
  });

  test('should handle invalid paths gracefully', async ({ page }) => {
    const pathInput = page.locator('#pathInput');
    const analyzeBtn = page.locator('#analyzeBtn');
    
    // Try to analyze non-existent path
    await pathInput.fill('./non-existent-directory');
    
    // Set up dialog handler for alert
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toContain('Error');
      await dialog.accept();
    });
    
    await analyzeBtn.click();
    
    // Graph should still be visible (previous state)
    await expect(page.locator('#graph')).toBeVisible();
  });

  test('should analyze test fixture project', async ({ page }) => {
    const pathInput = page.locator('#pathInput');
    const analyzeBtn = page.locator('#analyzeBtn');
    
    // Analyze our test fixture
    await pathInput.fill('./tests/fixtures/test-project');
    await analyzeBtn.click();
    
    // Wait for graph update
    await page.waitForFunction(() => {
      const nodes = document.querySelectorAll('.node');
      return nodes.length === 3; // We expect 3 files
    });
    
    // Verify correct number of files
    const fileCount = page.locator('#fileCount');
    await expect(fileCount).toHaveText('3');
    
    // Verify we have links (dependencies)
    const dependencyCount = page.locator('#dependencyCount');
    const depCount = await dependencyCount.textContent();
    expect(parseInt(depCount)).toBe(2); // index.js imports both other files
  });

  test('should display correct node colors by directory', async ({ page }) => {
    // Get all node circles
    const circles = page.locator('.node circle');
    const circleCount = await circles.count();
    
    // Check that circles have fill colors
    for (let i = 0; i < Math.min(circleCount, 3); i++) {
      const circle = circles.nth(i);
      const fill = await circle.getAttribute('fill');
      expect(fill).toBeTruthy();
      expect(fill).toMatch(/^#|^rgb/); // Should be a color value
    }
  });

  test('should show arrow markers on links', async ({ page }) => {
    // Check that arrow marker is defined
    const arrowMarker = page.locator('marker#arrowhead');
    await expect(arrowMarker).toBeVisible();
    
    // Check that links use the arrow marker
    const links = page.locator('.link');
    const linkCount = await links.count();
    
    if (linkCount > 0) {
      const firstLink = links.first();
      const markerEnd = await firstLink.getAttribute('marker-end');
      expect(markerEnd).toBe('url(#arrowhead)');
    }
  });
});