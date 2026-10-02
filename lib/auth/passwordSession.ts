import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requirePasswordSession() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/recuperar-senha?erro=link");

  const { data: authorized, error: authorizationError } = await supabase.rpc("is_authorized_user");
  if (authorizationError || authorized !== true) redirect("/login?erro=naoautorizado");

  const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalError || !aal) redirect("/login?erro=indisponivel");
  if (aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    redirect("/mfa?retorno=senha");
  }
  return supabase;
}
