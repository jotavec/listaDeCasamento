"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";
import { GIFT_BUCKET, MAX_PHOTO_BYTES, parsePrice, type GiftResult } from "@/lib/gifts/shared";
import { processGiftPhoto } from "@/lib/gifts/photo";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function refreshGifts() {
  updateTag("gifts");
  revalidatePath("/casamento");
  revalidatePath("/admin/presentes");
  revalidatePath("/admin");
}

export async function saveGift(form: FormData): Promise<GiftResult> {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(form.get("id") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const cents = parsePrice(String(form.get("price") ?? ""));
  const version = String(form.get("updated_at") ?? "");
  const photo = form.get("photo");
  if (id && !uuid.test(id)) return { ok: false, message: "Presente inválido. Atualize a página." };
  if (title.length < 2 || title.length > 120) return { ok: false, message: "O título precisa ter entre 2 e 120 caracteres." };
  if (cents === null) return { ok: false, message: "Informe um valor entre R$ 0,01 e R$ 1.000.000,00. Exemplo: 250,00." };
  const hasPhoto = photo instanceof File && photo.size > 0;
  if (!id && !hasPhoto) return { ok: false, message: "Escolha a foto do presente." };
  if (hasPhoto && photo.size > MAX_PHOTO_BYTES) return { ok: false, message: "A foto ficou muito grande. Escolha uma imagem menor." };

  let oldPath: string | undefined;
  if (id) {
    const { data, error } = await supabase.from("gifts").select("image_path,updated_at").eq("id", id).single();
    if (error || !data) return { ok: false, message: "Não foi possível abrir este presente. Atualize a página." };
    if (data.updated_at !== version) return { ok: false, message: "Este presente foi alterado em outra tela. Feche e abra a edição novamente." };
    oldPath = data.image_path;
  }
  let uploadedPath: string | undefined;
  if (hasPhoto) {
    let image: Buffer;
    try { image = await processGiftPhoto(Buffer.from(await photo.arrayBuffer())); }
    catch { return { ok: false, message: "Não foi possível ler a foto. Escolha uma imagem JPG, PNG ou WebP válida." }; }
    uploadedPath = `${randomUUID()}.webp`;
    const { error } = await supabase.storage.from(GIFT_BUCKET).upload(uploadedPath, image, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
    if (error) return { ok: false, message: "Não foi possível enviar a foto. Confira sua conexão e tente novamente." };
  }
  const values = { title, price_cents: cents, image_path: uploadedPath ?? oldPath! };
  const query = id
    ? supabase.from("gifts").update(values).eq("id", id).eq("updated_at", version)
    : supabase.from("gifts").insert(values);
  const { data, error } = await query.select("id").single();
  if (error || !data) {
    if (uploadedPath) await supabase.storage.from(GIFT_BUCKET).remove([uploadedPath]);
    return { ok: false, message: "Não foi possível salvar. Atualize a página se o presente foi alterado em outra tela." };
  }
  if (uploadedPath && oldPath) {
    const { error: cleanupError } = await supabase.storage.from(GIFT_BUCKET).remove([oldPath]);
    if (cleanupError) console.error("Gift photo cleanup failed after update");
  }
  refreshGifts();
  return { ok: true, message: id ? "Presente atualizado no site." : "Presente publicado no site." };
}

export async function deleteGift(id: string, version: string): Promise<GiftResult> {
  await requireAdmin();
  if (!uuid.test(id)) return { ok: false, message: "Presente inválido." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("gifts").delete().eq("id", id).eq("updated_at", version).select("image_path").single();
  if (error || !data) return { ok: false, message: "Não foi possível excluir. Atualize a página e tente novamente." };
  const { error: cleanupError } = await supabase.storage.from(GIFT_BUCKET).remove([data.image_path]);
  if (cleanupError) console.error("Gift photo cleanup failed after deletion");
  refreshGifts();
  return { ok: true, message: "Presente excluído da lista e do site." };
}
