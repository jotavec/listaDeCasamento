"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RsvpGuestSearch } from "./RsvpGuestSearch";
import styles from "./RsvpPage.module.css";

type Invitation = { name: string; maxAdults: number; status: string };
type Child = { id: number; name: string; age: string };

export function RsvpForm() {
  const [name, setName] = useState("");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [companions, setCompanions] = useState<string[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const busy = useRef(false);
  const nextChildId = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (invitation || finished) headingRef.current?.focus();
  }, [invitation, finished]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function searchInvitation(selectedName: string) {
    if (busy.current) return;
    busy.current = true;
    setName(selectedName);
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rsvp/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedName.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? data.error ?? "Não encontramos esse convite.");
        return;
      }
      setInvitation(data.invitation);
      setAttending(null);
      setCompanions([]);
      setChildren([]);
    } catch {
      setError("Não foi possível consultar a lista agora. Tente novamente.");
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  function changeInvitation() {
    setInvitation(null);
    setAttending(null);
    setCompanions([]);
    setChildren([]);
    setError("");
    requestAnimationFrame(() => document.getElementById("guestName")?.focus());
  }

  async function submitConfirmation() {
    if (busy.current) return;
    if (attending === null) {
      setError("Informe se você estará presente.");
      return;
    }
    if (attending && companions.some((item) => item.trim().length < 2)) {
      setError("Informe o nome de todos os acompanhantes.");
      return;
    }
    if (attending && children.some((child) => child.name.trim().length < 2
      || child.age === "" || !Number.isInteger(Number(child.age))
      || Number(child.age) < 0 || Number(child.age) > 10)) {
      setError("Confira o nome e a idade das crianças. A idade deve ser de 0 a 10 anos.");
      return;
    }

    busy.current = true;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/rsvp/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attending,
          companions: attending ? companions.map((item) => item.trim()) : [],
          children: attending ? children.map((child) => ({
            name: child.name.trim(), age: Number(child.age),
          })) : [],
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Não foi possível registrar sua resposta.");
        return;
      }
      setFinished(true);
    } catch {
      setError("Não foi possível registrar sua resposta. Tente novamente.");
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  return (
    <section className={styles.formPanel} aria-labelledby="rsvp-heading" aria-busy={loading}>
      {!finished && (
        <ol className={styles.steps} aria-label="Etapas da confirmação">
          <li className={!invitation ? styles.activeStep : styles.completeStep} aria-current={!invitation ? "step" : undefined}>
            <span aria-hidden="true">01</span> Seu convite
          </li>
          <li className={invitation ? styles.activeStep : ""} aria-current={invitation ? "step" : undefined}>
            <span aria-hidden="true">02</span> Sua resposta
          </li>
        </ol>
      )}

      {!invitation && !finished && (
        <div className={styles.searchCard}>
          <p className={styles.kicker}>Confirmação de presença</p>
          <h2 id="rsvp-heading" ref={headingRef} tabIndex={-1}>Encontre seu convite</h2>
          <p className={styles.description}>Digite seu nome e selecione seu convite na lista abaixo.</p>
          <RsvpGuestSearch
            value={name}
            loading={loading}
            onChange={(value) => { setName(value); setError(""); }}
            onSelect={searchInvitation}
          />
          {loading && <p className={styles.searchStatus} role="status">Abrindo seu convite…</p>}
        </div>
      )}

      {invitation && !finished && (
        <form onSubmit={(event) => { event.preventDefault(); void submitConfirmation(); }}>
          <fieldset className={styles.formFields} disabled={loading}>
            <legend className={styles.srOnly}>Sua resposta ao convite</legend>
            <div className={styles.invitationHeader}>
              <p className={styles.kicker}>Convite encontrado</p>
              <h2 id="rsvp-heading" ref={headingRef} tabIndex={-1}>Olá, {invitation.name}!</h2>
              <button className={styles.changeInvitation} type="button" onClick={changeInvitation}>Buscar outro convite</button>
            </div>

            <section className={styles.formSection} aria-labelledby="attendance-heading">
              <h3 id="attendance-heading">Você estará conosco?</h3>
              <div className={styles.yesNo}>
                <button type="button" className={attending === true ? styles.selected : ""}
                  aria-pressed={attending === true} onClick={() => { setAttending(true); setError(""); }}>
                  <span className={styles.choiceMark} aria-hidden="true">{attending === true ? "✓" : ""}</span>
                  Sim, estarei presente
                </button>
                <button type="button" className={attending === false ? styles.selected : ""}
                  aria-pressed={attending === false} onClick={() => {
                    setAttending(false); setCompanions([]); setChildren([]); setError("");
                  }}>
                  <span className={styles.choiceMark} aria-hidden="true">{attending === false ? "✓" : ""}</span>
                  Não poderei ir
                </button>
              </div>
            </section>

            {attending === true && (
              <>
                {invitation.maxAdults > 0 && (
                  <section className={styles.formSection} aria-labelledby="companions-heading">
                    <p className={styles.kicker}>Acompanhantes</p>
                    <h3 id="companions-heading">Quem vai com você?</h3>
                    <p className={styles.hint}>
                      Seu convite inclui até {invitation.maxAdults} {invitation.maxAdults === 1 ? "acompanhante" : "acompanhantes"}, além de você.
                    </p>
                    <div className={styles.countOptions} role="group" aria-label="Quantidade de acompanhantes">
                      {Array.from({ length: invitation.maxAdults + 1 }, (_, count) => (
                        <button key={count} type="button" aria-label={`${count} ${count === 1 ? "acompanhante" : "acompanhantes"}`}
                          aria-pressed={companions.length === count}
                          className={companions.length === count ? styles.countSelected : ""}
                          onClick={() => { setCompanions((current) => Array.from({ length: count }, (_, index) => current[index] ?? "")); setError(""); }}>
                          {count}
                        </button>
                      ))}
                    </div>
                    {companions.length > 0 && (
                      <div className={styles.companions}>
                        {companions.map((companion, index) => (
                          <div key={index}>
                            <label htmlFor={`companion-${index}`}>Acompanhante {index + 1}</label>
                            <input id={`companion-${index}`} type="text" required minLength={2} maxLength={120}
                              autoComplete="off" value={companion} placeholder="Nome completo"
                              onChange={(event) => {
                                const value = event.target.value;
                                setCompanions((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
                              }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                <section className={styles.formSection} aria-labelledby="children-heading">
                  <div className={styles.sectionHeader}>
                    <div>
                      <p className={styles.kicker}>Pequenos convidados</p>
                      <h3 id="children-heading">Crianças de até 10 anos</h3>
                    </div>
                    <button className={styles.addChild} type="button" disabled={children.length >= 50}
                      onClick={() => {
                        const id = nextChildId.current++;
                        setChildren((current) => [...current, { id, name: "", age: "" }]);
                        requestAnimationFrame(() => document.getElementById(`child-name-${id}`)?.focus());
                      }}>
                      <span aria-hidden="true">+</span> Adicionar criança
                    </button>
                  </div>
                  <p className={styles.hint}>Não ocupam vaga de acompanhante. Se vierem com você, informe nome e idade.</p>
                  {children.length > 0 && (
                    <div className={styles.children}>
                      {children.map((child, index) => (
                        <div className={styles.childRow} key={child.id}>
                          <div>
                            <label htmlFor={`child-name-${child.id}`}>Nome da criança {index + 1}</label>
                            <input id={`child-name-${child.id}`} type="text" required minLength={2} maxLength={120}
                              autoComplete="off" value={child.name} placeholder="Nome completo"
                              onChange={(event) => {
                                const value = event.target.value;
                                setChildren((current) => current.map((item) => item.id === child.id ? { ...item, name: value } : item));
                              }} />
                          </div>
                          <div className={styles.age}>
                            <label htmlFor={`child-age-${child.id}`}>Idade<span className={styles.srOnly}> da criança {index + 1}</span></label>
                            <input id={`child-age-${child.id}`} type="text" inputMode="numeric" required maxLength={2}
                              value={child.age} placeholder="0–10" onChange={(event) => {
                                const value = event.target.value.replace(/\D/g, "").slice(0, 2);
                                setChildren((current) => current.map((item) => item.id === child.id ? { ...item, age: value } : item));
                              }} />
                          </div>
                          <button className={styles.remove} type="button" aria-label={`Remover criança ${index + 1}`}
                            onClick={() => setChildren((current) => current.filter((item) => item.id !== child.id))}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {attending === false && <p className={styles.declineNote}>Sentiremos sua falta. Obrigado por nos avisar com carinho.</p>}

            {attending !== null && (
              <div className={styles.actions}>
                <p>Confira os dados antes de enviar.</p>
                <button type="submit" className={styles.primary} disabled={loading}>
                  {loading ? "Salvando resposta…" : "Confirmar resposta"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </fieldset>
        </form>
      )}

      {finished && (
        <div className={styles.finished}>
          <span className={styles.successMark} aria-hidden="true">✓</span>
          <p className={styles.kicker}>Resposta registrada</p>
          <h2 id="rsvp-heading" ref={headingRef} tabIndex={-1}>{attending ? "Presença confirmada!" : "Obrigado por nos avisar."}</h2>
          <p className={styles.description}>{attending
            ? "Estamos muito felizes em celebrar este dia com você. Nos vemos no grande dia!"
            : "Sentiremos sua falta e agradecemos pelo carinho."}</p>
          <Link className={styles.primary} href="/casamento#presenca">Voltar ao site <span aria-hidden="true">→</span></Link>
        </div>
      )}

      {error && <div className={styles.error} role="alert" tabIndex={-1} ref={errorRef}>{error}</div>}
    </section>
  );
}
