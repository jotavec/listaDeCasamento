"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (
    !email ||
    !password ||
    email.length > 254 ||
    password.length > 256
  ) {
    redirect("/login?erro=credenciais");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(error.code === "invalid_credentials" || error.code === "invalid_login_credentials"
      ? "/login?erro=credenciais"
      : "/login?erro=indisponivel");
  }

  const { data: authorized, error: authorizationError } =
    await supabase.rpc("is_authorized_user");

  if (authorizationError || authorized !== true) {
    await supabase.auth.signOut();
    redirect("/login?erro=naoautorizado");
  }

  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aal?.currentLevel === "aal2") {
    redirect("/admin");
  }

  redirect("/mfa");
}
