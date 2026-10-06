"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { saveGift, deleteGift } from "@/app/admin/presentes/actions";
import { formatPrice, giftImageUrl, MAX_PHOTO_BYTES, parsePrice, type Gift, type GiftResult } from "@/lib/gifts/shared";
import { useDialogFocus } from "@/components/useDialogFocus";
import styles from "./GiftManager.module.css";

async function preparePhoto(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Escolha uma foto JPG, PNG ou WebP.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Escolha uma foto de até 20 MB.");
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error("Não foi possível ler a foto. Escolha outra imagem JPG, PNG ou WebP."); });
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar a foto neste navegador.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", 0.85));
    if (!blob || blob.size > MAX_PHOTO_BYTES) throw new Error("Esta foto ficou muito grande. Escolha uma imagem menor.");
    return new File([blob], "presente.webp", { type: blob.type });
  } finally { bitmap.close(); }
}

type Props = { gifts: Gift[]; loadError?: boolean; onSave?: typeof saveGift; onDelete?: typeof deleteGift; imageUrl?: typeof giftImageUrl };
export function GiftManager({ gifts, loadError = false, onSave = saveGift, onDelete = deleteGift, imageUrl = giftImageUrl }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Gift | "new" | null>(null);
  const [deleting, setDeleting] = useState<Gift | null>(null);
  const [message, setMessage] = useState("");
  const closeEditor = useCallback(() => setEditing(null), []);
  const closeDelete = useCallback(() => setDeleting(null), []);
  function completed(result: GiftResult) { setMessage(result.message); setEditing(null); setDeleting(null); router.refresh(); }
  return <main className={styles.page}>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>PRESENTES</p><h1>Lista de presentes</h1><p>Adicione uma foto, um título e o valor. Ao salvar, o presente aparece no site.</p></div>
      <button className={styles.primary} onClick={() => { setMessage(""); setEditing("new"); }}>+ Novo presente</button>
    </header>
    <div className={styles.toolbar}><span>{gifts.length} {gifts.length === 1 ? "presente publicado" : "presentes publicados"}</span><Link href="/casamento#presentes" target="_blank" rel="noopener noreferrer">Ver no site ↗</Link></div>
    {message && <p className={styles.success} role="status">{message}</p>}
    {loadError ? <div className={styles.empty} role="alert"><h2>Não foi possível carregar a lista</h2><p>Confira sua conexão e tente novamente.</p><button className={styles.secondary} onClick={() => router.refresh()}>Tentar novamente</button></div>
      : gifts.length === 0 ? <div className={styles.empty}><span className={styles.emptyIcon} aria-hidden="true">♧</span><h2>Seu primeiro presente começa aqui</h2><p>Monte a lista do jeito de vocês. Cada presente cadastrado fica disponível para os convidados.</p><button className={styles.primary} onClick={() => setEditing("new")}>Cadastrar primeiro presente</button></div>
      : <div className={styles.grid}>{gifts.map(gift => <article className={styles.card} key={gift.id}>
        <div className={styles.photo}><Image src={imageUrl(gift.image_path)} alt={gift.title} fill sizes="(max-width: 640px) 90vw, (max-width: 1100px) 42vw, 30vw" /></div>
        <div className={styles.cardBody}><span className={styles.published}>Publicado no site</span><h2>{gift.title}</h2><p className={styles.price}>{formatPrice(gift.price_cents)}</p><div className={styles.cardActions}><button className={styles.secondary} onClick={() => setEditing(gift)} aria-label={`Editar ${gift.title}`}>Editar</button><button className={styles.delete} onClick={() => setDeleting(gift)} aria-label={`Excluir ${gift.title}`}>Excluir</button></div></div>
      </article>)}</div>}
    {editing && createPortal(<GiftEditor gift={editing === "new" ? null : editing} onClose={closeEditor} onSave={onSave} onComplete={completed} imageUrl={imageUrl} />, document.body)}
    {deleting && createPortal(<DeleteDialog gift={deleting} onClose={closeDelete} onDelete={onDelete} onComplete={completed} />, document.body)}
  </main>;
}

