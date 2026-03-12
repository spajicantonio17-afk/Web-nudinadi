import { describe, it, expect } from 'vitest';
import { sanitizeForPrompt, parseJsonResponse } from '@/lib/gemini';

describe('sanitizeForPrompt', () => {
  it('truncates to maxLength', () => {
    const input = 'a'.repeat(300);
    const result = sanitizeForPrompt(input, 100);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it('removes control characters', () => {
    const input = 'Hello\x00World\x07Test';
    const result = sanitizeForPrompt(input);
    expect(result).toBe('Hello World Test'.replace(/ /g, '')); // control chars removed
    expect(result).not.toContain('\x00');
    expect(result).not.toContain('\x07');
  });

  it('escapes double quotes', () => {
    const input = 'He said "hello"';
    const result = sanitizeForPrompt(input);
    expect(result).toContain('\\"');
    expect(result).not.toContain('"hello"');
  });

  it('escapes single quotes', () => {
    const input = "It's a test";
    const result = sanitizeForPrompt(input);
    expect(result).toContain("\\'");
  });

  it('compresses excessive whitespace', () => {
    const input = 'Hello\n\n\n\n\n\nWorld';
    const result = sanitizeForPrompt(input);
    expect(result).toBe('Hello\n\n\nWorld');
  });

  it('compresses excessive spaces', () => {
    const input = 'Hello      World';
    const result = sanitizeForPrompt(input);
    expect(result).toBe('Hello   World');
  });

  it('trims whitespace', () => {
    const result = sanitizeForPrompt('  hello  ');
    expect(result).toBe('hello');
  });

  it('handles empty string', () => {
    expect(sanitizeForPrompt('')).toBe('');
  });
});

describe('parseJsonResponse', () => {
  it('parses plain JSON', () => {
    const result = parseJsonResponse('{"key": "value"}');
    expect(result).toEqual({ key: 'value' });
  });

  it('strips markdown code fences', () => {
    const input = '```json\n{"key": "value"}\n```';
    const result = parseJsonResponse(input);
    expect(result).toEqual({ key: 'value' });
  });

  it('extracts JSON from surrounding text', () => {
    const input = 'Here is the result: {"score": 85} done';
    const result = parseJsonResponse(input);
    expect(result).toEqual({ score: 85 });
  });

  it('parses JSON arrays', () => {
    const result = parseJsonResponse('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseJsonResponse('not json at all')).toThrow();
  });
});
