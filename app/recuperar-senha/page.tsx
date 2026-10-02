import { requestPasswordReset } from "./actions";
import Link from "next/link";
import { SubmitButton } from "@/components/auth/SubmitButton";
import styles from "../login/login.module.css";

const errors: Record<string, string> = {
  email: "Informe um e-mail válido.",
  limite: "Aguarde alguns minutos antes de solicitar outro e-mail.",
  servico: "Não foi possível enviar o e-mail agora. Tente novamente em alguns minutos.",
  link: "O link expirou, já foi usado ou foi aberto em outro navegador. Solicite um novo link e abra-o no mesmo navegador desta solicitação.",
};

export default async function RecoverPasswordPage({ searchParams }: {
  searchParams: Promise<{ erro?: string; enviado?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className={styles.page}>
      <Link href="/login" className={styles.back}>← Voltar ao login</Link>
      <section className={styles.card}>
        <div className={styles.monogram}>J & J</div>
        <p className={styles.kicker}>RECUPERAR ACESSO</p>
        <h1>Esqueceu a senha?</h1>
        <p className={styles.description}>Receba um link para escolher uma nova senha.</p>
        {params.erro && errors[params.erro] && <p className={styles.error} role="alert">{errors[params.erro]}</p>}
        {params.enviado === "1" ? (
          <p className={styles.success} role="status">Se o e-mail estiver cadastrado, você receberá um link de recuperação. Confira também o spam e abra o link neste mesmo navegador.</p>
        ) : (
          <form action={requestPasswordReset} className={styles.form}>
            <label htmlFor="email">E-mail cadastrado</label>
            <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required />
            <SubmitButton>Enviar link de recuperação</SubmitButton>
          </form>
        )}
      </section>
    </main>
  );
}
