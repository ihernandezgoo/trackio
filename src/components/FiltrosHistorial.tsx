"use client";

import { useMemo, useState } from "react";
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {RANGOS.map(({ valor, etiqueta }) => (
            <button
              key={valor}
              type="button"
              onClick={() => setRango(valor)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                rango === valor
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:brightness-95"
              }`}
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
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                momento === valor
                  ? "bg-[var(--brand)] text-white"
                  : "bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:brightness-95"
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nota..."
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]"
      />

      {registrosFiltrados.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-[var(--text-secondary)]">
          No hay registros que coincidan con los filtros.
        </p>
      ) : (
        <TablaRegistros registros={registrosFiltrados} />
      )}
    </div>
  );
}
