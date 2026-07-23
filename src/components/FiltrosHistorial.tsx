"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Registro } from "@/lib/registros";
import TablaRegistros from "@/components/TablaRegistros";

type RangoFecha = "7" | "30" | "90" | "todo";
type MomentoDia = "todos" | "mañana" | "tarde" | "noche";

const RANGOS: { valor: RangoFecha; etiqueta: string }[] = [
  { valor: "7", etiqueta: "7 días" },
  { valor: "30", etiqueta: "30 días" },
  { valor: "90", etiqueta: "90 días" },
  { valor: "todo", etiqueta: "Todo" },
];

const MOMENTOS: { valor: MomentoDia; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "mañana", etiqueta: "Mañana" },
  { valor: "tarde", etiqueta: "Tarde" },
  { valor: "noche", etiqueta: "Noche" },
];

const claseChip = (activo: boolean) =>
  `rounded-full px-3 py-1.5 text-xs font-medium transition ${
    activo
      ? "bg-[var(--brand)] text-[var(--brand-contrast)]"
      : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]"
  }`;

export default function FiltrosHistorial({ registros }: { registros: Registro[] }) {
  const [rango, setRango] = useState<RangoFecha>("todo");
  const [momento, setMomento] = useState<MomentoDia>("todos");
  const [busqueda, setBusqueda] = useState("");

  const registrosFiltrados = useMemo(() => {
    const limite =
      rango === "todo"
        ? null
        : (() => {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - Number(rango));
            return fecha;
          })();

    const busquedaNormalizada = busqueda.trim().toLowerCase();

    return registros.filter((registro) => {
      if (limite && new Date(registro.fecha_hora) < limite) return false;
      if (momento !== "todos" && registro.condicion.momento_dia !== momento) return false;
      if (busquedaNormalizada && !registro.nota?.toLowerCase().includes(busquedaNormalizada)) {
        return false;
      }
      return true;
    });
  }, [registros, rango, momento, busqueda]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {RANGOS.map(({ valor, etiqueta }) => (
            <button
              key={valor}
              type="button"
              onClick={() => setRango(valor)}
              className={claseChip(rango === valor)}
            >
              {etiqueta}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {MOMENTOS.map(({ valor, etiqueta }) => (
            <button
              key={valor}
              type="button"
              onClick={() => setMomento(valor)}
              className={claseChip(momento === valor)}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden
        />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nota…"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-3.5 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand)]"
        />
      </div>

      {registrosFiltrados.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border-strong)] p-8 text-center text-sm text-[var(--text-muted)]">
          No hay registros que coincidan con los filtros.
        </p>
      ) : (
        <TablaRegistros registros={registrosFiltrados} />
      )}
    </div>
  );
}
