import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const claims = await requireAdmin();
  return <AdminShell email={String(claims.email ?? "")}>{children}</AdminShell>;
}
