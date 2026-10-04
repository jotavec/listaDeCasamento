import { login } from "./actions";
import Link from "next/link";
import { Suspense } from "react";
import { LoginMessages } from "@/components/auth/LoginMessages";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { AuthBackground } from "@/components/auth/AuthBackground";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <AuthBackground />
      <Link href="/" className={styles.back}>
        ← Voltar ao site
      </Link>

      <section className={styles.card}>
        <div className={styles.monogram}>J & J</div>

        <p className={styles.kicker}>ÁREA RESTRITA</p>
        <h1>Administração</h1>

        <p className={styles.description}>
          Acesso exclusivo aos administradores.
        </p>

        <Suspense fallback={null}><LoginMessages /></Suspense>

        <form action={login} className={styles.form}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            required
          />

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />

          <SubmitButton pendingText="Entrando...">Entrar</SubmitButton>
        </form>

        <Link href="/recuperar-senha" className={styles.recoveryLink}>Esqueci minha senha</Link>

        <p className={styles.security}>
          Login protegido por autenticação em duas etapas.
        </p>
      </section>
    </main>
  );
}
