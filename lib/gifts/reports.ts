import type { SupabaseClient } from "@supabase/supabase-js";
import { REPORT_COLUMNS, type PaymentReport } from "./pix";

export async function loadPaymentReports(supabase: SupabaseClient): Promise<PaymentReport[]> {
  const reports: PaymentReport[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from("gift_payment_reports").select(REPORT_COLUMNS)
      .order("reported_at", { ascending: false }).order("id").range(offset, offset + 999);
    if (error) throw new Error("Não foi possível carregar os avisos de pagamento.");
    reports.push(...(data ?? []));
    if (!data || data.length < 1000) return reports;
  }
}
