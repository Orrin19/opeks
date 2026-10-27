import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDiceOutcome,
  formatModifiers,
  formatThresholds,
  parseModifiers,
  parseThresholds,
  resolveThreshold,
  sumModifiers,
} from '../src/utils/dice';

test('parseModifiers returns an empty array for missing/empty input', () => {
  assert.deepEqual(parseModifiers(null), []);
  assert.deepEqual(parseModifiers(undefined), []);
  assert.deepEqual(parseModifiers(''), []);
  assert.deepEqual(parseModifiers('   '), []);
});

test('parseModifiers parses values with optional descriptions', () => {
  assert.deepEqual(parseModifiers('+1 Ловкость, -2 Усталость'), [
    { value: 1, description: 'Ловкость' },
    { value: -2, description: 'Усталость' },
  ]);
});

test('parseModifiers parses bare signed values', () => {
  assert.deepEqual(parseModifiers('+1, -2, +5'), [{ value: 1 }, { value: -2 }, { value: 5 }]);
});

test('parseModifiers skips malformed chunks', () => {
  assert.deepEqual(parseModifiers('+1 Ловкость, мусор, -2'), [
    { value: 1, description: 'Ловкость' },
    { value: -2 },
  ]);
});

test('parseModifiers handles surrounding whitespace', () => {
  assert.deepEqual(parseModifiers('  +3  Реакция , -1 '), [
    { value: 3, description: 'Реакция' },
    { value: -1 },
  ]);
});

test('sumModifiers adds values and returns 0 for an empty list', () => {
  assert.equal(sumModifiers([{ value: 1 }, { value: -2 }, { value: 5 }]), 4);
  assert.equal(sumModifiers([]), 0);
});

test('formatModifiers adds an explicit plus for positive values', () => {
  assert.equal(
    formatModifiers([
      { value: 1, description: 'Ловкость' },
      { value: -2, description: 'Усталость' },
    ]),
    '+1 Ловкость, -2 Усталость',
  );
  assert.equal(formatModifiers([]), '');
});

test('computeDiceOutcome computes total and success against a difficulty', () => {
  const modifiers = parseModifiers('+1 Ловкость, -2 Усталость');
  const outcome = computeDiceOutcome(14, modifiers, 13);

  assert.equal(outcome.roll, 14);
  assert.equal(outcome.modifierTotal, -1);
  assert.equal(outcome.total, 13);
  assert.equal(outcome.success, true);
});

test('computeDiceOutcome marks a failed roll', () => {
  const outcome = computeDiceOutcome(10, [{ value: 2 }], 13);
  assert.equal(outcome.total, 12);
  assert.equal(outcome.success, false);
});

test('computeDiceOutcome has null success without a difficulty', () => {
  const outcome = computeDiceOutcome(14, [], null);
  assert.equal(outcome.total, 14);
  assert.equal(outcome.success, null);
});

test('parseThresholds parses ranges with results', () => {
  assert.deepEqual(parseThresholds('1-5:провал; 6-15:частичный успех; 16-20:полный успех'), [
    { min: 1, max: 5, result: 'провал' },
    { min: 6, max: 15, result: 'частичный успех' },
    { min: 16, max: 20, result: 'полный успех' },
  ]);
});

test('parseThresholds returns an empty array for missing/empty input', () => {
  assert.deepEqual(parseThresholds(null), []);
  assert.deepEqual(parseThresholds(undefined), []);
  assert.deepEqual(parseThresholds(''), []);
  assert.deepEqual(parseThresholds('   '), []);
});

test('parseThresholds skips malformed and inverted chunks', () => {
  assert.deepEqual(parseThresholds('1-5:провал; мусор; 6-10; 5-1:инверсия'), [
    { min: 1, max: 5, result: 'провал' },
  ]);
});

test('parseThresholds tolerates whitespace around separators', () => {
  assert.deepEqual(parseThresholds(' 1 - 5 : провал ; 6 - 10 : успех '), [
    { min: 1, max: 5, result: 'провал' },
    { min: 6, max: 10, result: 'успех' },
  ]);
});

test('parseThresholds sorts ranges ascending', () => {
  assert.deepEqual(parseThresholds('16-20:полный успех; 1-5:провал; 6-15:частичный успех'), [
    { min: 1, max: 5, result: 'провал' },
    { min: 6, max: 15, result: 'частичный успех' },
    { min: 16, max: 20, result: 'полный успех' },
  ]);
});

test('resolveThreshold returns the matching range', () => {
  const thresholds = parseThresholds('1-5:провал; 6-15:частичный успех; 16-20:полный успех');
  assert.equal(resolveThreshold(3, thresholds)?.result, 'провал');
  assert.equal(resolveThreshold(15, thresholds)?.result, 'частичный успех');
  assert.equal(resolveThreshold(20, thresholds)?.result, 'полный успех');
});

test('resolveThreshold clamps totals beyond the edges to the nearest range', () => {
  const thresholds = parseThresholds('1-5:провал; 6-15:частичный успех; 16-20:полный успех');
  assert.equal(resolveThreshold(21, thresholds)?.result, 'полный успех');
  assert.equal(resolveThreshold(100, thresholds)?.result, 'полный успех');
  assert.equal(resolveThreshold(0, thresholds)?.result, 'провал');
  assert.equal(resolveThreshold(-100, thresholds)?.result, 'провал');
});

test('resolveThreshold returns null for a gap between non-contiguous ranges', () => {
  const thresholds = parseThresholds('1-5:провал; 16-20:успех');
  assert.equal(resolveThreshold(10, thresholds), null);
  assert.equal(resolveThreshold(21, thresholds)?.result, 'успех');
});

test('resolveThreshold returns null for an empty list', () => {
  assert.equal(resolveThreshold(10, []), null);
});

test('formatThresholds joins ranges one per line', () => {
  const thresholds = parseThresholds('1-5:провал; 6-15:успех');
  assert.equal(formatThresholds(thresholds), '1–5: провал\n6–15: успех');
});
