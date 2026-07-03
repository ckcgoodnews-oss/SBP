import { fail, ok } from '@/lib/enterprise-admin/api-response';
import { UserService } from '@/lib/services/admin/UserService';

export async function POST(request: Request) {
  try {
    const { id, reason } = await request.json();
    if (!id) return fail(new Error('Missing id'), 400);

    return ok(await UserService.lock(id, reason));
  } catch (e) {
    return fail(e);
  }
}