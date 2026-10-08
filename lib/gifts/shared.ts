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
// Product photos from the spreadsheet import are bundled with the site.
// Photos added or replaced in the admin continue to use Supabase Storage.
const importedGiftImages = new Set<string>([
  "554aebe9-c538-4c05-adf5-f27907e10f85.webp",
  "6cfe64b7-178f-448f-9149-c63a91085c3f.webp",
  "ba0069a3-23f3-440d-818b-d2f4a81350c1.webp",
  "9dabc6a2-ba30-40ca-963c-8617ab0f791d.webp",
  "aae22d01-01f2-4316-809c-e0b56f769e28.webp",
  "42f9fd7c-6345-4c97-9e85-da94c6bfd9f8.webp",
  "77085d49-1bc2-486f-88db-55f599023b23.webp",
  "c825d0df-426a-4fdd-98c5-6bcc3e039b22.webp",
  "1beb373c-b147-4811-acd5-f4ecfbffb5d5.webp",
  "ed450bdb-8023-4993-9682-84dc707938bf.webp",
  "6a7395fc-cfb5-4b97-bbc3-bfb8401911c1.webp",
  "43b5a1f0-fea0-48d3-9775-820984a1c2ca.webp",
  "5081c89a-95b9-45c2-8942-cf2a4709ecf9.webp",
  "741e2952-f0b5-4c1f-bfef-0cb9c3ce4a00.webp",
  "0a52eaab-1a33-4316-ac9a-a9b5bd0e6118.webp",
  "7245906d-aa0a-4510-812e-4488ba1daf45.webp",
  "0c6802f9-2d99-44b0-8192-1e401aa87759.webp",
  "2eac9c08-a7fb-4b10-b5b3-a097772c18d3.webp",
  "eb11d02b-31f8-414e-8bb7-bfe8a1e73ab8.webp",
  "28117558-ed32-4ee3-a2f9-4db8642c65d3.webp",
  "451a076e-fad3-47bc-bdc3-117f5e3be3c5.webp",
  "4fe77825-18ef-44ac-ae9e-48bbe26a7858.webp",
  "77ddf587-c059-4818-8ee8-301c6147748b.webp",
  "2d178c07-5ad1-488c-9baf-713c44fa0ddd.webp",
  "adf53bf0-a120-4fb6-8a7d-48d7facf6a9e.webp",
  "aa3aff69-c2c8-48c4-8348-d44000df3f78.webp",
  "bb86697b-36e0-40ab-9658-12756ddfca0f.webp",
  "fbd9a1d9-c8b7-4e13-b587-f1e48a6552e4.webp",
  "dd05eadd-9a46-4e18-ac25-6974546b4d88.webp",
  "7b0bc7cd-82bc-4451-a187-510f8c831cac.webp",
  "67c6c600-c928-4cc9-b4aa-e33dc0ba3a2a.webp",
  "8c848df1-fb6b-4e18-9e2e-208b77dbed02.webp",
  "974949fe-e050-465f-a1fe-29d6369d972d.webp",
  "021c089c-8707-4cd6-846e-df7c272cf603.webp",
  "f724727a-2f92-46be-a09e-e562bee8bb86.webp",
  "2382598b-4481-4af5-bd02-c5b2bac1c145.webp",
  "36ac5824-a9cb-4633-b324-17f17367e359.webp",
  "7864409f-a733-449b-bfea-ecc097ad12d7.webp",
  "203b1407-168f-4e21-9b5f-e473f3ad071f.webp",
  "78539273-c3da-442b-9bd8-6e9f5cb914dc.webp",
  "17b3bc70-52d2-40dd-8d9b-a9e24fa0ea33.webp",
  "d3c27dc2-884c-44bf-94da-ca867ece24b0.webp",
  "e78d636f-041d-41f0-a8a6-8a6a8e916469.webp",
  "6c84c82f-7a44-4582-a124-84816394d89b.webp",
  "bd080096-adcc-4a6d-8316-bf8a44672b51.webp",
  "be2bdecf-05f8-46d7-95d4-dd504f192815.webp",
  "4b7545ef-a2c6-4d09-8e79-98e4498bb65f.webp",
  "793dcd93-f41c-4300-8003-a89190868cfb.webp",
  "bcfcf483-e71b-4b31-96e3-d6f8823dcd09.webp",
  "95f7d1b9-3120-4523-a693-325aeef8af56.webp",
  "039979b3-0be7-4b1e-b120-16c87e2f1ccb.webp",
  "53e41872-6acb-48df-9ca4-0373536f0b25.webp",
  "bfe02cfa-efd3-4309-b422-801302e53ee7.webp",
  "03b86b83-e0f9-4027-b958-a054d1d6c011.webp",
  "64b6c815-d8ee-41a2-9f19-622b621d651c.webp",
  "4be1f104-29b2-454c-88ae-09334d4ca726.webp",
  "3da6da54-3b9a-4043-8334-4751238c36cc.webp",
  "afa13851-7424-4c31-bb02-d383ab22fb55.webp",
  "f6a730da-0f67-4a7d-9a67-2a12004e1425.webp",
  "3eea779e-bd02-4edf-a6dd-6a998852b8d5.webp",
  "100eabba-b566-4c91-ab15-a4bc26c4273c.webp",
  "6afc1e9f-472c-4709-b633-9fe505eb0872.webp"
]);

export function isImportedGiftImage(path: string) {
  return importedGiftImages.has(path);
}

export function giftImageUrl(path: string) {
  if (isImportedGiftImage(path)) return `/gifts/${path}`;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${GIFT_BUCKET}/${encodeURIComponent(path)}`;
}
