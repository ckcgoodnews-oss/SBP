import { ok } from '@/lib/api/http';

export async function GET() {
  return ok({
    auth: 'client-managed',
    message: 'Use the browser Supabase client for session state. Server API authorization hardening comes in the next patch.'
  });
}
