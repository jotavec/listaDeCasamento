import Image from "next/image";
import { formatPrice, giftImageUrl, type Gift } from "@/lib/gifts/shared";
import styles from "./GiftCatalog.module.css";

export function GiftCatalog({ gifts, unavailable = false, imageUrl = giftImageUrl }: { gifts: Gift[]; unavailable?: boolean; imageUrl?: typeof giftImageUrl }) {
  return <section className="gifts" id="presentes" aria-labelledby="gifts-heading">
    <Image src="/heroDesktop.png" alt="" fill sizes="100vw" className="gifts-art" />
    <div className={styles.intro}><p className="section-kicker light">Com carinho</p><h2 id="gifts-heading">Lista de presentes</h2><p>A presença de vocês é o nosso maior presente. Para quem desejar nos presentear, preparamos esta lista com carinho.</p></div>
    {unavailable ? <p className={styles.empty}>Não foi possível carregar os presentes agora. Tente novamente em instantes.</p>
      : gifts.length === 0 ? <p className={styles.empty}>Estamos preparando nossa lista. Em breve, os presentes estarão aqui.</p>
      : <div className={styles.grid}>{gifts.map(gift => <article key={gift.id} className={styles.card}>
        <div className={styles.photo}><Image src={imageUrl(gift.image_path)} alt={gift.title} fill sizes="(max-width: 600px) 90vw, (max-width: 960px) 44vw, 350px" /></div>
        <div className={styles.details}><h3>{gift.title}</h3><p>{formatPrice(gift.price_cents)}</p></div>
      </article>)}</div>}
  </section>;
}
