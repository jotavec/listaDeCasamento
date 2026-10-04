"use client";

import { Monogram } from "@/components/Monogram";
import { useEffect, useState } from "react";
import { createInvitation } from "@/app/admin/convidados/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
import styles from "./GuestCreateModal.module.css";

export function GuestCreateModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.openButton}
        onClick={() => setOpen(true)}
      >
        <span>+</span>
        Cadastrar convidado
      </button>

      {open && (
        <div
          className={styles.overlay}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-modal-title"
          >
            <header className={styles.header}>
              <div>
                <p>NOVO CONVITE</p>
                <h2 id="guest-modal-title">
                  Cadastrar convidado
                </h2>
              </div>

              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </header>

            <div className={styles.intro}>
              <div className={styles.monogram}>
                <Monogram width={96} />
              </div>

              <div>
                <strong>Lista fechada</strong>
                <span>
                  Defina quem poderá localizar este convite
                  e quantos acompanhantes adultos poderá levar.
                </span>
              </div>
            </div>

            <form
              action={createInvitation}
              className={styles.form}
            >
              <div className={styles.field}>
                <label htmlFor="primaryName">
                  Nome do convidado principal
                </label>

                <input
                  id="primaryName"
                  name="primaryName"
                  type="text"
                  placeholder="Ex.: Maria Aparecida da Silva"
                  maxLength={120}
                  autoComplete="off"
                  autoFocus
                  required
                />
              </div>

              <fieldset className={styles.fieldset}>
                <legend>Convidado de</legend>

                <div className={styles.sideOptions}>
                  <label>
                    <input
                      type="radio"
                      name="side"
                      value="bride"
                      required
                    />
                    <span>
                      <b>Noiva</b>
                      Jéssica
                    </span>
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="side"
                      value="groom"
                      required
                    />
                    <span>
                      <b>Noivo</b>
                      João Vítor
                    </span>
                  </label>
                </div>
              </fieldset>

              <div className={styles.companionBlock}>
                <div className={styles.field}>
                  <label htmlFor="maxAdults">
                    Acompanhantes adultos
                  </label>

                  <input
                    id="maxAdults"
                    name="maxAdults"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    defaultValue="0"
                    required
                  />
                </div>

                <div className={styles.helper}>
                  <strong>
                    O convidado principal não entra nessa quantidade.
                  </strong>

                  <span>
                    Crianças de até 10 anos também não consomem
                    vagas de acompanhante. Na confirmação, será
                    obrigatório informar nome e idade de cada criança.
                  </span>
                </div>
              </div>

              <footer className={styles.footer}>
                <button
                  type="button"
                  className={styles.cancel}
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </button>

                <SubmitButton
                  pendingText="Adicionando..."
                  className={styles.save}
                >
                  Adicionar à lista
                </SubmitButton>
              </footer>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
