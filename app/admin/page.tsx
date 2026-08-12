import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "./dashboard.module.css";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: invitations } = await supabase
    .from("invitations")
    .select("rsvpstatus,maxadults");

  const guests = invitations ?? [];

  const totalInvites = guests.length;

  const confirmed = guests.filter(
    (item) => item.rsvpstatus === "confirmed",
  ).length;

  const pending = guests.filter(
    (item) => item.rsvpstatus === "pending",
  ).length;

  const declined = guests.filter(
    (item) => item.rsvpstatus === "declined",
  ).length;

  const adultCapacity = guests.reduce(
    (sum, item) => sum + 1 + Number(item.maxadults ?? 0),
    0,
  );

  const confirmedPercent =
    totalInvites > 0
      ? Math.round((confirmed / totalInvites) * 100)
      : 0;

  const pendingPercent =
    totalInvites > 0
      ? Math.round((pending / totalInvites) * 100)
      : 0;

  const declinedPercent =
    totalInvites > 0
      ? Math.round((declined / totalInvites) * 100)
      : 0;

  return (
    <main className={styles.page}>
      <section className={styles.welcome}>
        <div>
          <p>PAINEL ADMINISTRATIVO</p>

          <h1>
            Bem-vindos ao
            <br />
            <span>nosso casamento.</span>
          </h1>

          <p className={styles.subtitle}>
            Acompanhe convidados, presentes e movimentações
            financeiras em um só lugar.
          </p>
        </div>

        <Link
          href="/admin/convidados"
          className={styles.primaryAction}
        >
          + Novo convidado
        </Link>
      </section>

      <section className={styles.summaryGrid}>
        <article className={styles.mainMetric}>
          <div>
            <p>CONVIDADOS</p>
            <span>Capacidade total cadastrada</span>
          </div>

          <strong>{adultCapacity}</strong>

          <Link href="/admin/convidados">
            Ver lista completa →
          </Link>
        </article>

        <article className={styles.metric}>
          <div className={styles.metricIcon}>✓</div>

          <p>CONFIRMADOS</p>

          <strong>{confirmed}</strong>

          <span>{confirmedPercent}% dos convites</span>
        </article>

        <article className={styles.metric}>
          <div className={styles.metricIcon}>⌛</div>

          <p>AGUARDANDO</p>

          <strong>{pending}</strong>

          <span>{pendingPercent}% dos convites</span>
        </article>

        <article className={styles.metric}>
          <div className={styles.metricIcon}>×</div>

          <p>NÃO IRÃO</p>

          <strong>{declined}</strong>

          <span>{declinedPercent}% dos convites</span>
        </article>
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <p>CONFIRMAÇÕES</p>
              <h2>Status dos convites</h2>
            </div>

            <Link href="/admin/relatorios">
              Relatório →
            </Link>
          </div>

          <div className={styles.chartBody}>
            <div
              className={styles.donut}
              style={{
                background:
                  totalInvites > 0
                    ? `conic-gradient(
                        #173b68 0 ${confirmedPercent}%,
                        #d7b56d ${confirmedPercent}% ${confirmedPercent + pendingPercent}%,
                        #c8c4bb ${confirmedPercent + pendingPercent}% 100%
                      )`
                    : "#ece7dd",
              }}
            >
              <div>
                <strong>{totalInvites}</strong>
                <span>convites</span>
              </div>
            </div>

            <div className={styles.legend}>
              <div>
                <i className={styles.blue} />
                <span>Confirmados</span>
                <strong>{confirmed}</strong>
              </div>

              <div>
                <i className={styles.gold} />
                <span>Aguardando</span>
                <strong>{pending}</strong>
              </div>

              <div>
                <i className={styles.gray} />
                <span>Não irão</span>
                <strong>{declined}</strong>
              </div>
            </div>
          </div>
        </article>

        <article className={styles.sideCard}>
          <div className={styles.cardHeader}>
            <div>
              <p>PRESENTES</p>
              <h2>Lista de presentes</h2>
            </div>
          </div>

          <div className={styles.moduleEmpty}>
            <div>♢</div>

            <strong>Pronta para configurar</strong>

            <span>
              Cadastre os presentes que ficarão disponíveis
              no site.
            </span>

            <Link href="/admin/presentes">
              Abrir presentes
            </Link>
          </div>
        </article>

        <article className={styles.financeCard}>
          <div className={styles.cardHeader}>
            <div>
              <p>FINANCEIRO</p>
              <h2>Movimentação do casamento</h2>
            </div>

            <Link href="/admin/financeiro">
              Ver financeiro →
            </Link>
          </div>

          <div className={styles.financeEmpty}>
            <strong>R$ 0,00</strong>

            <span>
              Nenhuma movimentação financeira cadastrada.
            </span>
          </div>
        </article>

        <article className={styles.quickCard}>
          <p>ATALHOS</p>

          <h2>Gestão rápida</h2>

          <div className={styles.quickLinks}>
            <Link href="/admin/convidados">
              <span>01</span>
              <div>
                <strong>Convidados</strong>
                <small>Cadastro e confirmações</small>
              </div>
            </Link>

            <Link href="/admin/presentes">
              <span>02</span>
              <div>
                <strong>Presentes</strong>
                <small>Lista disponível no site</small>
              </div>
            </Link>

            <Link href="/admin/financeiro">
              <span>03</span>
              <div>
                <strong>Financeiro</strong>
                <small>Valores e recebimentos</small>
              </div>
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
