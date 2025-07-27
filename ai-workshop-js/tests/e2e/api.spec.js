const { test, expect } = require('@playwright/test');

test.describe('API Tests', () => {
  test('should respond to analyze endpoint with valid path', async ({ request }) => {
    const response = await request.post('/api/analyze', {
      data: { path: './' }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Check response structure
    expect(data).toHaveProperty('nodes');
    expect(data).toHaveProperty('links');
    expect(data).toHaveProperty('stats');
    
    // Check nodes structure
    expect(Array.isArray(data.nodes)).toBe(true);
    if (data.nodes.length > 0) {
      const firstNode = data.nodes[0];
      expect(firstNode).toHaveProperty('id');
      expect(firstNode).toHaveProperty('name');
      expect(firstNode).toHaveProperty('directory');
      expect(firstNode).toHaveProperty('extension');
    }
    
    // Check links structure
    expect(Array.isArray(data.links)).toBe(true);
    if (data.links.length > 0) {
      const firstLink = data.links[0];
      expect(firstLink).toHaveProperty('source');
      expect(firstLink).toHaveProperty('target');
    }
    
    // Check stats structure
    expect(data.stats).toHaveProperty('fileCount');
    expect(data.stats).toHaveProperty('dependencyCount');
    expect(data.stats).toHaveProperty('directories');
    
    expect(typeof data.stats.fileCount).toBe('number');
    expect(typeof data.stats.dependencyCount).toBe('number');
    expect(typeof data.stats.directories).toBe('number');
  });

  test('should handle missing path parameter', async ({ request }) => {
    const response = await request.post('/api/analyze', {
      data: {}
    });
    
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Path is required');
  });

  test('should handle invalid path', async ({ request }) => {
    const response = await request.post('/api/analyze', {
      data: { path: './non-existent-directory-12345' }
    });
    
    expect(response.status()).toBe(500);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(typeof data.error).toBe('string');
  });

  test('should analyze test fixture correctly', async ({ request }) => {
    const response = await request.post('/api/analyze', {
      data: { path: './tests/fixtures/test-project' }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Should find our 3 test files
    expect(data.stats.fileCount).toBe(3);
    
    // Should find 2 dependencies (index.js imports helper.js and utils.js)
    expect(data.stats.dependencyCount).toBe(2);
    
    // Check specific files are found
    const fileNames = data.nodes.map(node => node.name);
    expect(fileNames).toContain('index.js');
    expect(fileNames).toContain('helper.js');
    expect(fileNames).toContain('utils.js');
    
    // Check dependencies are correct
    const dependencies = data.links.map(link => ({
      source: typeof link.source === 'string' ? link.source : link.source.id,
      target: typeof link.target === 'string' ? link.target : link.target.id
    }));
    
    expect(dependencies).toContainEqual({
      source: 'index.js',
      target: 'helper.js'
    });
    
    expect(dependencies).toContainEqual({
      source: 'index.js',
      target: 'utils.js'
    });
  });

  test('should handle different file extensions', async ({ request }) => {
    const response = await request.post('/api/analyze', {
      data: { path: './' }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Check that only supported extensions are included
    const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];
    
    data.nodes.forEach(node => {
      expect(supportedExtensions).toContain(node.extension);
    });
  });

  test('should exclude node_modules and hidden directories', async ({ request }) => {
    const response = await request.post('/api/analyze', {
      data: { path: './' }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Check that no files from node_modules are included
    data.nodes.forEach(node => {
      expect(node.directory).not.toContain('node_modules');
      expect(node.directory).not.toMatch(/^\..*$/); // No hidden directories
    });
  });

  test('should handle concurrent requests', async ({ request }) => {
    // Send multiple requests simultaneously
    const requests = [
      request.post('/api/analyze', { data: { path: './' } }),
      request.post('/api/analyze', { data: { path: './public' } }),
      request.post('/api/analyze', { data: { path: './tests/fixtures/test-project' } })
    ];
    
    const responses = await Promise.all(requests);
    
    // All should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // All should return valid data
    const dataResults = await Promise.all(responses.map(r => r.json()));
    
    dataResults.forEach(data => {
      expect(data).toHaveProperty('nodes');
      expect(data).toHaveProperty('links');
      expect(data).toHaveProperty('stats');
    });
  });

  test('should handle malformed JSON', async ({ request }) => {
    const response = await request.post('/api/analyze', {
      data: 'invalid json string'
    });
    
    // Should handle gracefully (exact behavior depends on Express setup)
    expect([400, 500]).toContain(response.status());
  });
});