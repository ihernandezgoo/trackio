import type { Registro } from "@/lib/registros";
import BotonBorrar from "@/components/BotonBorrar";

function formatearFecha(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TablaRegistros({ registros }: { registros: Registro[] }) {
  if (registros.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-[var(--text-secondary)]">
        Todavía no hay registros.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-[var(--surface)] ring-1 ring-[var(--border)]">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-secondary)]">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Peso</th>
            <th className="px-4 py-3 font-medium">Variación</th>
            <th className="px-4 py-3 font-medium">Nota</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {registros.map((registro, i) => {
            const anterior = registros[i + 1];
            const variacion = anterior
              ? Number((registro.peso.valor - anterior.peso.valor).toFixed(1))
              : null;

            return (
              <tr key={registro.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 whitespace-nowrap text-[var(--text-secondary)]">
                  {formatearFecha(registro.fecha_hora)}
                </td>
                <td className="px-4 py-3 font-semibold">{registro.peso.valor} kg</td>
                <td className="px-4 py-3">
                  {variacion === null ? (
                    <span className="text-[var(--text-muted)]">—</span>
                  ) : (
                    <span
                      style={{
                        color:
                          variacion > 0
                            ? "var(--critical)"
                            : variacion < 0
                              ? "var(--good)"
                              : "var(--text-secondary)",
                      }}
                    >
                      {variacion > 0 ? "+" : ""}
                      {variacion} kg
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{registro.nota || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <BotonBorrar id={registro.id} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
