"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminNav.module.css";

const items = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    href: "/admin/convidados",
    label: "Convidados",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c.7-3.2 2.7-5 5.5-5s4.8 1.8 5.5 5" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M15.5 14.5c2.8-.6 4.7.8 5.2 3.5" />
      </svg>
    ),
  },
  {
    href: "/admin/presentes",
    label: "Presentes",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13M3 12h18" />
        <path d="M12 8H8.5A2.5 2.5 0 1 1 11 5.5V8" />
        <path d="M12 8h3.5A2.5 2.5 0 1 0 13 5.5V8" />
      </svg>
    ),
  },
  {
    href: "/admin/financeiro",
    label: "Financeiro",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 9h18" />
        <path d="M7 15h4" />
      </svg>
    ),
  },
  {
    href: "/admin/relatorios",
    label: "Relatórios",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 20V10" />
        <path d="M12 20V4" />
        <path d="M19 20v-7" />
      </svg>
    ),
  },
];

function NavigationProgress() {
  const { pending } = useLinkStatus();
  return pending ? <span className={styles.pending} role="status" aria-label="Carregando página" /> : null;
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.item} ${
              active ? styles.active : ""
            }`}
            title={item.label}
            aria-current={active ? "page" : undefined}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
            <NavigationProgress />
          </Link>
        );
      })}
    </nav>
  );
}
