import { NextResponse } from "next/server";
import { publicClient } from "@/lib/supabase/public";
import { readJsonObject } from "@/lib/http/request";
import { UUID, validName } from "@/lib/gifts/pix";

export async function POST(request: Request) {
  const parsed = await readJsonObject(request);
  if (parsed.response) return parsed.response;
  const p = parsed.data;
  if (typeof p.id !== "string" || !UUID.test(p.id) || typeof p.gift_id !== "string" || !UUID.test(p.gift_id)
    || !validName(p.guest_name) || !validName(p.payer_name) || !validName(p.gift_title)
    || typeof p.amount_cents !== "number" || !Number.isSafeInteger(p.amount_cents) || p.amount_cents < 1 || p.amount_cents > 100_000_000
    || typeof p.pix_key !== "string" || !p.pix_key || p.pix_key.length > 77) {
    return NextResponse.json({ error: "Não foi possível registrar o aviso. Confira os dados do presente." }, { status: 400 });
  }
  try {
    // This is only a guest's report. Never write confirmation, timestamps or amounts received here.
    // Keep the displayed amount/title/key even if the catalog or destination changed after the Pix was shown.
    const supabase = publicClient();
    const { data: gift, error: lookupError } = await supabase.from("gifts").select("id").eq("id", p.gift_id).maybeSingle();
    if (lookupError) throw new Error("Catalog lookup unavailable");
    const { error } = await supabase.from("gift_payment_reports").insert({
      id: p.id, gift_id: gift?.id ?? null, gift_title: p.gift_title.trim(), amount_cents: p.amount_cents,
      guest_name: p.guest_name.trim(), payer_name: p.payer_name.trim(), pix_key: p.pix_key,
      reference: p.id.replaceAll("-", "").slice(0, 25),
    });
    // The same random ID is retained for retries after a lost response or repeated clicks.
    if (error && error.code !== "23505") return NextResponse.json({ error: "Não conseguimos enviar seu aviso. Tente novamente; não é necessário fazer outro Pix." }, { status: 503 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Não conseguimos enviar seu aviso. Tente novamente; não é necessário fazer outro Pix." }, { status: 503 });
  }
}
