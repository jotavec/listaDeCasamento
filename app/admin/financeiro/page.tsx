import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";
import { loadPaymentReports } from "@/lib/gifts/reports";
import { PaymentManager } from "@/components/admin/PaymentManager";

export default async function FinancePage() {
  await requireAdmin();
  const supabase = await createClient();
  const [reports, { data: settings, error }] = await Promise.all([
    loadPaymentReports(supabase).catch(() => null),
    supabase.from("pix_settings").select("id,key_type,pix_key,receiver_name,receiver_city,enabled,updated_at").eq("id", true).single(),
  ]);
  return <PaymentManager reports={reports ?? []} settings={settings} loadError={reports === null || Boolean(error)} />;
}
