import { fail, ok } from '@/lib/enterprise-admin/api-response';
import { UserService } from '@/lib/services/admin/UserService';

export async function GET() {
  try {
    return ok(await UserService.list());
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return ok(await UserService.create(body));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...payload } = body;

    if (!id) {
      return fail(new Error('Missing user id'), 400);
    }

    return ok(await UserService.update(id, payload));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return fail(new Error('Missing user id'), 400);
    }

    return ok(await UserService.remove(id));
  } catch (error) {
    return fail(error);
  }
}