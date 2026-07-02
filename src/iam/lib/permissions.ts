import type { PermissionAction } from '../types/iam';

export const IAM_ACTIONS: PermissionAction[] = ['view','create','edit','delete','export','approve','assign','configure','admin'];
export const IAM_MODULES = [
  'dashboard','customers','jobs','dispatch','schedule','technicians','invoices','payments',
  'inventory','warehouse','reports','settings','iam','audit','api_keys','locations',
  'departments','service_accounts','organizations','roles','permissions','sessions','mfa','impersonation'
] as const;
