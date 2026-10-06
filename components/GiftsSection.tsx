import Image from "next/image";

export function GiftsSection() {
  return (
    <section className="gifts" id="presentes">
      <Image src="/heroDesktop.png" alt="" fill sizes="100vw" className="gifts-art" />
      <div className="gifts-card">
        <p className="section-kicker light">Com carinho</p>
        <h2>Lista de presentes</h2>
        <p>
          A presença de vocês é o nosso maior presente. Para quem desejar contribuir com o início desta nova etapa, em breve disponibilizaremos nossa lista aqui.
        </p>
        <button type="button" disabled>Lista disponível em breve</button>
      </div>
    </section>
  );
}
