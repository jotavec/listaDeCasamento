"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePixSettings, updatePaymentStatus } from "@/app/admin/financeiro/actions";
import { formatPrice } from "@/lib/gifts/shared";
import { paymentSummary, STATUS_LABELS, type PaymentReport, type PaymentStatus, type PixSettings } from "@/lib/gifts/pix";
import styles from "./PaymentManager.module.css";

const date = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));

export function PaymentManager({ reports, settings, loadError }: { reports: PaymentReport[]; settings: PixSettings | null; loadError: boolean }) {
  const router = useRouter();
  const [filter, setFilter] = useState<PaymentStatus | "all">("reported");
  const [limit, setLimit] = useState(25);
  const [busy, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") router.refresh(); };
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(interval); window.removeEventListener("focus", refresh); };
  }, [router]);
  const summary = paymentSummary(reports);
  const visible = reports.filter(report => filter === "all" || report.status === filter);

  function change(report: PaymentReport, status: PaymentStatus) {
    if (busy) return;
    const prompt = status === "confirmed"
      ? `Você localizou no extrato o Pix de ${formatPrice(report.amount_cents)}, informado por ${report.guest_name}?`
      : status === "not_found" ? "Marcar este pagamento como não localizado no extrato?" : "Voltar este aviso para conferência? O valor deixará de contar como recebido.";
    if (!window.confirm(prompt)) return;
    setMessage(""); setError("");
    startTransition(async () => {
      try {
        const result = await updatePaymentStatus(report.id, report.updated_at, status);
        if (result.ok) { setMessage(result.message); router.refresh(); } else setError(result.message);
      } catch { setError("Não foi possível atualizar. Confira sua conexão e tente novamente."); }
    });
  }

  return <main className={styles.page}>
    <header className={styles.header}><div><p className={styles.eyebrow}>FINANCEIRO</p><h1>Presentes e recebimentos</h1><p>Confira os avisos dos convidados no extrato da sua conta Mercado Pago.</p></div><button className={styles.secondary} onClick={() => router.refresh()}>Atualizar avisos</button></header>
    {loadError && <p className={styles.error} role="alert">Não foi possível carregar todos os dados. Atualize a página antes de conferir os recebimentos.</p>}
    <section className={styles.metrics} aria-label="Resumo dos recebimentos">
      <article><span>Recebido e confirmado</span><strong>{loadError ? "—" : formatPrice(summary.confirmedCents)}</strong><small>Conferido por vocês no extrato</small></article>
      <article><span>Para conferir</span><strong>{loadError ? "—" : summary.pendingCount}</strong><small>Avisos de “Já fiz o pagamento”</small></article>
      <article><span>Valor informado</span><strong>{loadError ? "—" : formatPrice(summary.pendingCents)}</strong><small>Ainda não somado ao total recebido</small></article>
    </section>
    <details className={styles.settings} open={!settings?.enabled}>
      <summary>Pix da conta Mercado Pago <span>{settings?.enabled ? "Ativo" : "Configuração necessária"}</span></summary>
      {settings ? <SettingsForm key={settings.updated_at} settings={settings} /> : <p>Não foi possível abrir a configuração do Pix.</p>}
    </details>
    <div className={styles.sectionHeader}><div><h2>Avisos de pagamento</h2><p>O clique do convidado informa o pagamento. Confirme o recebimento depois de localizar o Pix no extrato.</p></div><Link href="/admin/presentes">Gerenciar presentes →</Link></div>
    <div className={styles.filters} aria-label="Filtrar avisos">{(["reported", "confirmed", "not_found", "all"] as const).map(value => <button key={value} className={filter === value ? styles.active : ""} aria-pressed={filter === value} onClick={() => { setFilter(value); setLimit(25); }}>{value === "all" ? "Todos" : value === "reported" ? "Para conferir" : STATUS_LABELS[value]} <span>{reports.filter(r => value === "all" || r.status === value).length}</span></button>)}</div>
    {message && <p className={styles.success} role="status">{message}</p>}{error && <p className={styles.error} role="alert">{error}</p>}
    {!visible.length ? <div className={styles.empty}><h3>{loadError ? "Avisos indisponíveis" : "Nenhum aviso nesta categoria"}</h3><p>Quando alguém clicar em “Já fiz o pagamento”, o aviso aparecerá aqui.</p></div> : <div className={styles.reports}>{visible.slice(0, limit).map(report => <article className={styles.report} key={report.id}>
      <div className={styles.reportTop}><div><span className={styles[report.status]}>{STATUS_LABELS[report.status]}</span><h3>{report.guest_name}</h3><p>{report.gift_title}</p></div><strong>{formatPrice(report.amount_cents)}</strong></div>
      <dl><div><dt>Nome no Pix</dt><dd>{report.payer_name}</dd></div><div><dt>Aviso enviado</dt><dd>{date(report.reported_at)}</dd></div>{report.confirmed_at && <div><dt>Recebimento confirmado</dt><dd>{date(report.confirmed_at)}</dd></div>}</dl>
      <details className={styles.reference}><summary>Dados para conferência</summary><p>Identificador: <code>{report.reference}</code></p><p>Chave de destino: {report.pix_key}</p></details>
      <div className={styles.actions}>
        {report.status !== "confirmed" && <button className={styles.primary} disabled={busy || loadError} onClick={() => change(report, "confirmed")}>Confirmar recebimento</button>}
        {report.status === "reported" && <button className={styles.secondary} disabled={busy || loadError} onClick={() => change(report, "not_found")}>Não localizado</button>}
        {report.status !== "reported" && <button className={styles.secondary} disabled={busy || loadError} onClick={() => change(report, "reported")}>Voltar para conferência</button>}
      </div>
    </article>)}</div>}
    {visible.length > limit && <button className={styles.secondary} onClick={() => setLimit(limit + 25)}>Carregar mais avisos</button>}
  </main>;
}

function SettingsForm({ settings }: { settings: PixSettings }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, startTransition] = useTransition();
  return <form className={styles.settingsForm} onSubmit={event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(""); setMessage("");
    startTransition(async () => {
      try { const result = await savePixSettings(form); if (result.ok) setMessage(result.message); else setError(result.message); }
      catch { setError("Não foi possível salvar. Tente novamente."); }
    });
  }}>
    <p>Cadastre a chave Pix da conta que vai receber os presentes e o nome do titular. O dinheiro será enviado diretamente para essa chave.</p>
    <input type="hidden" name="updated_at" value={settings.updated_at} />
    <fieldset disabled={busy}>
      <label>Tipo de chave<select name="key_type" defaultValue={settings.key_type}><option value="random">Chave aleatória</option><option value="email">E-mail</option><option value="cpf">CPF</option><option value="cnpj">CNPJ</option><option value="phone">Celular</option></select></label>
      <label>Chave Pix<input name="pix_key" required maxLength={77} defaultValue={settings.pix_key} autoComplete="off" /></label>
      <label>Nome do titular<input name="receiver_name" required maxLength={120} defaultValue={settings.receiver_name} /></label>
      <label>Cidade do titular<input name="receiver_city" required maxLength={80} defaultValue={settings.receiver_city} /></label>
    </fieldset>
    <label className={styles.checkbox}><input type="checkbox" name="enabled" defaultChecked={settings.enabled} disabled={busy} />Disponibilizar Pix na lista de presentes</label>
    {error && <p className={styles.error} role="alert">{error}</p>}{message && <p className={styles.success} role="status">{message}</p>}
    <button className={styles.primary} disabled={busy}>{busy ? "Salvando…" : "Salvar dados do Pix"}</button>
  </form>;
}
