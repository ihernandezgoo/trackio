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
    `flex-1 rounded-xl py-2 text-sm font-medium transition ${
      activo
        ? "bg-[var(--brand)] text-white"
        : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
    }`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5 rounded-xl bg-[var(--surface-muted)] p-1">
        <button type="button" onClick={() => setTab("historial")} className={claseTab(tab === "historial")}>
          Historial
        </button>
        <button type="button" onClick={() => setTab("filtros")} className={claseTab(tab === "filtros")}>
          Filtros
        </button>
      </div>

      {tab === "historial" ? historial : filtros}
    </div>
  );
}
