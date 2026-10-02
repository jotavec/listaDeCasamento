"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/recuperar-senha?erro=email");
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lista-de-casamento-smoky.vercel.app";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: new URL("/auth/recuperar", siteUrl).toString(),
  });

  if (error) {
    redirect(error.status === 429 ? "/recuperar-senha?erro=limite" : "/recuperar-senha?erro=servico");
  }

  // Do not reveal whether the address belongs to an existing account.
  redirect("/recuperar-senha?enviado=1");
}
