import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

const logout = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
vi.mock('@/hooks/use-logout', () => ({ useLogout: () => logout }));
vi.mock('next/navigation', () => ({ usePathname: () => '/admin/products' }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('ends the server session when the administrator signs out', () => {
  render(<AdminSidebar isOpen onClose={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));
  expect(logout.mutate).toHaveBeenCalledOnce();
});
