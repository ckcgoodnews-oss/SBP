import { createAdminCrudRoute } from '@/lib/enterprise-admin/route-handlers';

const h = createAdminCrudRoute({
  table: 'iam_permissions',
  orderBy: 'module_key',
});

export const GET = h.GET;
export const POST = h.POST;
export const PATCH = h.PATCH;
export const DELETE = h.DELETE;
