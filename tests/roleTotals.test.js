/**
 * Test for computeRoleTotals() — the pure grouping/summing helper added in V1.8.1
 * for the "per role, whole-offer" hour rollup (Scoro UI Refresh extension).
 *
 * This does NOT duplicate the function. It reads the live source straight out of
 * content.js and evals just that function, so the test always exercises exactly
 * what ships in the extension — no drift between test and implementation.
 *
 * Run: node roleTotals.test.js /path/to/content.js
 */

const fs = require('fs');
const assert = require('assert');
const path = require('path');

const contentJsPath = process.argv[2];
if (!contentJsPath) {
  console.error('Usage: node roleTotals.test.js <path-to-content.js>');
  process.exit(1);
}

const source = fs.readFileSync(path.resolve(contentJsPath), 'utf8');

const startMarker = 'function computeRoleTotals(rows) {';
const endMarker = "// Renders the \"per role\" block";

const startIdx = source.indexOf(startMarker);
const endIdx = source.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not locate computeRoleTotals() in content.js — did the surrounding comments change?');
  process.exit(1);
}

const fnSource = source.slice(startIdx, endIdx);

// eslint-disable-next-line no-eval
eval(fnSource);
assert.strictEqual(typeof computeRoleTotals, 'function', 'computeRoleTotals should have been extracted correctly');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ok  - ${name}`);
    passed++;
  } catch (err) {
    console.log(`FAIL  - ${name}`);
    console.log(`        ${err.message}`);
    failed++;
  }
}

test('sums external hours only for hour-unit rows, across sections', () => {
  const rows = [
    { name: 'Account Director', unit: 'hour', qty: 5, internal: 0 },
    { name: 'Account Director', unit: 'hour', qty: 3, internal: 0 }, // different section, same role
  ];
  const result = computeRoleTotals(rows);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].name, 'Account Director');
  assert.strictEqual(result[0].ext, 8);
  assert.strictEqual(result[0].int, 0);
});

test('sums internal hours regardless of the row unit (pcs excluded from ext, kept for int)', () => {
  const rows = [
    { name: 'Senior Strategic Planner', unit: 'pcs', qty: 10, internal: 4 },
  ];
  const result = computeRoleTotals(rows);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].ext, 0, 'pcs row must not contribute to external hours');
  assert.strictEqual(result[0].int, 4, 'internal hours count regardless of unit');
});

test('accepts all recognized hour unit spellings', () => {
  const rows = [
    { name: 'Editor', unit: 'hour', qty: 1, internal: 0 },
    { name: 'Editor', unit: 'óra', qty: 1, internal: 0 },
    { name: 'Editor', unit: 'h', qty: 1, internal: 0 },
    { name: 'Editor', unit: 'hrs', qty: 1, internal: 0 },
  ];
  const result = computeRoleTotals(rows);
  assert.strictEqual(result[0].ext, 4);
});

test('drops roles whose combined total (ext + int) is zero', () => {
  const rows = [
    { name: 'Flat Fee Item', unit: 'pcs', qty: 1, internal: 0 },
    { name: 'Account Director', unit: 'hour', qty: 2, internal: 0 },
  ];
  const result = computeRoleTotals(rows);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].name, 'Account Director');
});

test('drops rows with an empty/blank role name even if hours are present', () => {
  const rows = [
    { name: '', unit: 'hour', qty: 5, internal: 2 },
    { name: '   ', unit: 'hour', qty: 5, internal: 2 },
    { name: 'Account Director', unit: 'hour', qty: 1, internal: 0 },
  ];
  const result = computeRoleTotals(rows);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].name, 'Account Director');
});

test('combines external and internal hours for the same role across sections independently', () => {
  const rows = [
    { name: 'Account Director', unit: 'hour', qty: 5, internal: 2 },  // section 1
    { name: 'Account Director', unit: 'pcs', qty: 1, internal: 3 },   // section 2, different unit
  ];
  const result = computeRoleTotals(rows);
  assert.strictEqual(result[0].ext, 5);
  assert.strictEqual(result[0].int, 5);
});

test('sorts roles by combined total descending', () => {
  const rows = [
    { name: 'Junior', unit: 'hour', qty: 1, internal: 0 },
    { name: 'Senior', unit: 'hour', qty: 10, internal: 0 },
    { name: 'Mid', unit: 'hour', qty: 5, internal: 0 },
  ];
  const result = computeRoleTotals(rows);
  assert.deepStrictEqual(result.map(r => r.name), ['Senior', 'Mid', 'Junior']);
});

test('handles missing qty/internal (undefined) as zero without throwing', () => {
  const rows = [
    { name: 'Account Director', unit: 'hour', internal: 3 }, // qty undefined
  ];
  const result = computeRoleTotals(rows);
  assert.strictEqual(result[0].ext, 0);
  assert.strictEqual(result[0].int, 3);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
