// server/src/shared/utils/permissions.js
import { ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../constants/roles.js';

export const hasPermission = (user, permission) => {
  if (!user) return false;
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (user, permissions) =>
  permissions.some((p) => hasPermission(user, p));

export const hasRole = (user, role) => user?.role === role;

export const hasRoleOrHigher = (user, role) => {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[role];
};

export const canAccessOutlet = (user, outletId) => {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role === 'OUTLET_MANAGER') return user.outletId?.toString() === outletId?.toString();
  return false;
};