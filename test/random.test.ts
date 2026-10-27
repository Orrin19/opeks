import test from 'node:test';
import assert from 'node:assert/strict';
import { chance, getRandomInt, pick } from '../src/utils/random';

test('getRandomInt returns integers within the inclusive bounds', () => {
  for (let i = 0; i < 1_000; i++) {
    const value = getRandomInt(1, 6);
    assert.ok(Number.isInteger(value));
    assert.ok(value >= 1 && value <= 6);
  }
});

test('getRandomInt handles a single-value range', () => {
  assert.equal(getRandomInt(5, 5), 5);
});

test('pick returns an element from the array', () => {
  const array = ['a', 'b', 'c'];
  for (let i = 0; i < 100; i++) {
    assert.ok(array.includes(pick(array)));
  }
});

test('pick throws on an empty array', () => {
  assert.throws(() => pick([]));
});

test('chance(0) is always false and chance(100) is always true', () => {
  for (let i = 0; i < 100; i++) {
    assert.equal(chance(0), false);
    assert.equal(chance(100), true);
  }
});
