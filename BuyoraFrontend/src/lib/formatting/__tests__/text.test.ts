import { describe, it, expect } from 'vitest';
import { truncate, slugToTitle, formatVariantAttributes } from '../text';

describe('truncate', () => {
  it('truncates long text', () => {
    const result = truncate('This is a very long text that should be truncated', 20);
    expect(result).toBe('This is a very long...');
    expect(result.length).toBeLessThanOrEqual(23);
  });

  it('does not truncate short text', () => {
    const result = truncate('Short text', 20);
    expect(result).toBe('Short text');
  });

  it('handles exact length boundary', () => {
    const text = 'exactly twenty chars';
    const result = truncate(text, 20);
    expect(result).toBe(text);
  });
});

describe('slugToTitle', () => {
  it('converts slug to title case', () => {
    expect(slugToTitle('wireless-headphones')).toBe('Wireless Headphones');
  });

  it('handles single word', () => {
    expect(slugToTitle('electronics')).toBe('Electronics');
  });
});

describe('formatVariantAttributes', () => {
  it('formats attributes as readable string', () => {
    const result = formatVariantAttributes({ Color: 'Red', Size: 'M' });
    expect(result).toContain('Color: Red');
    expect(result).toContain('Size: M');
    expect(result).toContain('·');
  });
});
