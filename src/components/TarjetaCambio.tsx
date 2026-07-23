import type { Cambio } from "@/lib/stats";

export default function TarjetaCambio({ titulo, cambio }: { titulo: string; cambio: Cambio }) {
  const { diferencia } = cambio;
  const sinDatos = diferencia === null;
  const subida = !sinDatos && diferencia > 0;
  const bajada = !sinDatos && diferencia < 0;

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
        {titulo}
      </span>
      {sinDatos ? (
        <span className="text-lg text-[var(--text-muted)]">—</span>
      ) : (
        <span
          className="tabular text-xl font-semibold tracking-tight"
          style={{ color: subida ? "var(--critical)" : bajada ? "var(--good)" : "var(--text-secondary)" }}
        >
          {diferencia > 0 ? "+" : ""}
          {diferencia} kg
        </span>
      )}
    </div>
  );
}
