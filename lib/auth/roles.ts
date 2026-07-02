export const roles = [
  'owner',
  'admin',
  'manager',
  'staff',
  'technician',
  'accountant',
  'customer'
] as const;

export type Role = typeof roles[number];

export const roleLabels: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Administrator',
  manager: 'Manager',
  staff: 'Office Staff',
  technician: 'Technician',
  accountant: 'Accountant',
  customer: 'Customer'
};

export const roleDescriptions: Record<Role, string> = {
  owner: 'Full business control, billing, users, settings, all records.',
  admin: 'Full administrative control except final ownership transfer.',
  manager: 'Operational management, scheduling, staff, reports.',
  staff: 'Office operations, customers, work orders, quotes, invoices.',
  technician: 'Assigned field work, notes, photos, completion workflow.',
  accountant: 'Financial records, invoices, payments, reports.',
  customer: 'Customer portal access only.'
};

export function canManageUsers(role: Role): boolean {
  return role === 'owner' || role === 'admin';
}

export function canManageFinancials(role: Role): boolean {
  return ['owner', 'admin', 'accountant'].includes(role);
}

export function canManageOperations(role: Role): boolean {
  return ['owner', 'admin', 'manager', 'staff'].includes(role);
}

export function canManageInventory(role: Role): boolean {
  return ['owner', 'admin', 'manager', 'staff'].includes(role);
}

export function canUseTechnicianPortal(role: Role): boolean {
  return role === 'technician';
}

export function canUseCustomerPortal(role: Role): boolean {
  return role === 'customer';
}
