import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { AdminNav } from "@/components/admin/AdminNav";
import styles from "./adminLayout.module.css";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const claims = await requireAdmin();

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand}>
          <span>J</span>
          <i>&</i>
          <span>J</span>
        </Link>

        <AdminNav />

        <div className={styles.sidebarBottom}>
          <div className={styles.userAvatar}>
            {String(claims.email ?? "A")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className={styles.userText}>
            <strong>Administrador</strong>
            <span>{String(claims.email ?? "")}</span>
          </div>

          <form action="/auth/logout" method="post">
            <button type="submit" title="Sair">
              ↗
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
