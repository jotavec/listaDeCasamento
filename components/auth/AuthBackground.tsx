import Image from "next/image";
import styles from "./AuthBackground.module.css";

export function AuthBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <Image src="/heroDesktop.png" alt="" fill sizes="100vw" priority className={styles.image} />
    </div>
  );
}
