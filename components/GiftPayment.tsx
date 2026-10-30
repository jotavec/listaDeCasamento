"use client";

import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice, type Gift } from "@/lib/gifts/shared";
import { type PixPayment } from "@/lib/gifts/pix";
import { useDialogFocus } from "./useDialogFocus";
import styles from "./GiftPayment.module.css";

type SavedPayment = { payment: PixPayment; reported: boolean };
function readSaved(giftId: string): SavedPayment | null {
  try {
    const raw = sessionStorage.getItem(`wedding-pix:${giftId}`);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return saved?.payment?.gift_id === giftId && typeof saved.payment.code === "string" && saved.payment.qr_image?.startsWith("data:image/png;base64,") ? saved : null;
  } catch { return null; }
}
function remember(payment: PixPayment, reported: boolean) {
  try { sessionStorage.setItem(`wedding-pix:${payment.gift_id}`, JSON.stringify({ payment, reported })); } catch { /* Payment remains usable when storage is unavailable. */ }
}

export function GiftPayment({ gift }: { gift: Gift }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<SavedPayment | null>(null);
  return <>
    <button className={styles.present} onClick={() => { setSaved(readSaved(gift.id)); setOpen(true); }}>Presentear</button>
    {open && createPortal(<PaymentDialog gift={gift} saved={saved} onClose={() => setOpen(false)} />, document.body)}
  </>;
}

function PaymentDialog({ gift, saved, onClose }: { gift: Gift; saved: SavedPayment | null; onClose: () => void }) {
  const [payment, setPayment] = useState<PixPayment | null>(saved?.payment ?? null);
  const [reported, setReported] = useState(saved?.reported ?? false);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const codeInput = useRef<HTMLTextAreaElement>(null);
  const close = useCallback(() => { if (!locked.current) onClose(); }, [onClose]);
  const dialogRef = useDialogFocus(true, close);

  async function prepare(form: FormData) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError("");
    try {
      const response = await fetch("/api/gifts/pix", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gift_id: gift.id, guest_name: form.get("guest_name"), payer_name: form.get("payer_name") ?? "" }) });
      const body = await response.json();
      if (!response.ok) { setError(body.error ?? "Não foi possível abrir o Pix."); return; }
      setPayment(body.payment); remember(body.payment, false);
    } catch { setError("Não foi possível abrir o Pix. Confira sua conexão e tente novamente."); }
    finally { locked.current = false; setBusy(false); }
  }

  async function report() {
    if (!payment || locked.current || reported) return;
    locked.current = true; setBusy(true); setError("");
    try {
      const response = await fetch("/api/gifts/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        id: payment.id, gift_id: payment.gift_id, gift_title: payment.gift_title, amount_cents: payment.amount_cents,
        guest_name: payment.guest_name, payer_name: payment.payer_name, pix_key: payment.pix_key,
      }) });
      const body = await response.json();
      if (!response.ok) { setError(body.error ?? "Não foi possível enviar seu aviso."); return; }
      remember(payment, true); setReported(true);
    } catch { setError("Seu aviso não foi enviado. Tente novamente; não é necessário fazer outro Pix."); }
    finally { locked.current = false; setBusy(false); }
  }

  return <div className={styles.overlay}>
    <section ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="pix-title" tabIndex={-1}>
      <button className={styles.close} type="button" onClick={close} disabled={busy} aria-label="Fechar">×</button>
      {reported ? <div className={styles.thanks} aria-live="polite">
        <span aria-hidden="true">♡</span><p className={styles.eyebrow}>COM CARINHO</p>
        <h2 id="pix-title">Obrigado pelo carinho!</h2>
        <p>Recebemos seu aviso. Ficamos muito felizes por você fazer parte desse momento.</p>
        <button className={styles.primary} onClick={close}>Voltar para a lista</button>
      </div> : <>
        <p className={styles.eyebrow}>UM PRESENTE PARA NÓS</p>
        <h2 id="pix-title">{payment?.gift_title ?? gift.title}</h2>
        <p className={styles.price}>{formatPrice(payment?.amount_cents ?? gift.price_cents)}</p>
        {!payment ? <form onSubmit={event => { event.preventDefault(); void prepare(new FormData(event.currentTarget)); }}>
          <p className={styles.hint}>Conte para nós quem está presenteando.</p>
          <label htmlFor="pix-guest">Seu nome completo</label>
          <input id="pix-guest" name="guest_name" required minLength={2} maxLength={120} autoComplete="name" disabled={busy} />
          <label htmlFor="pix-payer">Nome de quem fará o Pix <span>(se for outra pessoa)</span></label>
          <input id="pix-payer" name="payer_name" maxLength={120} autoComplete="off" disabled={busy} placeholder="Deixe em branco se for você" />
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <button className={styles.primary} disabled={busy}>{busy ? "Preparando…" : "Continuar para o Pix"}</button>
        </form> : <>
          <p className={styles.hint}>Use o aplicativo do seu banco para ler o QR Code ou cole o código Pix.</p>
          <div className={styles.qr}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Generated locally, no external QR service. */}
            <img src={payment.qr_image} width={280} height={280} alt={`QR Code Pix de ${formatPrice(payment.amount_cents)}`} />
          </div>
          <p className={styles.receiver}>Recebedor: <strong>{payment.receiver_name}</strong></p>
          <label htmlFor="pix-code">Pix Copia e Cola</label>
          <textarea ref={codeInput} id="pix-code" value={payment.code} readOnly rows={2} onFocus={event => event.target.select()} />
          <button type="button" className={styles.copy} onClick={async () => {
            try { await navigator.clipboard.writeText(payment.code); setCopied(true); }
            catch { codeInput.current?.focus(); codeInput.current?.select(); setError("Selecione o código acima e use a opção Copiar do seu aparelho."); }
          }}>{copied ? "Código copiado!" : "Copiar código Pix"}</button>
          <p className={styles.hint}>Depois de concluir o Pix no seu banco, toque no botão abaixo.</p>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <button type="button" className={styles.primary} onClick={report} disabled={busy}>{busy ? "Enviando…" : "Já fiz o pagamento"}</button>
        </>}
      </>}
    </section>
  </div>;
}
