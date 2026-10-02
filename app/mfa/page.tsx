import { requireAdmin } from "@/lib/auth/requireAdmin";
import { MfaClient } from "./MfaClient";

export default async function MfaPage({ searchParams }: {
  searchParams: Promise<{ retorno?: string }>;
}) {
  await requireAdmin({ requireMfa: false });
  const { retorno } = await searchParams;

  return <MfaClient destination={retorno === "senha" ? "/redefinir-senha" : "/admin"} />;
}
