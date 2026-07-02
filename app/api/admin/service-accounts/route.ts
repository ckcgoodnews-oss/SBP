import { createAdminCrudRoute } from '@/lib/enterprise-admin/route-handlers';
const h = createAdminCrudRoute({ table: 'service_accounts', orderBy: 'created_at' });
export const GET = h.GET; export const POST = h.POST; export const PATCH = h.PATCH; export const DELETE = h.DELETE;
