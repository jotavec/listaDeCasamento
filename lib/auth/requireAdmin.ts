import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(
  options: { requireMfa?: boolean } = {},
) {
  const { requireMfa = true } = options;

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login");
  }

  const { data: authorized, error: authorizationError } =
    await supabase.rpc("is_authorized_user");

  if (authorizationError || authorized !== true) {
    redirect("/login?erro=naoautorizado");
  }

  if (requireMfa) {
    const { data: aal, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aalError || aal?.currentLevel !== "aal2") {
      redirect("/mfa");
    }
  }

  return claimsData.claims;
}
