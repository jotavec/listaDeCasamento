import { login } from "./actions";
import styles from "./login.module.css";

type Props = {
  searchParams: Promise<{
    erro?: string;
  }>;
};

const messages: Record<string, string> = {
  credenciais: "E-mail ou senha inválidos.",
  naoautorizado: "Esta conta não possui autorização para acessar a área administrativa.",
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const message = params.erro ? messages[params.erro] : null;

  return (
    <main className={styles.page}>
      <a href="/" className={styles.back}>
        ← Voltar ao site
      </a>

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

        <p className={styles.security}>
          Login protegido por autenticação em duas etapas.
        </p>
      </section>
    </main>
  );
}
