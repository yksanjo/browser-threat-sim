const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('extension source layout exists', () => {
  assert.equal(fs.existsSync('manifest.json'), true);
  assert.equal(fs.existsSync('src/background/service-worker.ts'), true);
  assert.equal(fs.existsSync('src/popup/popup.html'), true);
});
