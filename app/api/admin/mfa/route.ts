import { createAdminCrudRoute } from '@/lib/enterprise-admin/route-handlers';
const h = createAdminCrudRoute({ table: 'tenant_users', orderBy: 'updated_at' });
export const GET = h.GET; export const POST = h.POST; export const PATCH = h.PATCH; export const DELETE = h.DELETE;
