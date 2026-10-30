import { WeddingLink } from "./WeddingMotion";
import { Monogram } from "@/components/Monogram";

export function RsvpSection() {
  return (
      <section className="rsvp" id="presenca" data-reveal>
        <p className="section-kicker">
          Esperamos você
        </p>

        <h2>Confirme sua presença</h2>

        <p>
          Estamos preparando cada detalhe com muito
          amor. Sua confirmação nos ajuda a preparar
          tudo para este dia tão especial.
        </p>

        <WeddingLink className="rsvp-link" href="/casamento/presenca">
          Confirmar presença
        </WeddingLink>

        <div className="final-monogram">
          <Monogram width={210} tone="color" />
        </div>

        <p className="final-date">
          26 · 03 · 2027
        </p>
      </section>
  );
}
