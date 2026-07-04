import { fail, ok } from '@/lib/enterprise-admin/api-response';
import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return fail(new Error('Missing userId'), 400);
    }

    const supabase = createServerAdminSupabaseClient();

    const { data: user, error: userError } = await supabase
      .from('tenant_users')
      .select('id, tenant_id')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user) return fail(new Error('User not found'), 404);

    const { data: locations, error: locationError } = await supabase
      .from('service_locations')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .order('name', { ascending: true });

    if (locationError) throw locationError;

    const { data: assignments, error: assignmentError } = await supabase
      .from('user_location_permissions')
      .select('service_location_id')
      .eq('tenant_user_id', userId);

    if (assignmentError) throw assignmentError;

    return ok({
      locations: locations ?? [],
      assigned_location_ids: (assignments ?? []).map((row) => row.service_location_id),
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.userId) {
      return fail(new Error('Missing userId'), 400);
    }

    if (!Array.isArray(body.locationIds)) {
      return fail(new Error('locationIds must be an array'), 400);
    }

    const supabase = createServerAdminSupabaseClient();

    const { data: user, error: userError } = await supabase
      .from('tenant_users')
      .select('id, tenant_id, email')
      .eq('id', body.userId)
      .single();

    if (userError) throw userError;
    if (!user) return fail(new Error('User not found'), 404);

    const { error: deleteError } = await supabase
      .from('user_location_permissions')
      .delete()
      .eq('tenant_user_id', body.userId);

    if (deleteError) throw deleteError;

    const uniqueLocationIds = Array.from(new Set(body.locationIds as string[])).filter(Boolean);

    if (uniqueLocationIds.length > 0) {
      const rows = uniqueLocationIds.map((locationId) => ({
        tenant_id: user.tenant_id,
        tenant_user_id: body.userId,
        service_location_id: locationId,
      }));

      const { error: insertError } = await supabase
        .from('user_location_permissions')
        .insert(rows);

      if (insertError) throw insertError;
    }

    await supabase.from('audit_logs').insert({
      tenant_id: user.tenant_id,
      actor_email: body.actorEmail || 'admin@example.com',
      action: 'user_locations_updated',
      entity_type: 'tenant_user',
      entity_id: user.id,
      target_user_id: user.id,
      target_email: user.email,
      metadata: {
        assigned_location_ids: uniqueLocationIds,
        assignment_count: uniqueLocationIds.length,
      },
    });

    return ok({
      user_id: user.id,
      assigned_location_ids: uniqueLocationIds,
    });
  } catch (error) {
    return fail(error);
  }
}