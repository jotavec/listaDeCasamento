import { unstable_cache } from "next/cache";
import { publicClient } from "@/lib/supabase/public";
import { GIFT_COLUMNS, type Gift } from "./shared";

export const getPublicGifts = unstable_cache(async (): Promise<Gift[]> => {
  const { data, error } = await publicClient().from("gifts").select(GIFT_COLUMNS).order("created_at", { ascending: false }).order("id");
  if (error) throw new Error("Não foi possível carregar os presentes.");
  return data ?? [];
}, ["public-gifts"], { tags: ["gifts"], revalidate: 60 });
