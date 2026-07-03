import { fail, ok } from '@/lib/enterprise-admin/api-response';
import { UserService } from '@/lib/services/admin/UserService';

export async function POST(request: Request) {
  try {
    const { id, required } = await request.json();
    if (!id) return fail(new Error('Missing user id'), 400);
    return ok(await UserService.requireMfa(id, Boolean(required)));
  } catch (error) {
    return fail(error);
  }
}