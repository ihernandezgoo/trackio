import type { Registro } from "@/lib/registros";
import BotonBorrar from "@/components/BotonBorrar";

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TablaRegistros({ registros }: { registros: Registro[] }) {
  if (registros.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border-strong)] p-8 text-center text-sm text-[var(--text-muted)]">
        Todavía no hay registros.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {registros.map((registro, i) => {
        const anterior = registros[i + 1];
        const variacion = anterior
          ? Number((registro.peso.valor - anterior.peso.valor).toFixed(1))
          : null;

        return (
          <li
            key={registro.id}
            className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition hover:border-[var(--border-strong)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="tabular text-lg font-semibold tracking-tight">
                  {registro.peso.valor} kg
                </span>
                {variacion !== null && variacion !== 0 && (
                  <span
                    className="tabular text-xs font-medium"
                    style={{ color: variacion > 0 ? "var(--critical)" : "var(--good)" }}
                  >
                    {variacion > 0 ? "+" : ""}
                    {variacion}
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                {formatearFecha(registro.fecha_hora)}
                {registro.nota ? ` · ${registro.nota}` : ""}
              </p>
            </div>

            <BotonBorrar id={registro.id} />
          </li>
        );
      })}
    </ul>
  );
}
