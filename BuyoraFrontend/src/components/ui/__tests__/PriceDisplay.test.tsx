import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PriceDisplay } from '../PriceDisplay';

describe('PriceDisplay', () => {
  it('renders regular price', () => {
    render(<PriceDisplay price={1500} />);
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
  });

  it('renders sale price and original price when on sale', () => {
    render(<PriceDisplay price={1000} compareAtPrice={1500} />);
    // Sale price should be displayed
    expect(screen.getByText(/1,000/)).toBeInTheDocument();
    // Original price should be struck through
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
  });

  it('does not show strikethrough when no compareAtPrice', () => {
    render(<PriceDisplay price={1500} />);
    const strikethrough = document.querySelector('.line-through');
    expect(strikethrough).not.toBeInTheDocument();
  });
});
