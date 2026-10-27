import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, hoursToMs } from '../src/utils/time';

test('formatDuration formats seconds as HH:MM:SS', () => {
  assert.equal(formatDuration(0), '00:00:00');
  assert.equal(formatDuration(59), '00:00:59');
  assert.equal(formatDuration(3_661), '01:01:01');
});

test('formatDuration floors fractional seconds', () => {
  assert.equal(formatDuration(90.9), '00:01:30');
});

test('hoursToMs converts hours to milliseconds', () => {
  assert.equal(hoursToMs(1), 3_600_000);
  assert.equal(hoursToMs(0.1), 360_000);
});
