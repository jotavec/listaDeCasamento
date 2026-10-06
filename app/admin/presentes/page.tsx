import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";
import { GIFT_COLUMNS } from "@/lib/gifts/shared";
import { GiftManager } from "@/components/admin/GiftManager";

export default async function GiftsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("gifts").select(GIFT_COLUMNS).order("created_at", { ascending: false }).order("id");
  return <GiftManager gifts={data ?? []} loadError={Boolean(error)} />;
}
