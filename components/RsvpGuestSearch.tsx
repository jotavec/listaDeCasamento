"use client";

import {
  useEffect,
  useRef,
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
  const [results, setResults] =
    useState<string[]>([]);

  const [searching, setSearching] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  const requestRef = useRef(0);

  useEffect(() => {
    const query = value.trim();

    if (query.length < 3) {
      setResults([]);
      setSearching(false);
      setSearched(false);
      return;
    }

    const requestId = ++requestRef.current;

    const timeout = window.setTimeout(
      async () => {
        setSearching(true);

        try {
          const response = await fetch(
            "/api/rsvp/suggest",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                query,
              }),
            },
          );

          const data = await response.json();

          if (
            requestId !== requestRef.current
          ) {
            return;
          }

          setResults(
            Array.isArray(data.results)
              ? data.results
              : [],
          );

          setSearched(true);
        } catch {
          if (
            requestId === requestRef.current
          ) {
            setResults([]);
            setSearched(true);
          }
        } finally {
          if (
            requestId === requestRef.current
          ) {
            setSearching(false);
          }
        }
      },
      250,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [value]);

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
          autoComplete="off"
          autoFocus
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
