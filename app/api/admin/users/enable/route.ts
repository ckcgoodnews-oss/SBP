import { fail, ok } from '@/lib/enterprise-admin/api-response';
import { UserService } from '@/lib/services/admin/UserService';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return fail(new Error('Missing user id'), 400);
    return ok(await UserService.enable(id));
  } catch (error) {
    return fail(error);
  }
}