import { requireAdmin } from "@/lib/auth/requireAdmin";
import { MfaClient } from "./MfaClient";

export default async function MfaPage() {
  await requireAdmin({ requireMfa: false });

  return <MfaClient />;
}
