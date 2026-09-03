"use client";

import { useId, useState, type ReactNode } from "react";

type Tab = "historial" | "filtros";

const TABS: { id: Tab; etiqueta: string }[] = [
  { id: "historial", etiqueta: "Resumen" },
  { id: "filtros", etiqueta: "Registros" },
];

export default function TabsHistorial({
  historial,
  filtros,
}: {
  historial: ReactNode;
  filtros: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("historial");
  const base = useId();

  const idTab = (id: Tab) => `${base}-tab-${id}`;
  const idPanel = (id: Tab) => `${base}-panel-${id}`;

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Vistas del historial"
        className="flex gap-1 rounded-xl bg-[var(--surface-muted)] p-1"
      >
        {TABS.map(({ id, etiqueta }) => {
          const activo = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={idTab(id)}
              aria-selected={activo}
              aria-controls={idPanel(id)}
              // Solo la pestaña activa entra en el orden de tabulación; entre
              // pestañas se navega con las flechas.
              tabIndex={activo ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                e.preventDefault();
                const i = TABS.findIndex((t) => t.id === tab);
                const siguiente =
                  TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
                setTab(siguiente.id);
                document.getElementById(idTab(siguiente.id))?.focus();
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                activo
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {etiqueta}
            </button>
          );
        })}
      </div>

      {TABS.map(({ id }) => (
        <div
          key={id}
          role="tabpanel"
          id={idPanel(id)}
          aria-labelledby={idTab(id)}
          hidden={tab !== id}
        >
          {id === "historial" ? historial : filtros}
        </div>
      ))}
    </div>
  );
}
