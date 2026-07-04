import { fail, ok } from '@/lib/enterprise-admin/api-response';
import { PasswordResetService } from '@/lib/services/admin/PasswordResetService';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.userId) {
      return fail(new Error('Missing userId'), 400);
    }

    const result = await PasswordResetService.requestPasswordReset({
      userId: body.userId,
      forcePasswordChange: Boolean(body.forcePasswordChange),
      actorEmail: body.actorEmail || 'admin@example.com',
      redirectTo: body.redirectTo || null,
    });

    return ok(result);
  } catch (error) {
    return fail(error);
  }
}