import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { loadPaymentReports } from "@/lib/gifts/reports";
import { paymentSummary } from "@/lib/gifts/pix";

export default async function AdminDashboard() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: invitations }, { count: giftCount }, reports] = await Promise.all([
    supabase.from("invitations").select("rsvpstatus,maxadults"),
    supabase.from("gifts").select("id", { count: "exact", head: true }),
    loadPaymentReports(supabase).catch(() => null),
  ]);

  return <DashboardOverview invitations={invitations ?? []} giftCount={giftCount ?? 0} payments={reports ? paymentSummary(reports) : null} />;
}
