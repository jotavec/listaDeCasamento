import { getPublicGifts } from "@/lib/gifts/public";
import { GiftCatalog } from "./GiftCatalog";

export async function GiftsSection() {
  const gifts = await getPublicGifts().catch(() => null);
  return <GiftCatalog gifts={gifts ?? []} unavailable={gifts === null} />;
}
