const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Screenshot Capture and Annotation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for visualization to load
    await page.waitForSelector('#graph');
    
    // Analyze current directory to get some data
    await page.click('#analyzeBtn');
    await page.waitForSelector('.node', { timeout: 10000 });
    
    // Give simulation time to stabilize
    await page.waitForTimeout(2000);
  });

  test('should capture screenshot on "s" key press', async ({ page }) => {
    // Press 's' key to trigger screenshot
    await page.keyboard.press('s');
    
    // Wait for modal to appear
    await page.waitForSelector('.screenshot-modal', { timeout: 5000 });
    
    // Verify modal elements exist
    expect(await page.locator('.screenshot-modal-header h2').textContent()).toBe('Annotate Screenshot');
    expect(await page.locator('#annotationCanvas').isVisible()).toBe(true);
    expect(await page.locator('#annotationText').isVisible()).toBe(true);
    expect(await page.locator('#submitScreenshot').isVisible()).toBe(true);
  });

  test('should close modal on close button click', async ({ page }) => {
    // Open screenshot modal
    await page.keyboard.press('s');
    await page.waitForSelector('.screenshot-modal');
    
    // Click close button
    await page.click('.screenshot-close-btn');
    
    // Verify modal is removed
    await expect(page.locator('.screenshot-modal')).toHaveCount(0);
  });

  test('should close modal on background click', async ({ page }) => {
    // Open screenshot modal
    await page.keyboard.press('s');
    await page.waitForSelector('.screenshot-modal');
    
    // Click on modal background
    await page.click('.screenshot-modal', { position: { x: 10, y: 10 } });
    
    // Verify modal is removed
    await expect(page.locator('.screenshot-modal')).toHaveCount(0);
  });

  test('should allow annotation placement on canvas click', async ({ page }) => {
    // Open screenshot modal
    await page.keyboard.press('s');
    await page.waitForSelector('.screenshot-modal');
    
    // Click on canvas to place annotation
    const canvas = page.locator('#annotationCanvas');
    await canvas.click({ position: { x: 100, y: 100 } });
    
    // Text area should be focused
    await expect(page.locator('#annotationText')).toBeFocused();
    
    // Type annotation text
    await page.fill('#annotationText', 'Test annotation');
    
    // Annotation should be rendered (we can't easily verify canvas content, so check interaction works)
    const textValue = await page.locator('#annotationText').inputValue();
    expect(textValue).toBe('Test annotation');
  });

  test('should clear annotations on clear button click', async ({ page }) => {
    // Open screenshot modal
    await page.keyboard.press('s');
    await page.waitForSelector('.screenshot-modal');
    
    // Add some annotations
    const canvas = page.locator('#annotationCanvas');
    await canvas.click({ position: { x: 100, y: 100 } });
    await page.fill('#annotationText', 'First annotation');
    
    await canvas.click({ position: { x: 200, y: 200 } });
    await page.fill('#annotationText', 'Second annotation');
    
    // Click clear button
    await page.click('#clearAnnotations');
    
    // Text area should be empty
    const textValue = await page.locator('#annotationText').inputValue();
    expect(textValue).toBe('');
  });

  test('should handle multiple annotations', async ({ page }) => {
    // Open screenshot modal
    await page.keyboard.press('s');
    await page.waitForSelector('.screenshot-modal');
    
    const canvas = page.locator('#annotationCanvas');
    
    // Add multiple annotations
    await canvas.click({ position: { x: 50, y: 50 } });
    await page.fill('#annotationText', 'Bug here');
    
    await canvas.click({ position: { x: 150, y: 150 } });
    await page.fill('#annotationText', 'Enhancement suggestion');
    
    await canvas.click({ position: { x: 250, y: 250 } });
    await page.fill('#annotationText', 'UI improvement');
    
    // Verify we can interact with all positions
    expect(await page.locator('#annotationText').isVisible()).toBe(true);
  });

  test('should not open modal when modifier keys are pressed', async ({ page }) => {
    // Try with Ctrl+S (should not open modal)
    await page.keyboard.down('Control');
    await page.keyboard.press('s');
    await page.keyboard.up('Control');
    
    // Modal should not appear
    await page.waitForTimeout(500);
    await expect(page.locator('.screenshot-modal')).toHaveCount(0);
    
    // Try with Meta+S (should not open modal)
    await page.keyboard.down('Meta');
    await page.keyboard.press('s');
    await page.keyboard.up('Meta');
    
    // Modal should not appear
    await page.waitForTimeout(500);
    await expect(page.locator('.screenshot-modal')).toHaveCount(0);
  });

  test('should handle screenshot submission', async ({ page }) => {
    // Mock the API response
    await page.route('/api/screenshot', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          issueUrl: 'https://github.com/test/repo/issues/123',
          status: 'success'
        })
      });
    });
    
    // Listen for alert
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });
    
    // Open screenshot modal
    await page.keyboard.press('s');
    await page.waitForSelector('.screenshot-modal');
    
    // Add annotation
    const canvas = page.locator('#annotationCanvas');
    await canvas.click({ position: { x: 100, y: 100 } });
    await page.fill('#annotationText', 'Test issue annotation');
    
    // Submit screenshot
    await page.click('#submitScreenshot');
    
    // Wait for submission
    await page.waitForTimeout(1000);
    
    // Verify success alert
    expect(alertMessage).toContain('Issue created successfully');
    expect(alertMessage).toContain('https://github.com/test/repo/issues/123');
    
    // Modal should be closed
    await expect(page.locator('.screenshot-modal')).toHaveCount(0);
  });

  test('should handle submission errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/screenshot', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    // Listen for alert
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });
    
    // Open screenshot modal
    await page.keyboard.press('s');
    await page.waitForSelector('.screenshot-modal');
    
    // Add annotation
    const canvas = page.locator('#annotationCanvas');
    await canvas.click({ position: { x: 100, y: 100 } });
    await page.fill('#annotationText', 'Test annotation');
    
    // Submit screenshot
    await page.click('#submitScreenshot');
    
    // Wait for error
    await page.waitForTimeout(1000);
    
    // Verify error alert
    expect(alertMessage).toContain('Failed to create issue');
    
    // Modal should still be open
    await expect(page.locator('.screenshot-modal')).toHaveCount(1);
    
    // Submit button should be re-enabled
    const submitBtn = page.locator('#submitScreenshot');
    await expect(submitBtn).toBeEnabled();
    await expect(submitBtn).toHaveText('Create Issue');
  });

  test('should capture visualization correctly', async ({ page }) => {
    // Ensure we have some nodes visible
    const nodeCount = await page.locator('.node').count();
    expect(nodeCount).toBeGreaterThan(0);
    
    // Open screenshot modal
    await page.keyboard.press('s');
    await page.waitForSelector('.screenshot-modal');
    
    // Canvas should be rendered with content
    const canvas = page.locator('#annotationCanvas');
    await expect(canvas).toBeVisible();
    
    // Get canvas dimensions
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox.width).toBeGreaterThan(0);
    expect(canvasBox.height).toBeGreaterThan(0);
  });
});

test.describe('Screenshot Capture Integration', () => {
  
  test('should work with error handling system', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForSelector('#graph');
    
    // Trigger the tooltip bug first
    await page.click('#analyzeBtn');
    await page.waitForSelector('.node', { timeout: 10000 });
    
    // Now capture screenshot to report the bug visually
    await page.keyboard.press('s');
    await page.waitForSelector('.screenshot-modal');
    
    // Add annotation about the bug
    const canvas = page.locator('#annotationCanvas');
    await canvas.click({ position: { x: 100, y: 100 } });
    await page.fill('#annotationText', 'Tooltip crashes when hovering over files without extensions');
    
    // Close modal
    await page.click('.screenshot-close-btn');
    
    // Verify app still works
    await expect(page.locator('.screenshot-modal')).toHaveCount(0);
    await expect(page.locator('#graph')).toBeVisible();
  });
});