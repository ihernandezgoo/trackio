"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Home, Goal } from "lucide-react";

const ENLACES = [
  { href: "/history", icono: History, etiqueta: "Historial" },
  { href: "/goals", icono: Goal, etiqueta: "Objetivos" },
] as const;

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 mt-8 border-t border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl">
      <div className="relative mx-auto flex w-full max-w-md items-center justify-center px-6 pb-[env(safe-area-inset-bottom)]">
        {ENLACES.map(({ href, icono: Icono, etiqueta }, i) => {
          const activo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? "page" : undefined}
              className={`group flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                i === 0 ? "pr-10" : "pl-10"
              } ${activo ? "text-[var(--brand)]" : "text-[var(--text-muted)] hover:text-[var(--foreground)]"}`}
            >
              <Icono
                className="size-5 transition-transform group-active:scale-90"
                strokeWidth={activo ? 2.4 : 1.8}
                aria-hidden
              />
              {etiqueta}
            </Link>
          );
        })}

        <Link
          href="/"
          aria-label="Registrar peso"
          aria-current={pathname === "/" ? "page" : undefined}
          className="absolute left-1/2 -top-5 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-contrast)] ring-4 ring-[var(--background)] transition hover:brightness-110 active:scale-95"
        >
          <Home className="size-6" strokeWidth={2.5} aria-hidden />
        </Link>
      </div>
    </nav>
  );
}
