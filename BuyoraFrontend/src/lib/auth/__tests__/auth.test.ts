import { describe, it, expect } from 'vitest';
import { hasRole, isAdmin, getFullName, getInitials } from '../index';
import type { User } from '@/types';

const mockUser: User = {
  id: 1,
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  roles: ['CUSTOMER'],
  isEmailVerified: true,
  createdAt: '2025-01-01T00:00:00Z',
};

const mockAdmin: User = {
  ...mockUser,
  roles: ['ADMIN'],
};

describe('hasRole', () => {
  it('returns true when user has the role', () => {
    expect(hasRole(mockUser, 'CUSTOMER')).toBe(true);
  });

  it('returns false when user lacks the role', () => {
    expect(hasRole(mockUser, 'ADMIN')).toBe(false);
  });

  it('returns false for null user', () => {
    expect(hasRole(null, 'CUSTOMER')).toBe(false);
  });
});

describe('isAdmin', () => {
  it('returns true for admin user', () => {
    expect(isAdmin(mockAdmin)).toBe(true);
  });

  it('returns false for customer', () => {
    expect(isAdmin(mockUser)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isAdmin(null)).toBe(false);
  });
});

describe('getFullName', () => {
  it('returns full name', () => {
    expect(getFullName(mockUser)).toBe('John Doe');
  });
});

describe('getInitials', () => {
  it('returns uppercase initials', () => {
    expect(getInitials(mockUser)).toBe('JD');
  });
});
