export type Gift = {
  id: string;
  title: string;
  price_cents: number;
  image_path: string;
  updated_at: string;
};
export type GiftResult = { ok: boolean; message: string };
export const GIFT_BUCKET = "gift-images";
export const GIFT_COLUMNS = "id,title,price_cents,image_path,updated_at";
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export function parsePrice(value: string): number | null {
  const input = value.trim().replace(/^R\$\s*/, "");
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(input)) return null;
  const [whole, decimals = ""] = input.replaceAll(".", "").split(",");
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 && cents <= 100_000_000 ? cents : null;
}
export function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
export function giftImageUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${GIFT_BUCKET}/${encodeURIComponent(path)}`;
}
