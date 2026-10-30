import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { publicClient } from "@/lib/supabase/public";
import { readJsonObject } from "@/lib/http/request";
import { makePixCode, validName, UUID, type PixSettings } from "@/lib/gifts/pix";

export async function POST(request: Request) {
  const parsed = await readJsonObject(request);
  if (parsed.response) return parsed.response;
  const { gift_id, guest_name, payer_name } = parsed.data;
  if (typeof gift_id !== "string" || !UUID.test(gift_id) || !validName(guest_name) || (payer_name !== "" && !validName(payer_name))) {
    return NextResponse.json({ error: "Confira o nome de quem está presenteando e de quem fará o Pix." }, { status: 400 });
  }
  try {
    const supabase = publicClient();
    const [{ data: gift, error: giftError }, { data: settings, error: settingsError }] = await Promise.all([
      supabase.from("gifts").select("id,title,price_cents").eq("id", gift_id).single(),
      supabase.from("pix_settings").select("pix_key,receiver_name,receiver_city").eq("id", true).eq("enabled", true).maybeSingle(),
    ]);
    if (giftError || !gift) return NextResponse.json({ error: "Este presente não está disponível. Atualize a lista." }, { status: 404 });
    if (settingsError || !settings) return NextResponse.json({ error: "Estamos preparando os dados para receber seu presente. Tente novamente mais tarde." }, { status: 503 });
    const id = randomUUID();
    const reference = id.replaceAll("-", "").slice(0, 25);
    const code = makePixCode(settings as PixSettings, gift.price_cents, reference);
    const qr_image = await QRCode.toDataURL(code, { width: 320, margin: 4, errorCorrectionLevel: "M" });
    return NextResponse.json({ payment: {
      id, gift_id: gift.id, gift_title: gift.title, amount_cents: gift.price_cents,
      guest_name: guest_name.trim(), payer_name: (payer_name as string).trim() || guest_name.trim(),
      pix_key: settings.pix_key, receiver_name: settings.receiver_name, reference, code, qr_image,
    } });
  } catch {
    return NextResponse.json({ error: "Não foi possível abrir o Pix agora. Tente novamente." }, { status: 503 });
  }
}
