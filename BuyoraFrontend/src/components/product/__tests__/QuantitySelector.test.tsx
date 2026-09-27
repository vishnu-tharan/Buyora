import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuantitySelector } from '../QuantitySelector';

describe('QuantitySelector', () => {
  it('renders with initial value', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={2} onChange={onChange} max={10} />);
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('increments value on plus click', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={2} onChange={onChange} max={10} />);
    const plusButton =
      screen.getByLabelText(/increase/i) || screen.getByRole('button', { name: /\+/ });
    fireEvent.click(plusButton);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('decrements value on minus click', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={2} onChange={onChange} max={10} />);
    const minusButton =
      screen.getByLabelText(/decrease/i) || screen.getByRole('button', { name: /-/ });
    fireEvent.click(minusButton);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('does not go below 1', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={1} onChange={onChange} max={10} />);
    const minusButtons = screen.getAllByRole('button');
    const minusButton = minusButtons[0]; // first button is minus
    expect(minusButton).toBeDisabled();
  });

  it('does not exceed max', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={10} onChange={onChange} max={10} />);
    const plusButtons = screen.getAllByRole('button');
    const plusButton = plusButtons[plusButtons.length - 1]; // last button is plus
    expect(plusButton).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    const onChange = vi.fn();
    render(<QuantitySelector value={2} onChange={onChange} max={10} disabled />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
