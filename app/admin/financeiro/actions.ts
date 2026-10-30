"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";
import { normalizePixKey, pixText, PIX_KEY_TYPES, UUID, type PixKeyType, type PaymentStatus } from "@/lib/gifts/pix";
import type { GiftResult } from "@/lib/gifts/shared";

export async function savePixSettings(form: FormData): Promise<GiftResult> {
  await requireAdmin();
  const keyType = String(form.get("key_type") ?? "") as PixKeyType;
  const key = PIX_KEY_TYPES.includes(keyType) ? normalizePixKey(keyType, String(form.get("pix_key") ?? "")) : null;
  const name = String(form.get("receiver_name") ?? "").trim();
  const city = String(form.get("receiver_city") ?? "").trim();
  const version = String(form.get("updated_at") ?? "");
  if (!key) return { ok: false, message: "Confira a chave Pix e o tipo selecionado." };
  if (!pixText(name, 25) || name.length > 120 || !pixText(city, 15) || city.length > 80) return { ok: false, message: "Informe o nome do titular e a cidade." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("pix_settings").update({ key_type: keyType, pix_key: key, receiver_name: name, receiver_city: city, enabled: form.get("enabled") === "on" }).eq("id", true).eq("updated_at", version).select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "Não foi possível salvar. Atualize a página e confira se a configuração foi alterada em outra tela." };
  revalidatePath("/admin/financeiro");
  revalidatePath("/casamento");
  return { ok: true, message: "Dados do Pix salvos." };
}

export async function updatePaymentStatus(id: string, version: string, status: PaymentStatus): Promise<GiftResult> {
  await requireAdmin();
  if (!UUID.test(id) || !version || !["reported", "confirmed", "not_found"].includes(status)) return { ok: false, message: "Aviso inválido. Atualize a página." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("gift_payment_reports").update({ status }).eq("id", id).eq("updated_at", version).select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "Não foi possível atualizar. Outra pessoa pode ter conferido este aviso; atualize a página." };
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
  return { ok: true, message: status === "confirmed" ? "Recebimento confirmado." : status === "not_found" ? "Aviso marcado como não localizado." : "Aviso voltou para conferência." };
}
