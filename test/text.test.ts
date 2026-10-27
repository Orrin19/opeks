import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanWikitext, truncate } from '../src/utils/text';

test('cleanWikitext strips templates, links, tags and headings', () => {
  const input =
    '{{Шаблон}} [[Статья|Ссылка]] и [[Простая]] текст <b>жирный</b> == Заголовок == конец';
  const output = cleanWikitext(input);

  assert.ok(!output.includes('{{'));
  assert.ok(!output.includes('[['));
  assert.ok(!output.includes('<b>'));
  assert.ok(!output.includes('=='));
  assert.ok(output.includes('Ссылка'));
  assert.ok(output.includes('Простая'));
  assert.ok(output.includes('жирный'));
});

test('truncate shortens long text and appends an ellipsis', () => {
  const long = 'a'.repeat(100);
  const result = truncate(long, 10);
  assert.ok(result.length <= 13); // 10 chars + '...'
  assert.ok(result.endsWith('...'));
});

test('truncate keeps short text unchanged', () => {
  assert.equal(truncate('hello', 10), 'hello');
});
