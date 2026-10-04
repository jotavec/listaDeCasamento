import styles from "./PageLoading.module.css";

export function PageLoading() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>Carregando...</span>
    </div>
  );
}
