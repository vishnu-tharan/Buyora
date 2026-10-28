export function hasRole(user, role) {
  return user?.roles.some((value) => value === role || value === `ROLE_${role}`) ?? false;
}

export function isAdmin(user) {
  return hasRole(user, 'ADMIN');
}

export function isCustomer(user) {
  return hasRole(user, 'CUSTOMER') || hasRole(user, 'ADMIN');
}

export function getFullName(user) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getInitials(user) {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}
