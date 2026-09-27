import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeDate } from '../date';

describe('formatDate', () => {
  it('formats ISO date string correctly', () => {
    const result = formatDate('2025-01-15T10:00:00Z');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('handles invalid date gracefully', () => {
    const result = formatDate('not-a-date');
    expect(result).toBe('Invalid date');
  });

  it('accepts custom format pattern', () => {
    const result = formatDate('2025-06-01T00:00:00Z', 'yyyy-MM-dd');
    expect(result).toBe('2025-06-01');
  });
});

describe('formatRelativeDate', () => {
  it('returns relative time for recent dates', () => {
    const recentDate = new Date(Date.now() - 60000).toISOString(); // 1 min ago
    const result = formatRelativeDate(recentDate);
    expect(result).toContain('ago');
  });

  it('handles invalid dates gracefully', () => {
    const result = formatRelativeDate('invalid');
    expect(result).toBe('Unknown date');
  });
});
