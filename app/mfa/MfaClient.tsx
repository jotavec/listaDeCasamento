"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./mfa.module.css";

type Mode = "loading" | "enroll" | "challenge";

export function MfaClient({ destination = "/admin" }: { destination?: "/admin" | "/redefinir-senha" }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      const supabase = createClient();

      const { data: aal, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) {
        if (!cancelled) setError("Não foi possível validar a sessão.");
        return;
      }

      if (aal?.currentLevel === "aal2") {
        router.replace(destination);
        return;
      }

      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();

      if (factorsError) {
        if (!cancelled) setError("Não foi possível carregar a autenticação em duas etapas.");
        return;
      }

      const verified = factors.totp[0];

      if (verified) {
        if (!cancelled) {
          setFactorId(verified.id);
          setMode("challenge");
        }
        return;
      }

      const { data: enrollment, error: enrollmentError } =
        await supabase.auth.mfa.enroll({
          factorType: "totp",
          friendlyName: "J&J Administração",
        });

      if (enrollmentError || !enrollment) {
        if (!cancelled) {
          setError("Não foi possível preparar o autenticador.");
        }
        return;
      }

      if (!cancelled) {
        setFactorId(enrollment.id);
        setQrCode(enrollment.totp.qr_code);
        setSecret(enrollment.totp.secret);
        setMode("enroll");
      }
    }

    prepare();

    return () => {
      cancelled = true;
    };
  }, [router, destination]);

  async function verify() {
    const cleanCode = code.replace(/\D/g, "");

    if (cleanCode.length !== 6 || !factorId) {
      setError("Digite o código de 6 dígitos do seu autenticador.");
      return;
    }

    setWorking(true);
    setError("");

    const supabase = createClient();

    const { error: verifyError } =
      await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: cleanCode,
      });

    if (verifyError) {
      setWorking(false);
      setError("Código inválido ou expirado. Gere um novo código e tente novamente.");
      return;
    }

    const { data: aal } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aal?.currentLevel !== "aal2") {
      setWorking(false);
      setError("Não foi possível elevar o nível de autenticação.");
      return;
    }

    router.replace(destination);
    router.refresh();
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.monogram}>J & J</div>
        <p className={styles.kicker}>SEGURANÇA</p>

        {mode === "loading" && (
          <>
            <h1>Validando acesso</h1>
            <p>Aguarde um instante.</p>
          </>
        )}

        {mode === "enroll" && (
          <>
            <h1>Proteja sua conta</h1>
            <p>
              Escaneie o QR Code no Google Authenticator,
              Microsoft Authenticator, 1Password ou outro app TOTP.
            </p>

            {qrCode && (
              <div className={styles.qrWrap}>
                <img
                  src={qrCode}
                  alt="QR Code para configurar autenticação em duas etapas"
                  className={styles.qr}
                />
              </div>
            )}

            {secret && (
              <details className={styles.manual}>
                <summary>Não consigo escanear o QR Code</summary>
                <p>Cadastre manualmente este segredo no autenticador:</p>
                <code>{secret}</code>
              </details>
            )}
          </>
        )}

        {mode === "challenge" && (
          <>
            <h1>Confirme sua identidade</h1>
            <p>
              Abra o aplicativo autenticador e informe o código atual.
            </p>
          </>
        )}

        {mode !== "loading" && (
          <div className={styles.verify}>
            <label htmlFor="totp">Código de 6 dígitos</label>
            <input
              id="totp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  verify();
                }
              }}
            />

            <button
              type="button"
              onClick={verify}
              disabled={working}
            >
              {working ? "Validando..." : "Continuar"}
            </button>
          </div>
        )}

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <form action="/auth/logout" method="post">
          <button className={styles.logout} type="submit">
            Sair da conta
          </button>
        </form>
      </section>
    </main>
  );
}
