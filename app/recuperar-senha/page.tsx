import { requestPasswordReset } from "./actions";
import Link from "next/link";
import { Suspense } from "react";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { RecoveryContent } from "@/components/auth/RecoveryContent";
import styles from "../login/login.module.css";

export default function RecoverPasswordPage() {
  const form = (
    <form action={requestPasswordReset} className={styles.form}>
      <label htmlFor="email">E-mail cadastrado</label>
      <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required />
      <SubmitButton>Enviar link de recuperação</SubmitButton>
    </form>
  );
  return (
    <main className={styles.page}>
      <AuthBackground />
      <Link href="/login" className={styles.back}>← Voltar ao login</Link>
      <section className={styles.card}>
        <div className={styles.monogram}>J & J</div>
        <p className={styles.kicker}>RECUPERAR ACESSO</p>
        <h1>Esqueceu a senha?</h1>
        <p className={styles.description}>Receba um link para escolher uma nova senha.</p>
        <Suspense fallback={form}><RecoveryContent>{form}</RecoveryContent></Suspense>
      </section>
    </main>
  );
}
