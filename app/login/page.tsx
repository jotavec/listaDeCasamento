import { login } from "./actions";
import Link from "next/link";
import styles from "./login.module.css";

type Props = {
  searchParams: Promise<{
    erro?: string;
    sucesso?: string;
  }>;
};

const messages: Record<string, string> = {
  credenciais: "E-mail ou senha inválidos.",
  naoautorizado: "Esta conta não possui autorização para acessar a área administrativa.",
  indisponivel: "Não foi possível acessar o serviço de login. Aguarde um instante e tente novamente.",
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const message = params.erro ? messages[params.erro] : null;

  return (
    <main className={styles.page}>
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

        {message && (
          <div className={styles.error} role="alert">
            {message}
          </div>
        )}

        {params.sucesso === "senha" && (
          <p className={styles.success} role="status">Senha atualizada. Entre com sua nova senha.</p>
        )}

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

          <button type="submit">Entrar</button>
        </form>

        <Link href="/recuperar-senha" className={styles.recoveryLink}>Esqueci minha senha</Link>

        <p className={styles.security}>
          Login protegido por autenticação em duas etapas.
        </p>
      </section>
    </main>
  );
}
