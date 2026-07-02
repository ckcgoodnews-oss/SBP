import { sendPasswordResetEmail } from '@/lib/auth/supabase-admin-auth';
import { ok, handleApiError, readJsonOrFormData } from '@/lib/api/http';

export async function POST(request: Request) {
  try {
    const payload = await readJsonOrFormData(request);
    const email = String(payload.email || '');
    if (!email) throw new Error('Email is required.');
    const result = await sendPasswordResetEmail(email);
    return ok({ message: 'Password recovery link generated.', recovery_link: result.properties?.action_link || null });
  } catch (error) {
    return handleApiError(error);
  }
}
