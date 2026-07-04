import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';

export type PasswordResetRequest = {
  userId: string;
  forcePasswordChange: boolean;
  actorEmail?: string | null;
  redirectTo?: string | null;
};

export type PasswordResetResult = {
  user_id: string;
  email: string;
  force_password_change: boolean;
  status: 'reset_link_generated';
  action_link: string | null;
  email_otp: string | null;
  hashed_token: string | null;
  message: string;
};

type TenantUserRow = {
  id: string;
  tenant_id: string;
  auth_user_id?: string | null;
  email: string;
  full_name?: string | null;
};

export class PasswordResetService {
  static async requestPasswordReset(input: PasswordResetRequest): Promise<PasswordResetResult> {
    if (!input.userId) {
      throw new Error('Missing userId');
    }

    const supabase = createServerAdminSupabaseClient();

    const { data: user, error: userError } = await supabase
      .from('tenant_users')
      .select('id, tenant_id, auth_user_id, email, full_name')
      .eq('id', input.userId)
      .single<TenantUserRow>();

    if (userError) throw userError;
    if (!user) throw new Error('User not found');
    if (!user.email) throw new Error('User email is required for password reset');

    const generateLinkPayload: {
      type: 'recovery';
      email: string;
      options?: {
        redirectTo?: string;
      };
    } = {
      type: 'recovery',
      email: user.email,
    };

    if (input.redirectTo) {
      generateLinkPayload.options = {
        redirectTo: input.redirectTo,
      };
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink(generateLinkPayload);

    if (linkError) throw linkError;

    const properties = linkData?.properties ?? {};
    const actionLink = properties.action_link ?? null;
    const emailOtp = properties.email_otp ?? null;
    const hashedToken = properties.hashed_token ?? null;

    await supabase.from('audit_logs').insert({
      tenant_id: user.tenant_id,
      actor_email: input.actorEmail || 'admin@example.com',
      action: 'password_reset_link_generated',
      entity_type: 'tenant_user',
      entity_id: user.id,
      target_user_id: user.id,
      target_email: user.email,
      metadata: {
        force_password_change: input.forcePasswordChange,
        delivery_method: 'custom_email_pending',
        redirect_to: input.redirectTo || null,
        has_action_link: Boolean(actionLink),
        has_email_otp: Boolean(emailOtp),
        has_hashed_token: Boolean(hashedToken),
      },
    });

    return {
      user_id: user.id,
      email: user.email,
      force_password_change: input.forcePasswordChange,
      status: 'reset_link_generated',
      action_link: actionLink,
      email_otp: emailOtp,
      hashed_token: hashedToken,
      message: 'Password reset link generated. Email delivery can now be wired to SendGrid or another provider.',
    };
  }
}