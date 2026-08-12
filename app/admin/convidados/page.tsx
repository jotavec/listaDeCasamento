import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteInvitation } from "./actions";
import { GuestCreateModal } from "@/components/admin/GuestCreateModal";
import styles from "./convidados.module.css";

type Props = {
  searchParams: Promise<{
    busca?: string;
    lado?: string;
    status?: string;
    ok?: string;
    erro?: string;
  }>;
};

type Invitation = {
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

export default async function ConvidadosPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .order("primaryname", { ascending: true });

  const invitations = (data ?? []) as Invitation[];

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
            className={styles.search}
          >
            <span>⌕</span>

            <input
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
          <Link
            href="/admin/convidados"
            className={
              !params.lado && !params.status
                ? styles.active
                : ""
            }
          >
            Todos
          </Link>

          <Link
            href="/admin/convidados?lado=bride"
            className={
              params.lado === "bride"
                ? styles.active
                : ""
            }
          >
            Noiva
          </Link>

          <Link
            href="/admin/convidados?lado=groom"
            className={
              params.lado === "groom"
                ? styles.active
                : ""
            }
          >
            Noivo
          </Link>

          <Link
            href="/admin/convidados?status=pending"
            className={
              params.status === "pending"
                ? styles.active
                : ""
            }
          >
            Aguardando
          </Link>

          <Link
            href="/admin/convidados?status=confirmed"
            className={
              params.status === "confirmed"
                ? styles.active
                : ""
            }
          >
            Confirmados
          </Link>
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
            <div>J&J</div>

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

                  <button
                    type="submit"
                    title="Excluir convidado"
                  >
                    ×
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
