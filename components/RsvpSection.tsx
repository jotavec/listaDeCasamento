"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Monogram } from "@/components/Monogram";
const RsvpDialog = dynamic(() => import("./RsvpDialog").then(module => module.RsvpDialog), {
  loading: () => <div className="rsvp-loading" role="status">Abrindo confirmação...</div>,
});

export function RsvpSection() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return <>
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
          <Monogram width={210} tone="color" />
        </div>

        <p className="final-date">
          26 · 03 · 2027
        </p>
      </section>

      {open && <RsvpDialog onClose={close} />}
    </>;
}
