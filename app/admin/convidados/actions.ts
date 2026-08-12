"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function createInvitation(formData: FormData) {
  await requireAdmin();

  const primaryName = String(
    formData.get("primaryName") ?? "",
  ).trim();

  const maxAdultsRaw = String(
    formData.get("maxAdults") ?? "",
  ).trim();

  const side = String(
    formData.get("side") ?? "",
  ).trim();

  if (
    primaryName.length < 2 ||
    primaryName.length > 120 ||
    !/^\d{1,2}$/.test(maxAdultsRaw) ||
    !["bride", "groom"].includes(side)
  ) {
    redirect("/admin/convidados?erro=dados");
  }

  const maxAdults = Number(maxAdultsRaw);

  if (maxAdults < 0 || maxAdults > 20) {
    redirect("/admin/convidados?erro=dados");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("invitations")
    .insert({
      primaryname: primaryName,
      maxadults: maxAdults,
      side,
    });

  if (error) {
    console.error("Erro ao cadastrar convite:", error);
    redirect("/admin/convidados?erro=salvar");
  }

  revalidatePath("/admin/convidados");
  redirect("/admin/convidados?ok=cadastrado");
}

export async function deleteInvitation(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    redirect("/admin/convidados?erro=excluir");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir convite:", error);
    redirect("/admin/convidados?erro=excluir");
  }

  revalidatePath("/admin/convidados");
  redirect("/admin/convidados?ok=excluido");
}
