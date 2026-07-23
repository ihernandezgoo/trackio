"use client";

import { useState, type ReactNode } from "react";

type Tab = "historial" | "filtros";

export default function TabsHistorial({
  historial,
  filtros,
}: {
  historial: ReactNode;
  filtros: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("historial");

  const claseTab = (activo: boolean) =>
    `flex-1 rounded-lg py-2 text-sm font-medium transition ${
      activo
        ? "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-soft)]"
        : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
    }`;

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Vistas del historial"
        className="flex gap-1 rounded-xl bg-[var(--surface-muted)] p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "historial"}
          onClick={() => setTab("historial")}
          className={claseTab(tab === "historial")}
        >
          Resumen
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "filtros"}
          onClick={() => setTab("filtros")}
          className={claseTab(tab === "filtros")}
        >
          Registros
        </button>
      </div>

      {tab === "historial" ? historial : filtros}
    </div>
  );
}
