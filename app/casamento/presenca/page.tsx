import type { Metadata } from "next";
import Link from "next/link";
import { Monogram } from "@/components/Monogram";
import { RsvpForm } from "@/components/RsvpForm";
import styles from "@/components/RsvpPage.module.css";

export const metadata: Metadata = {
  title: "Confirme sua presença | Jéssica & João Vítor",
  description: "Encontre seu convite e confirme sua presença no nosso casamento.",
};

export default function PresencePage() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link className={styles.backLink} href="/casamento#presenca">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m12 5-7 7 7 7M5 12h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voltar ao site
          </Link>
          <span className={styles.headerDate}>26 · 03 · 2027</span>
        </div>
      </header>

      <main className={styles.layout}>
        <div className={styles.intro}>
          <div className={styles.monogram}><Monogram width={160} tone="color" priority /></div>
          <p className={styles.kicker}>Jéssica & João Vítor</p>
          <h1>Sua presença faz parte da nossa história.</h1>
          <div className={styles.goldLine} aria-hidden="true" />
          <p className={styles.introCopy}>
            Estamos preparando cada detalhe com muito amor.
            Confirme sua presença para vivermos esse dia juntos.
          </p>
          <p className={styles.date}>26 de março de 2027</p>
        </div>

        <RsvpForm />
      </main>
    </div>
  );
}
