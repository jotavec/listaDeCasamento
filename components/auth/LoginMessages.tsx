"use client";

import { useSearchParams } from "next/navigation";
import styles from "@/app/login/login.module.css";

const messages: Record<string, string> = {
  credenciais: "E-mail ou senha inválidos.",
  naoautorizado: "Esta conta não possui autorização para acessar a área administrativa.",
  indisponivel: "Não foi possível acessar o serviço de login. Aguarde um instante e tente novamente.",
};

export function LoginMessages() {
  const params = useSearchParams();
  const message = messages[params.get("erro") ?? ""];

  return (
    <>
      {message && <div className={styles.error} role="alert">{message}</div>}
      {params.get("sucesso") === "senha" && (
        <p className={styles.success} role="status">Senha atualizada. Entre com sua nova senha.</p>
      )}
    </>
  );
}
