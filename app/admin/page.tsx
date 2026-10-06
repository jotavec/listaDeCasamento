import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { DashboardOverview } from "@/components/admin/DashboardOverview";

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: invitations } = await supabase
    .from("invitations")
    .select("rsvpstatus,maxadults");

  return <DashboardOverview invitations={invitations ?? []} />;
}
