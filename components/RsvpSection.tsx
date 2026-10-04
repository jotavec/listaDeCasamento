"use client";

import { Monogram } from "@/components/Monogram";
import { useEffect, useState } from "react";
import { RsvpGuestSearch } from "./RsvpGuestSearch";
import styles from "./RsvpModal.module.css";

type Invitation = {
  name: string;
  maxAdults: number;
  status: string;
};

type Child = {
  id: number;
  name: string;
  age: string;
};

export function RsvpSection() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [invitation, setInvitation] =
    useState<Invitation | null>(null);

  const [attending, setAttending] =
    useState<boolean | null>(null);

  const [adultCount, setAdultCount] = useState(0);
  const [companions, setCompanions] =
    useState<string[]>([]);

  const [children, setChildren] =
    useState<Child[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!open) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function resetModal() {
    setName("");
    setInvitation(null);
    setAttending(null);
    setAdultCount(0);
    setCompanions([]);
    setChildren([]);
    setError("");
    setFinished(false);
  }

  function closeModal() {
    setOpen(false);
    resetModal();
  }

  async function searchInvitation(
    selectedName?: string,
  ) {
    const cleanName = (
      selectedName ?? name
    ).trim();

    if (cleanName.length < 2) {
      setError("Digite seu nome completo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rsvp/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ??
            data.error ??
            "Não encontramos esse convite.",
        );
        return;
      }

      setInvitation(data.invitation);
      setAttending(null);
      setAdultCount(0);
      setCompanions([]);
      setChildren([]);
    } catch {
      setError(
        "Não foi possível consultar a lista agora.",
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseAdultCount(count: number) {
    setAdultCount(count);

    setCompanions(
      Array.from(
        { length: count },
        (_, index) => companions[index] ?? "",
      ),
    );
  }

  function addChild() {
    setChildren((current) => [
      ...current,
      {
        id: Date.now() + Math.random(),
        name: "",
        age: "",
      },
    ]);
  }

  function removeChild(id: number) {
    setChildren((current) =>
      current.filter((child) => child.id !== id),
    );
  }

  async function submitConfirmation() {
    if (attending === null) {
      setError(
        "Informe se você estará presente.",
      );
      return;
    }

    if (
      attending &&
      companions.some(
        (item) => item.trim().length < 2,
      )
    ) {
      setError(
        "Informe o nome de todos os acompanhantes.",
      );
      return;
    }

    if (
      attending &&
      children.some(
        (child) =>
          child.name.trim().length < 2 ||
          child.age === "" ||
          !Number.isInteger(Number(child.age)) ||
          Number(child.age) < 0 ||
          Number(child.age) > 10,
      )
    ) {
      setError(
        "Confira o nome e a idade das crianças.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/rsvp/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attending,
            companions: attending
              ? companions.map((item) =>
                  item.trim(),
                )
              : [],
            children: attending
              ? children.map((child) => ({
                  name: child.name.trim(),
                  age: Number(child.age),
                }))
              : [],
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            "Não foi possível registrar sua resposta.",
        );
        return;
      }

      setFinished(true);
    } catch {
      setError(
        "Não foi possível registrar sua resposta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="rsvp" id="presenca">
        <p className="section-kicker">
          Esperamos você
        </p>

        <h2>Confirme sua presença</h2>

        <p>
          Estamos preparando cada detalhe com muito
          amor. Sua confirmação nos ajuda a preparar
          tudo para este dia tão especial.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
        >
          Confirmar presença
        </button>

        <div className="final-monogram">
          <Monogram width={210} />
        </div>

        <p className="final-date">
          26 · 03 · 2027
        </p>
      </section>

      {open && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Confirmação de presença"
          >
            <button
              type="button"
              className={styles.close}
              onClick={closeModal}
              aria-label="Fechar"
            >
              ×
            </button>

            {!invitation && !finished && (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.seal}>
                    <Monogram width={140} />
                  </div>

                  <p>CONFIRMAÇÃO DE PRESENÇA</p>

                  <h3>Encontre seu convite</h3>

                  <span>
                    Digite seu nome completo para
                    procurar na lista de convidados.
                  </span>
                </div>

                <RsvpGuestSearch
                  value={name}
                  loading={loading}
                  onChange={(value) => {
                    setName(value);
                    setError("");
                  }}
                  onSelect={(guestName) => {
                    setName(guestName);
                    searchInvitation(guestName);
                  }}
                />
              </>
            )}

            {invitation && !finished && (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.seal}>
                    <Monogram width={140} />
                  </div>

                  <p>CONVITE ENCONTRADO</p>

                  <h3>
                    Olá, {invitation.name}
                  </h3>

                  <span>
                    Encontramos seu nome em nossa
                    lista de convidados.
                  </span>
                </div>

                <div className={styles.question}>
                  <strong>
                    Você estará conosco?
                  </strong>

                  <div className={styles.yesNo}>
                    <button
                      type="button"
                      className={
                        attending === true
                          ? styles.selected
                          : ""
                      }
                      onClick={() =>
                        setAttending(true)
                      }
                    >
                      Sim, confirmo
                    </button>

                    <button
                      type="button"
                      className={
                        attending === false
                          ? styles.selectedNo
                          : ""
                      }
                      onClick={() => {
                        setAttending(false);
                        setAdultCount(0);
                        setCompanions([]);
                        setChildren([]);
                      }}
                    >
                      Não poderei ir
                    </button>
                  </div>
                </div>

                {attending === true && (
                  <>
                    {invitation.maxAdults > 0 && (
                      <div className={styles.group}>
                        <p>ACOMPANHANTES</p>

                        <strong>
                          Quantos acompanhantes
                          irão com você?
                        </strong>

                        <span>
                          Seu convite permite até{" "}
                          {invitation.maxAdults}.
                        </span>

                        <div
                          className={styles.countOptions}
                        >
                          {Array.from(
                            {
                              length:
                                invitation.maxAdults +
                                1,
                            },
                            (_, number) => (
                              <button
                                key={number}
                                type="button"
                                className={
                                  adultCount === number
                                    ? styles.countSelected
                                    : ""
                                }
                                onClick={() =>
                                  chooseAdultCount(
                                    number,
                                  )
                                }
                              >
                                {number}
                              </button>
                            ),
                          )}
                        </div>

                        {companions.length > 0 && (
                          <div
                            className={styles.companions}
                          >
                            {companions.map(
                              (companion, index) => (
                                <div key={index}>
                                  <label>
                                    Nome do acompanhante{" "}
                                    {index + 1}
                                  </label>

                                  <input
                                    type="text"
                                    value={companion}
                                    placeholder="Nome completo"
                                    onChange={(
                                      event,
                                    ) => {
                                      const value =
                                        event.target
                                          .value;

                                      setCompanions(
                                        (current) =>
                                          current.map(
                                            (
                                              item,
                                              itemIndex,
                                            ) =>
                                              itemIndex ===
                                              index
                                                ? value
                                                : item,
                                          ),
                                      );
                                    }}
                                  />
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={styles.group}>
                      <div
                        className={
                          styles.groupHeader
                        }
                      >
                        <div>
                          <p>CRIANÇAS</p>

                          <strong>
                            Crianças de até 10 anos
                          </strong>

                          <span>
                            Não ocupam vaga de
                            acompanhante. Informe nome
                            e idade.
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={addChild}
                        >
                          + Adicionar criança
                        </button>
                      </div>

                      {children.length > 0 && (
                        <div
                          className={styles.children}
                        >
                          {children.map(
                            (child) => (
                              <div
                                className={
                                  styles.childRow
                                }
                                key={child.id}
                              >
                                <div>
                                  <label>
                                    Nome
                                  </label>

                                  <input
                                    type="text"
                                    value={child.name}
                                    placeholder="Nome da criança"
                                    onChange={(
                                      event,
                                    ) => {
                                      const value =
                                        event.target
                                          .value;

                                      setChildren(
                                        (current) =>
                                          current.map(
                                            (item) =>
                                              item.id ===
                                              child.id
                                                ? {
                                                    ...item,
                                                    name: value,
                                                  }
                                                : item,
                                          ),
                                      );
                                    }}
                                  />
                                </div>

                                <div
                                  className={
                                    styles.age
                                  }
                                >
                                  <label>
                                    Idade
                                  </label>

                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={2}
                                    value={child.age}
                                    placeholder="0"
                                    onChange={(
                                      event,
                                    ) => {
                                      const value =
                                        event.target
                                          .value
                                          .replace(
                                            /\D/g,
                                            "",
                                          )
                                          .slice(
                                            0,
                                            2,
                                          );

                                      setChildren(
                                        (current) =>
                                          current.map(
                                            (item) =>
                                              item.id ===
                                              child.id
                                                ? {
                                                    ...item,
                                                    age: value,
                                                  }
                                                : item,
                                          ),
                                      );
                                    }}
                                  />
                                </div>

                                <button
                                  type="button"
                                  className={
                                    styles.remove
                                  }
                                  onClick={() =>
                                    removeChild(
                                      child.id,
                                    )
                                  }
                                >
                                  ×
                                </button>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {attending !== null && (
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.back}
                      onClick={() => {
                        setInvitation(null);
                        setAttending(null);
                        setAdultCount(0);
                        setCompanions([]);
                        setChildren([]);
                        setError("");
                      }}
                    >
                      Voltar
                    </button>

                    <button
                      type="button"
                      className={styles.confirm}
                      onClick={submitConfirmation}
                      disabled={loading}
                    >
                      {loading
                        ? "Salvando..."
                        : "Confirmar resposta"}
                    </button>
                  </div>
                )}
              </>
            )}

            {finished && (
              <div className={styles.finished}>
                <div className={styles.seal}>
                  <Monogram width={140} />
                </div>

                <p>RESPOSTA REGISTRADA</p>

                <h3>
                  {attending
                    ? "Presença confirmada."
                    : "Obrigado por nos avisar."}
                </h3>

                <span>
                  {attending
                    ? "Estamos muito felizes em celebrar este dia com você."
                    : "Sentiremos sua falta e agradecemos pelo carinho."}
                </span>

                <button
                  type="button"
                  onClick={closeModal}
                >
                  Finalizar
                </button>
              </div>
            )}

            {error && (
              <div
                className={styles.error}
                role="alert"
              >
                {error}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
