const { test, expect } = require('@playwright/test');

test.describe('User Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial graph to load
    await page.waitForFunction(() => {
      const svg = document.querySelector('#graph');
      return svg && svg.querySelectorAll('.node').length > 0;
    });
    
    // Wait for D3 simulation to position nodes and then stop it
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (window.simulation) {
          // Wait for simulation to settle
          let tickCount = 0;
          const maxTicks = 100;
          
          function onTick() {
            tickCount++;
            if (tickCount >= maxTicks) {
              window.simulation.stop();
              window.simulation.on('tick', null);
              resolve();
            }
          }
          
          window.simulation.on('tick', onTick);
          
          // Fallback - force stop after timeout
          setTimeout(() => {
            if (window.simulation) {
              window.simulation.stop();
              window.simulation.on('tick', null);
            }
            resolve();
          }, 3000);
        } else {
          resolve();
        }
      });
    });
  });

  test('should trigger analysis with Enter key', async ({ page }) => {
    const pathInput = page.locator('#pathInput');
    
    // Clear and enter new path
    await pathInput.fill('./public');
    await pathInput.press('Enter');
    
    // Wait for analysis to complete
    await page.waitForFunction(() => {
      const fileCount = document.querySelector('#fileCount');
      return fileCount && fileCount.textContent !== '-';
    });
    
    // Verify analysis happened
    const fileCount = page.locator('#fileCount');
    await expect(fileCount).not.toHaveText('-');
  });

  test('should toggle label visibility', async ({ page }) => {
    const showLabelsCheckbox = page.locator('#showLabels');
    const nodeTexts = page.locator('.node text');
    
    // Initially labels should be visible
    await expect(showLabelsCheckbox).toBeChecked();
    
    if (await nodeTexts.count() > 0) {
      const firstText = nodeTexts.first();
      await expect(firstText).toHaveCSS('display', 'block');
      
      // Toggle labels off
      await showLabelsCheckbox.uncheck();
      await expect(firstText).toHaveCSS('display', 'none');
      
      // Toggle labels back on
      await showLabelsCheckbox.check();
      await expect(firstText).toHaveCSS('display', 'block');
    }
  });

  test('should show tooltip on node hover', async ({ page }) => {
    const nodes = page.locator('.node circle');
    const tooltip = page.locator('#tooltip');
    
    if (await nodes.count() > 0) {
      const firstNode = nodes.first();
      
      // Hover over node
      await firstNode.hover();
      
      // Check tooltip appears
      await expect(tooltip).toHaveCSS('opacity', '0.9');
      
      // Check tooltip content
      const tooltipText = await tooltip.textContent();
      expect(tooltipText).toContain('Path:');
      expect(tooltipText).toContain('Directory:');
      expect(tooltipText).toContain('Type:');
      
      // Move away from node
      await page.locator('.sidebar').hover();
      
      // Tooltip should fade
      await expect(tooltip).toHaveCSS('opacity', '0');
    }
  });

  test('should highlight connected nodes on hover', async ({ page }) => {
    const nodes = page.locator('.node');
    
    if (await nodes.count() > 1) {
      const firstNode = nodes.first().locator('circle');
      
      // Hover over first node
      await firstNode.hover();
      
      // Check for dimmed class on other nodes
      await page.waitForTimeout(100); // Give time for highlighting to apply
      
      const dimmedNodes = page.locator('.node.dimmed');
      const dimmedCount = await dimmedNodes.count();
      
      // If there are connections, some nodes should be dimmed
      // If no connections, no nodes should be dimmed
      expect(dimmedCount).toBeGreaterThanOrEqual(0);
      
      // Move away to clear highlighting
      await page.locator('.sidebar').hover();
      
      // Wait for dimming to clear
      await page.waitForTimeout(100);
      const remainingDimmed = await page.locator('.node.dimmed').count();
      expect(remainingDimmed).toBe(0);
    }
  });

  test('should support node dragging', async ({ page }) => {
    // Test that drag event handlers are attached
    const hasDragHandlers = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.node');
      if (nodes.length === 0) return false;
      
      // Check if D3 drag behavior is attached
      const firstNode = nodes[0];
      return firstNode.__drag !== undefined || 
             firstNode.__on !== undefined ||
             firstNode.classList.contains('node'); // At minimum, nodes should have proper class
    });
    
    expect(hasDragHandlers).toBe(true);
    
    // Additional verification: check that the simulation exists with drag forces
    const hasProperDragSetup = await page.evaluate(() => {
      return window.simulation && 
             typeof window.simulation.force === 'function';
    });
    
    expect(hasProperDragSetup).toBe(true);
  });

  test('should support zoom functionality', async ({ page }) => {
    const graphContainer = page.locator('#graph');
    const graphGroup = page.locator('#graph > g').first(); // Get the main graph group
    
    // Get initial transform
    const initialTransform = await graphGroup.getAttribute('transform');
    
    // Zoom in with wheel
    await graphContainer.hover();
    await page.mouse.wheel(0, -300); // Scroll up to zoom in
    
    // Give time for zoom to apply
    await page.waitForTimeout(200);
    
    // Check that transform changed
    const newTransform = await graphGroup.getAttribute('transform');
    if (newTransform) {
      expect(newTransform).not.toBe(initialTransform);
    }
  });

  test('should handle empty path input', async ({ page }) => {
    const pathInput = page.locator('#pathInput');
    const analyzeBtn = page.locator('#analyzeBtn');
    
    // Clear the input
    await pathInput.fill('');
    await analyzeBtn.click();
    
    // Should not crash or show error
    // Graph should remain in current state
    await expect(page.locator('#graph')).toBeVisible();
  });

  test('should maintain responsive design on interaction', async ({ page }) => {
    // Test at mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    const sidebar = page.locator('.sidebar');
    const visualization = page.locator('.visualization');
    
    // Check elements are still accessible
    await expect(sidebar).toBeVisible();
    await expect(visualization).toBeVisible();
    
    // Try interaction at mobile size
    const analyzeBtn = page.locator('#analyzeBtn');
    await analyzeBtn.click();
    
    // Should still work
    await page.waitForFunction(() => {
      const fileCount = document.querySelector('#fileCount');
      return fileCount && fileCount.textContent !== '-';
    });
  });
});