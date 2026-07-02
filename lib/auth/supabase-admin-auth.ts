import { createServerAdminSupabaseClient } from '@/lib/supabase/server-admin';

export async function createSupabaseAuthUser(input: {
  email: string;
  password?: string;
  fullName: string;
  emailConfirm?: boolean;
}) {
  const supabase = createServerAdminSupabaseClient();

  const generatedPassword =
    input.password && input.password.length >= 8
      ? input.password
      : crypto.randomUUID() + 'Aa1!';

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: generatedPassword,
    email_confirm: input.emailConfirm ?? true,
    user_metadata: {
      full_name: input.fullName
    }
  });

  if (error) {
    const message = error.message || '';
    if (message.toLowerCase().includes('already')) {
      const { data: listed, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw new Error(listError.message);
      const found = listed.users.find((u) => u.email?.toLowerCase() === input.email.toLowerCase());
      if (found) return { user: found, generatedPassword, alreadyExisted: true };
    }
    throw new Error(message);
  }

  if (!data.user) throw new Error('Supabase did not return created user.');

  return { user: data.user, generatedPassword, alreadyExisted: false };
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = createServerAdminSupabaseClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email
  });

  if (error) throw new Error(error.message);
  return data;
}
