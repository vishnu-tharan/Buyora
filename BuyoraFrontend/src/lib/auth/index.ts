import type { User, UserRole } from '@/types';

export function hasRole(user: User | null, role: UserRole): boolean {
  return user?.roles.some((value) => value === role || value === `ROLE_${role}`) ?? false;
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'ADMIN');
}

export function isCustomer(user: User | null): boolean {
  return hasRole(user, 'CUSTOMER') || hasRole(user, 'ADMIN');
}

export function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getInitials(user: User): string {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}
