import type { ReactNode } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Monogram } from "@/components/Monogram";
import styles from "@/app/admin/adminLayout.module.css";

export function AdminShell({ children, email }: { children: ReactNode; email: string }) {
  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand} aria-label="Voltar ao site do casamento">
          <Monogram width={145} priority />
        </Link>

        <AdminNav />

        <div className={styles.sidebarBottom}>
          <div className={styles.userAvatar}>
            {String(email || "A")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className={styles.userText}>
            <strong>Administrador</strong>
            <span>{email}</span>
          </div>

          <form action="/auth/logout" method="post">
            <button type="submit" title="Sair" aria-label="Sair da administração">
              Sair
            </button>
          </form>
        </div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <p>JÉSSICA & JOÃO VÍTOR</p>
            <strong>Gestão do casamento</strong>
          </div>

          <div className={styles.weddingDate}>
            <span>26</span>
            <i>MAR</i>
            <span>2027</span>
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </section>
    </div>
  );
}
