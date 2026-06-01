// =======================================================================
// Lean role model for dream-sales.
// CCB Mart split admin into 6 sub-roles; dream-sales keeps a single `admin`
// role plus the special `ctv` role. authorize('admin') accepts the admin role.
// =======================================================================

const ADMIN_ROLES = ['admin'];
const SPECIAL_ROLES = ['ctv'];
const ALL_ROLES = [...ADMIN_ROLES, ...SPECIAL_ROLES];

const ROLE_LABELS = {
  admin: 'Quản trị viên',
  ctv: 'Cộng tác viên',
};

function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

module.exports = {
  ADMIN_ROLES,
  SPECIAL_ROLES,
  ALL_ROLES,
  ROLE_LABELS,
  isAdminRole,
};
