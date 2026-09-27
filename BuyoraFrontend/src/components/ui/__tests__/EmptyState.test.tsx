import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="No items" description="Try adjusting your search" />);
    expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
  });

  it('renders CTA button when provided', () => {
    render(<EmptyState title="No items" action={{ label: 'Browse Products', href: '/' }} />);
    expect(screen.getByText('Browse Products')).toBeInTheDocument();
  });
});
