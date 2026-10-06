// Preview branch only: no database reads or authentication changes.
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GuestList } from "@/components/admin/GuestList";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
export const metadata = { robots: { index: false, follow: false } };
const invitations = Array.from({ length: 28 }, (_, index) => ({ id: `visual-example-${index}`, primaryname: index === 0 ? "Maria Aparecida de Oliveira e Silva · exemplo" : `Convidado de exemplo ${index + 1}`, maxadults: index % 3, rsvpstatus: ["confirmed", "pending", "declined"][index % 3], side: index % 2 ? "groom" : "bride" }));
export default async function Fixture({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  return <AdminShell email="exemplo@example.com"><p style={{fontSize:12,color:"#596579"}}>Prévia visual · dados fictícios</p><Suspense>{view === "dashboard" ? <DashboardOverview invitations={invitations} /> : <GuestList invitations={invitations} error={false} />}</Suspense></AdminShell>;
}
