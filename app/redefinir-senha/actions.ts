"use server";

import { redirect } from "next/navigation";
import { requirePasswordSession } from "@/lib/auth/passwordSession";

export async function updatePassword(formData: FormData) {
  const supabase = await requirePasswordSession();
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (password.length < 8 || password.length > 128) redirect("/redefinir-senha?erro=tamanho");
  if (password !== confirmation) redirect("/redefinir-senha?erro=confirmacao");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") redirect("/redefinir-senha?erro=igual");
    if (error.code === "weak_password") redirect("/redefinir-senha?erro=fraca");
    redirect("/redefinir-senha?erro=servico");
  }

  await supabase.auth.signOut({ scope: "global" });
  redirect("/login?sucesso=senha");
}
