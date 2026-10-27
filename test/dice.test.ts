import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDiceOutcome,
  formatModifiers,
  parseModifiers,
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
