"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/app/login/login.module.css";

const errors: Record<string, string> = {
  email: "Informe um e-mail válido.",
  limite: "Aguarde alguns minutos antes de solicitar outro e-mail.",
  servico: "Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos.",
  link: "O link expirou, já foi usado ou foi aberto em outro navegador. Solicite um novo link e abra-o no mesmo navegador desta solicitação.",
};

export function RecoveryContent({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const error = errors[params.get("erro") ?? ""];
  return (
    <>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {params.get("enviado") === "1" ? (
        <p className={styles.success} role="status">Se o e-mail estiver cadastrado, você receberá um link de recuperação. Confira também o spam e abra o link neste mesmo navegador.</p>
      ) : children}
    </>
  );
}
