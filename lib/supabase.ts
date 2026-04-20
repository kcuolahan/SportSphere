import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey && supabaseUrl.startsWith("http"))
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function signUp(email: string, password: string) {
  if (!supabase) return { error: { message: "Auth not configured — add Supabase keys to .env.local" } };
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  if (!supabase) return { error: { message: "Auth not configured — add Supabase keys to .env.local" } };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) return;
  return supabase.auth.signOut();
}

export async function getUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function resetPassword(email: string) {
  if (!supabase) return { error: { message: "Auth not configured" } };
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}
