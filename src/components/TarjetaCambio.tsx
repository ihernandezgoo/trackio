import type { Cambio } from "@/lib/stats";

export default function TarjetaCambio({ titulo, cambio }: { titulo: string; cambio: Cambio }) {
  const { diferencia } = cambio;
  const sinDatos = diferencia === null;
  const subida = !sinDatos && diferencia > 0;
  const bajada = !sinDatos && diferencia < 0;

  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-[var(--surface)] p-4 shadow-sm ring-1 ring-[var(--border)]">
      <span className="text-xs font-medium text-[var(--text-secondary)]">{titulo}</span>
      {sinDatos ? (
        <span className="text-lg text-[var(--text-muted)]">Sin datos</span>
      ) : (
        <span
          className="text-xl font-semibold"
          style={{ color: subida ? "var(--critical)" : bajada ? "var(--good)" : "var(--text-secondary)" }}
        >
          {diferencia > 0 ? "+" : ""}
          {diferencia} kg
        </span>
      )}
    </div>
  );
}
