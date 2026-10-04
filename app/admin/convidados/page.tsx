import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { GuestList } from "@/components/admin/GuestList";

export default async function ConvidadosPage() {
  const supabase = await createClient();
  const [, { data, error }] = await Promise.all([
    requireAdmin(),
    supabase.from("invitations")
      .select("id,primaryname,maxadults,rsvpstatus,side")
      .order("primaryname", { ascending: true }),
  ]);

  return <GuestList invitations={data ?? []} error={Boolean(error)} />;
}
