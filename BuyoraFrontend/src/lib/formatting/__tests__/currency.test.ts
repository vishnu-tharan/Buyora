import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDiscount, formatCompactCurrency } from '../currency';

describe('formatCurrency', () => {
  it('formats LKR correctly', () => {
    const result = formatCurrency(1500, 'LKR');
    expect(result).toContain('1,500');
  });

  it('formats zero correctly', () => {
    const result = formatCurrency(0, 'LKR');
    expect(result).toContain('0');
  });

  it('formats large amounts with commas', () => {
    const result = formatCurrency(1000000, 'LKR');
    expect(result).toContain('1,000,000');
  });

  it('formats decimal amounts correctly', () => {
    const result = formatCurrency(1500.5, 'LKR');
    expect(result).toContain('1,500');
  });
});

describe('formatDiscount', () => {
  it('formats discount percentage', () => {
    expect(formatDiscount(25)).toBe('25% OFF');
  });

  it('rounds fractional percentages', () => {
    expect(formatDiscount(24.7)).toBe('25% OFF');
  });
});

describe('formatCompactCurrency', () => {
  it('formats millions', () => {
    const result = formatCompactCurrency(1500000, 'LKR');
    expect(result).toContain('1.5M');
  });

  it('formats thousands', () => {
    const result = formatCompactCurrency(5000, 'LKR');
    expect(result).toContain('5K');
  });
});
