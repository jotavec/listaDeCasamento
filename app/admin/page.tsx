import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: invitations }, { count: giftCount }] = await Promise.all([
    supabase.from("invitations").select("rsvpstatus,maxadults"),
    supabase.from("gifts").select("id", { count: "exact", head: true }),
  ]);

  return <DashboardOverview invitations={invitations ?? []} giftCount={giftCount ?? 0} />;
}