function GiftEditor({ gift, onClose, onSave, onComplete, imageUrl }: { gift: Gift | null; onClose: () => void; onSave: typeof saveGift; onComplete: (result: GiftResult) => void; imageUrl: typeof giftImageUrl }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState(gift ? imageUrl(gift.image_path) : "");
  const objectUrl = useRef<string | null>(null);
  const pending = useRef(false);
  const close = useCallback(() => { if (!pending.current) onClose(); }, [onClose]);
  const dialogRef = useDialogFocus(true, close);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const form = new FormData(event.currentTarget);
    if (parsePrice(String(form.get("price") ?? "")) === null) { setError("Informe um valor válido em reais, como 250,00."); return; }
    if (!gift && !photo) { setError("Escolha a foto do presente."); return; }
    pending.current = true; setBusy(true); setError("");
    try {
      form.delete("photo");
      if (photo) {
        try { form.set("photo", await preparePhoto(photo)); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível preparar a foto."); return; }
      }
      const result = await onSave(form);
      if (result.ok) { onComplete(result); return; }
      setError(result.message);
    } catch { setError("Não foi possível salvar. Confira sua conexão e tente novamente."); }
    finally { pending.current = false; setBusy(false); }
  }
  return <div className={styles.overlay} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <section ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="gift-editor-title" tabIndex={-1}>
      <div className={styles.dialogHeader}><div><p className={styles.eyebrow}>LISTA DE PRESENTES</p><h2 id="gift-editor-title">{gift ? "Editar presente" : "Novo presente"}</h2></div><button type="button" className={styles.close} onClick={close} disabled={busy} aria-label="Fechar">×</button></div>
      <p className={styles.hint}>Ao salvar, as informações serão publicadas no site.</p>
      <form onSubmit={submit} aria-busy={busy}>
        <input type="hidden" name="id" value={gift?.id ?? ""} /><input type="hidden" name="updated_at" value={gift?.updated_at ?? ""} />
        <fieldset disabled={busy}>
          <label htmlFor="gift-photo">Foto do presente</label>
          <div className={styles.upload}>
            {preview && <div className={styles.preview}>
              {/* Object URLs display the local photo before upload. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Prévia da foto do presente" />
            </div>}
            <input id="gift-photo" type="file" name="photo" accept="image/jpeg,image/png,image/webp" aria-describedby="gift-photo-help" onChange={event => {
              const file = event.target.files?.[0]; if (!file) return;
              if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 20 * 1024 * 1024) { setError("Escolha uma foto JPG, PNG ou WebP de até 20 MB."); event.target.value = ""; return; }
              if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
              objectUrl.current = URL.createObjectURL(file); setPhoto(file); setPreview(objectUrl.current); setError("");
            }} />
            <small id="gift-photo-help">JPG, PNG ou WebP, até 20 MB. Ajustamos o tamanho automaticamente.{gift ? " Se não escolher outra foto, a atual será mantida." : ""}</small>
          </div>
          <label htmlFor="gift-title">Título</label><input id="gift-title" name="title" type="text" required minLength={2} maxLength={120} defaultValue={gift?.title ?? ""} placeholder="Ex.: Jogo de panelas" />
          <label htmlFor="gift-price">Valor (R$)</label><input id="gift-price" name="price" type="text" inputMode="decimal" required maxLength={16} defaultValue={gift ? (gift.price_cents / 100).toFixed(2).replace(".", ",") : ""} placeholder="250,00" />
        </fieldset>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.dialogActions}><button type="button" className={styles.secondary} onClick={close} disabled={busy}>Cancelar</button><button type="submit" className={styles.primary} disabled={busy}>{busy ? "Salvando…" : "Salvar presente"}</button></div>
      </form>
    </section>
  </div>;
}

function DeleteDialog({ gift, onClose, onDelete, onComplete }: { gift: Gift; onClose: () => void; onDelete: typeof deleteGift; onComplete: (result: GiftResult) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const close = useCallback(() => { if (!pending.current) onClose(); }, [onClose]);
  const dialogRef = useDialogFocus(true, close);
  return <div className={styles.overlay}><section ref={dialogRef} className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="gift-delete-title" aria-describedby="gift-delete-description" tabIndex={-1}>
    <h2 id="gift-delete-title">Excluir presente?</h2><p id="gift-delete-description" className={styles.hint}>“{gift.title}” será removido da lista e do site.</p>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.dialogActions}><button className={styles.secondary} onClick={close} disabled={busy}>Cancelar</button><button className={styles.danger} disabled={busy} onClick={async () => {
      if (pending.current) return;
      pending.current = true; setBusy(true); setError("");
      try { const result = await onDelete(gift.id, gift.updated_at); if (result.ok) onComplete(result); else setError(result.message); }
      catch { setError("Não foi possível excluir. Tente novamente."); }
      finally { pending.current = false; setBusy(false); }
    }}>{busy ? "Excluindo…" : "Excluir presente"}</button></div>
  </section></div>;
}
