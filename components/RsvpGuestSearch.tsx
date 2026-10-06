"use client";

import {
  useEffect,
  useState,
} from "react";

import styles from "./RsvpModal.module.css";

type Props = {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSelect: (name: string) => void;
};

export function RsvpGuestSearch({
  value,
  loading,
  onChange,
  onSelect,
}: Props) {
  const query = value.trim();
  const [search, setSearch] = useState<{
    query: string;
    results: string[];
    status: "loading" | "done" | "error";
  } | null>(null);
  const current = query.length >= 3 && search?.query === query ? search : null;
  const results = current?.results ?? [];
  const searching = query.length >= 3 && (!current || current.status === "loading");
  const searched = current?.status === "done";

  useEffect(() => {
    if (query.length < 3 || query.length > 120) return;
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(async () => {
      setSearch({ query, results: [], status: "loading" });
      try {
        const response = await fetch("/api/rsvp/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Busca indisponível");
        const data = await response.json();
        if (active) {
          setSearch({
            query,
            results: Array.isArray(data.results)
              ? data.results.filter((name: unknown): name is string => typeof name === "string")
              : [],
            status: "done",
          });
        }
      } catch {
        if (active) setSearch({ query, results: [], status: "error" });
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <div className={styles.searchArea}>
      <label htmlFor="guestName">
        Procure seu nome
      </label>

      <div className={styles.liveSearch}>
        <span className={styles.searchIcon}>
          ⌕
        </span>

        <input
          id="guestName"
          type="text"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="Comece a digitar seu nome..."
          maxLength={120}
          autoComplete="off"
        />
      </div>

      {value.trim().length < 3 && (
        <p className={styles.searchHint}>
          Digite pelo menos 3 letras para
          localizar seu convite.
        </p>
      )}

      {value.trim().length >= 3 && (
        <div className={styles.results}>
          {searching && (
            <div
              className={styles.searchStatus}
            >
              Procurando na lista...
            </div>
          )}

          {current?.status === "error" && (
            <div className={styles.searchStatus} role="status">
              Não foi possível consultar a lista agora. Tente novamente.
            </div>
          )}

          {!searching &&
            searched &&
            results.length === 0 && (
              <div
                className={
                  styles.searchStatus
                }
              >
                Nenhum convidado encontrado.
              </div>
            )}

          {!searching &&
            results.map((guestName) => (
              <button
                key={guestName}
                type="button"
                className={styles.result}
                disabled={loading}
                onClick={() =>
                  onSelect(guestName)
                }
              >
                <span className={styles.resultName}>
                  <strong>{guestName}</strong>
                </span>

                <span className={styles.resultAction}>
                  Selecionar
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
