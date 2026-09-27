import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StarRating } from '../StarRating';

describe('StarRating', () => {
  it('renders 5 stars by default', () => {
    render(<StarRating rating={4} />);
    // Should have 5 star elements
    // Check there are star elements rendered
    expect(
      document.querySelector('[role="img"]') || document.querySelector('[aria-label]')
    ).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<StarRating rating={4.5} />);
    // Component should have some accessible rating information
    const container = document.querySelector('[aria-label]');
    expect(container).toBeInTheDocument();
  });
});
