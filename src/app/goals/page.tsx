import { getRegistros } from "@/lib/actions";
import { calcularRachaActual, diasConRegistro, generarHeatmap, diaClaveHoy } from "@/lib/stats";
import HeatmapActividad from "@/components/HeatmapActividad";
import { Check, Flame } from "lucide-react";

export default async function GoalsPage() {
  const registros = await getRegistros();
  const heatmap = generarHeatmap(registros);
  const racha = calcularRachaActual(registros);
  const totalDias = diasConRegistro(registros).size;
  const hoyCumplido = heatmap.find((d) => d.fecha === diaClaveHoy())?.completado ?? false;

  return (
    <main className="flex w-full flex-col gap-5 px-5 pt-8 pb-6">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Constancia
        </p>
        <h1 className="mt-1 text-[1.75rem] font-semibold leading-tight tracking-tight">
          Objetivos
        </h1>
      </header>

      <div className="grid gap-2.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-stretch">
      <section
        className={`flex items-center gap-3 rounded-2xl border p-4 ${
          hoyCumplido
            ? "border-[var(--good)]/25 bg-[var(--good)]/8"
            : "border-[var(--border)] bg-[var(--surface)]"
        }`}
      >
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
            hoyCumplido
              ? "bg-[var(--good)] text-white"
              : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
          }`}
        >
          <Check className="size-5" strokeWidth={2.5} aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold">
            {hoyCumplido ? "Pesaje de hoy hecho" : "Aún no te has pesado hoy"}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {hoyCumplido ? "Sigue así mañana" : "Registra tu peso para mantener la racha"}
          </p>
        </div>
      </section>

      <div className="flex flex-col justify-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          <Flame className="size-3.5" aria-hidden />
          Racha
        </span>
        <span className="tabular text-2xl font-semibold tracking-tight">
          {racha} <span className="text-sm font-medium text-[var(--text-muted)]">días</span>
        </span>
      </div>
      <div className="flex flex-col justify-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Total
        </span>
        <span className="tabular text-2xl font-semibold tracking-tight">
          {totalDias} <span className="text-sm font-medium text-[var(--text-muted)]">días</span>
        </span>
      </div>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Actividad</h2>
          <p className="text-xs text-[var(--text-muted)]">Últimos 3 meses</p>
        </div>
        <HeatmapActividad dias={heatmap} />
      </section>
    </main>
  );
}
