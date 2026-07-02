import { fail, ok } from '@/lib/enterprise-admin/api-response';
import { createTableService } from '@/lib/services/admin-table-service';

export function createAdminCrudRoute(config: Parameters<typeof createTableService>[0]) {
  const service = createTableService(config);

  return {
    async GET() {
      try { return ok(await service.list()); } catch (e) { return fail(e); }
    },
    async POST(request: Request) {
      try { return ok(await service.create(await request.json())); } catch (e) { return fail(e); }
    },
    async PATCH(request: Request) {
      try {
        const body = await request.json();
        const { id, ...payload } = body;
        if (!id) return fail(new Error('Missing id'), 400);
        return ok(await service.update(id, payload));
      } catch (e) { return fail(e); }
    },
    async DELETE(request: Request) {
      try {
        const { id } = await request.json();
        if (!id) return fail(new Error('Missing id'), 400);
        return ok(await service.remove(id));
      } catch (e) { return fail(e); }
    },
  };
}
