// server/src/shared/constants/roles.js
const ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  OUTLET_MANAGER: 'OUTLET_MANAGER',
  ADMIN: 'ADMIN',
});

const ROLE_HIERARCHY = Object.freeze({
  [ROLES.CUSTOMER]: 1,
  [ROLES.OUTLET_MANAGER]: 2,
  [ROLES.ADMIN]: 3,
});

const ROLE_PERMISSIONS = {
  [ROLES.CUSTOMER]: [
    'browse:products',
    'cart:read',
    'cart:write',
    'orders:create',
    'orders:read:own',
    'payments:create',
    'reviews:create',
    'reviews:read',
    'profile:read',
    'profile:write',
  ],
  [ROLES.OUTLET_MANAGER]: [
    'browse:products',
    'menu:crud',
    'inventory:read',
    'inventory:write',
    'offers:crud',
    'orders:read:outlet',
    'orders:process:outlet',
    'analytics:read:outlet',
    'profile:read',
    'profile:write',
  ],
  [ROLES.ADMIN]: [
    'users:crud',
    'outlets:crud',
    'audit:read',
    'analytics:read:platform',
    'roles:assign',
    'system:config',
  ],
};

const REGISTERABLE_ROLES = Object.freeze([ROLES.CUSTOMER]);
const SEEDED_ROLES = Object.freeze([ROLES.ADMIN]);

export {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  REGISTERABLE_ROLES,
  SEEDED_ROLES,
};
