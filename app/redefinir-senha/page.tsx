import { Monogram } from "@/components/Monogram";
import Link from "next/link";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { requirePasswordSession } from "@/lib/auth/passwordSession";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { updatePassword } from "./actions";
import styles from "../login/login.module.css";

const errors: Record<string, string> = {
  tamanho: "Use uma senha entre 8 e 128 caracteres.",
  confirmacao: "As duas senhas precisam ser iguais.",
  fraca: "Escolha uma senha mais forte, com letras, números e símbolos.",
  servico: "Não foi possível atualizar a senha. Tente novamente ou solicite outro link de recuperação.",
};

export default async function ResetPasswordPage({ searchParams }: {
  searchParams: Promise<{ erro?: string }>;
}) {
  await requirePasswordSession();
  const params = await searchParams;
  const passwordUnchanged = params.erro === "igual";
  return (
    <main className={styles.page}>
      <AuthBackground />
      <section className={styles.card}>
        <div className={styles.monogram}><Monogram width={150} priority /></div>
        <p className={styles.kicker}>RECUPERAR ACESSO</p>
        <h1>Nova senha</h1>
        <p className={styles.description}>Escolha uma senha com pelo menos 8 caracteres.</p>
        {passwordUnchanged && (
          <div className={styles.success} role="status">
            Essa já é a senha atual da sua conta. Você pode mantê-la e continuar para o painel.
            Para trocar a senha, escolha uma diferente abaixo.
            <br />
            <Link href="/admin" className={styles.recoveryLink}>Continuar para o painel</Link>
          </div>
        )}
        {params.erro && errors[params.erro] && <p className={styles.error} role="alert">{errors[params.erro]}</p>}
        <form action={updatePassword} className={styles.form}>
          <label htmlFor="password">Nova senha</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
          <label htmlFor="confirmation">Confirme a nova senha</label>
          <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
          <SubmitButton>Salvar nova senha</SubmitButton>
        </form>
      </section>
    </main>
  );
}
