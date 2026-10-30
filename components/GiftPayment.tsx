"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice, type Gift } from "@/lib/gifts/shared";
import { type PixPayment } from "@/lib/gifts/pix";
import { Monogram } from "./Monogram";
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
  const [pixView, setPixView] = useState<"copy" | "qr">("copy");
  const codeInput = useRef<HTMLTextAreaElement>(null);
  const close = useCallback(() => { if (!locked.current) onClose(); }, [onClose]);
  const dialogRef = useDialogFocus(true, close);

  useLayoutEffect(() => {
    const input = codeInput.current;
    if (!input) return;
    const fitCode = () => {
      input.style.height = "auto";
      input.style.height = `${input.scrollHeight + input.offsetHeight - input.clientHeight}px`;
    };
    let width = input.clientWidth;
    fitCode();
    const observer = new ResizeObserver(() => {
      if (input.clientWidth === width) return;
      width = input.clientWidth;
      fitCode();
    });
    observer.observe(input);
    return () => observer.disconnect();
  }, [payment?.code, reported, pixView]);

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
    <section ref={dialogRef} className={`${styles.dialog} ${payment && !reported ? styles.paymentDialog : ""}`} role="dialog" aria-modal="true" aria-labelledby="pix-title" tabIndex={-1}>
      <button className={styles.close} type="button" onClick={close} disabled={busy} aria-label="Fechar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
      <div className={styles.brand} aria-label="Jéssica e João Vítor, 26 de março de 2027">
        <span className={styles.monogram}><Monogram width={88} tone="color" /></span>
        <span className={styles.occasion}>JÉSSICA & JOÃO VÍTOR<small>26 DE MARÇO DE 2027</small></span>
      </div>
      {reported ? <div className={styles.thanks} aria-live="polite">
        <span className={styles.heart} aria-hidden="true">♡</span><p className={styles.eyebrow}>ESSE CARINHO FICA COM A GENTE</p>
        <h2 id="pix-title">Obrigado pelo carinho!</h2>
        <p>Recebemos seu aviso. Ficamos muito felizes por você fazer parte desse momento.</p>
        <button className={styles.primary} onClick={close}>Voltar para a lista</button>
      </div> : <>
        <header className={styles.giftHeader}>
          <div><p className={styles.eyebrow}>UM PRESENTE PARA A NOSSA HISTÓRIA</p><h2 id="pix-title">{payment?.gift_title ?? gift.title}</h2></div>
          <p className={styles.price}>{formatPrice(payment?.amount_cents ?? gift.price_cents)}</p>
        </header>
        {!payment ? <form className={styles.guestForm} onSubmit={event => { event.preventDefault(); void prepare(new FormData(event.currentTarget)); }}>
          <p className={styles.hint}>Conte para nós quem está presenteando.</p>
          <label htmlFor="pix-guest">Seu nome completo</label>
          <input id="pix-guest" name="guest_name" required minLength={2} maxLength={120} autoComplete="name" disabled={busy} />
          <label htmlFor="pix-payer">Nome de quem fará o Pix <span>(se for outra pessoa)</span></label>
          <input id="pix-payer" name="payer_name" maxLength={120} autoComplete="off" disabled={busy} placeholder="Deixe em branco se for você" />
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <button className={styles.primary} disabled={busy}>{busy ? "Preparando…" : "Continuar para o Pix"}</button>
        </form> : <div className={styles.paymentBody} data-view={pixView}>
          <div className={styles.receiver}><span>PIX PARA</span><strong>{payment.receiver_name}</strong></div>
          <div className={styles.viewSwitch} role="group" aria-label="Como você prefere fazer o Pix?">
            <button type="button" aria-pressed={pixView === "copy"} onClick={() => setPixView("copy")}>Pix Copia e Cola</button>
            <button type="button" aria-pressed={pixView === "qr"} onClick={() => setPixView("qr")}>QR Code</button>
          </div>
          <div className={styles.paymentColumns}>
            <div className={styles.qrPanel}>
              <div className={styles.qr}>
                {/* eslint-disable-next-line @next/next/no-img-element -- Generated locally, no external QR service. */}
                <img src={payment.qr_image} width={224} height={224} alt={`QR Code Pix de ${formatPrice(payment.amount_cents)}`} />
              </div>
              <p>Escaneie com o app do seu banco.</p>
            </div>
            <div className={styles.copyPanel}>
              <div className={styles.copyHeading}><span className={styles.step} aria-hidden="true">01</span><div><label htmlFor="pix-code">Copie o código Pix</label><p>Cole na opção Pix Copia e Cola do seu banco.</p></div></div>
              <textarea ref={codeInput} id="pix-code" aria-label="Pix Copia e Cola" value={payment.code} readOnly rows={1} onFocus={event => event.target.select()} />
              <button type="button" className={styles.copy} onClick={async () => {
                try { await navigator.clipboard.writeText(payment.code); setCopied(true); }
                catch { codeInput.current?.focus(); codeInput.current?.select(); setError("Selecione o código acima e use a opção Copiar do seu aparelho."); }
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{copied ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>}</svg>
                <span aria-live="polite">{copied ? "Código copiado!" : "Copiar código Pix"}</span>
              </button>
            </div>
          </div>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <footer className={styles.paymentFooter}>
            <p>Depois de fazer o Pix,<br /><strong>avise a gente por aqui.</strong></p>
            <button type="button" className={styles.primary} onClick={report} disabled={busy}>{busy ? "Enviando…" : "Já fiz o pagamento"}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg></button>
          </footer>
        </div>}
      </>}
    </section>
  </div>;
}
