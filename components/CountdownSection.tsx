import Image from "next/image";
import { Countdown } from "./Countdown";

export function CountdownSection() {
  return (
    <section className="count-section">
      <Image
        className="count-art"
        src="/countdownBackground.png"
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
      />
      <div className="count-content">
        <p className="section-kicker light">Contando os dias</p>
        <h2>Para o nosso sim</h2>
        <Countdown />
      </div>
    </section>
  );
}
