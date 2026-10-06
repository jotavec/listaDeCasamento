"use client";

import { Monogram } from "@/components/Monogram";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useDialogFocus } from "@/components/useDialogFocus";
import { createInvitation } from "@/app/admin/convidados/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
import styles from "./GuestCreateModal.module.css";

export function GuestCreateModal() {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const dialogRef = useDialogFocus(open, close);

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

      {open && createPortal(
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
            ref={dialogRef}
            tabIndex={-1}
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
                <Monogram width={96} tone="black" />
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
        </div>, document.body
      )}
    </>
  );
}
