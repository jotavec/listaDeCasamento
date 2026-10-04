"use client";

import { Monogram } from "@/components/Monogram";
import { useSearchParams } from "next/navigation";
import type { FormEvent, MouseEvent, ComponentProps } from "react";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { deleteInvitation } from "@/app/admin/convidados/actions";
import { GuestCreateModal } from "@/components/admin/GuestCreateModal";
import styles from "@/app/admin/convidados/convidados.module.css";

export type Invitation = {
  id: string;
  primaryname: string;
  maxadults: number;
  rsvpstatus: string;
  side?: string | null;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function FilterLink({ href, children, ...props }: ComponentProps<"a"> & { href: string }) {
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.pushState(null, "", href);
  }
  return <a {...props} href={href} onClick={navigate}>{children}</a>;
}

export function GuestList({ invitations, error }: { invitations: Invitation[]; error: boolean }) {
  const searchParams = useSearchParams();
  const params = {
    busca: searchParams.get("busca") ?? "",
    lado: searchParams.get("lado") ?? "",
    status: searchParams.get("status") ?? "",
    ok: searchParams.get("ok") ?? "",
    erro: searchParams.get("erro") ?? "",
  };

  function searchGuests(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new URLSearchParams(searchParams.toString());
    const search = String(new FormData(event.currentTarget).get("busca") ?? "").trim();
    if (search) query.set("busca", search);
    else query.delete("busca");
    query.delete("ok");
    query.delete("erro");
    window.history.pushState(null, "", `/admin/convidados${query.size ? `?${query}` : ""}`);
  }

  const search = normalize(
    String(params.busca ?? "").trim(),
  );

  const filtered = invitations.filter((guest) => {
    const matchesSearch =
      !search ||
      normalize(guest.primaryname).includes(search);

    const matchesSide =
      !params.lado ||
      guest.side === params.lado;

    const matchesStatus =
      !params.status ||
      guest.rsvpstatus === params.status;

    return (
      matchesSearch &&
      matchesSide &&
      matchesStatus
    );
  });

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p>CONVIDADOS</p>
          <h1>Lista de convidados</h1>

          <span>
            Controle os convites e acompanhe as confirmações.
          </span>
        </div>

        <GuestCreateModal />
      </header>

      {params.ok && (
        <div className={styles.success}>
          {params.ok === "excluido"
            ? "Convidado removido da lista."
            : "Convidado cadastrado com sucesso."}
        </div>
      )}

      {params.erro && (
        <div className={styles.error}>
          Não foi possível concluir a operação.
        </div>
      )}

      <section className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.total}>
            <strong>{invitations.length}</strong>

            <span>
              {invitations.length === 1
                ? "convite cadastrado"
                : "convites cadastrados"}
            </span>
          </div>

          <form
            method="get"
            onSubmit={searchGuests}
            className={styles.search}
          >
            <span>⌕</span>

            <input
              key={params.busca}
              name="busca"
              type="search"
              defaultValue={params.busca ?? ""}
              placeholder="Buscar convidado..."
              autoComplete="off"
            />

            <button type="submit">
              Buscar
            </button>
          </form>
        </div>

        <nav className={styles.filters}>
          <FilterLink
            href="/admin/convidados"
            className={
              !params.lado && !params.status
                ? styles.active
                : ""
            }
          >
            Todos
          </FilterLink>

          <FilterLink
            href="/admin/convidados?lado=bride"
            className={
              params.lado === "bride"
                ? styles.active
                : ""
            }
          >
            Noiva
          </FilterLink>

          <FilterLink
            href="/admin/convidados?lado=groom"
            className={
              params.lado === "groom"
                ? styles.active
                : ""
            }
          >
            Noivo
          </FilterLink>

          <FilterLink
            href="/admin/convidados?status=pending"
            className={
              params.status === "pending"
                ? styles.active
                : ""
            }
          >
            Aguardando
          </FilterLink>

          <FilterLink
            href="/admin/convidados?status=confirmed"
            className={
              params.status === "confirmed"
                ? styles.active
                : ""
            }
          >
            Confirmados
          </FilterLink>
        </nav>

        {error ? (
          <div className={styles.empty}>
            <div>!</div>
            <strong>
              Não foi possível carregar a lista.
            </strong>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyMonogram}><Monogram width={140} tone="black" /></div>

            <strong>
              Nenhum convidado por aqui.
            </strong>

            <span>
              Cadastre o primeiro convite usando
              o botão no topo da tela.
            </span>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Convidado</span>
              <span>Origem</span>
              <span>Acompanhantes</span>
              <span>Status</span>
              <span />
            </div>

            {filtered.map((guest) => (
              <article
                className={styles.row}
                key={guest.id}
              >
                <div className={styles.person}>
                  <div className={styles.avatar}>
                    {guest.primaryname
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {guest.primaryname}
                    </strong>

                    <span>
                      Convidado principal
                    </span>
                  </div>
                </div>

                <div>
                  {guest.side === "bride" ? (
                    <span className={styles.bride}>
                      Noiva
                    </span>
                  ) : guest.side === "groom" ? (
                    <span className={styles.groom}>
                      Noivo
                    </span>
                  ) : (
                    <span className={styles.undefined}>
                      —
                    </span>
                  )}
                </div>

                <div className={styles.companions}>
                  <strong>{guest.maxadults}</strong>

                  <span>
                    {guest.maxadults === 1
                      ? "acompanhante"
                      : "acompanhantes"}
                  </span>
                </div>

                <div>
                  <span
                    className={
                      guest.rsvpstatus === "confirmed"
                        ? styles.confirmed
                        : guest.rsvpstatus === "declined"
                          ? styles.declined
                          : styles.pending
                    }
                  >
                    {guest.rsvpstatus === "confirmed"
                      ? "Confirmado"
                      : guest.rsvpstatus === "declined"
                        ? "Não irá"
                        : "Aguardando"}
                  </span>
                </div>

                <form
                  action={deleteInvitation}
                  className={styles.actions}
                >
                  <input
                    type="hidden"
                    name="id"
                    value={guest.id}
                  />

                  <SubmitButton pendingText="…" title="Excluir convidado" aria-label={`Excluir ${guest.primaryname}`}>
                    ×
                  </SubmitButton>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
