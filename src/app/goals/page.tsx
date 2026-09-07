import type { Metadata } from "next";
import { getRegistros } from "@/lib/actions";
import { calcularRachaActual, diasConRegistro, generarHeatmap, diaClaveHoy } from "@/lib/stats";
import HeatmapActividad from "@/components/HeatmapActividad";
import { Check, Flame, Target } from "lucide-react";
import { porcentajeDiasDelMes } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Objetivos · Trackio",
};

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const registros = await getRegistros();
  const heatmap = generarHeatmap(registros);
  const racha = calcularRachaActual(registros);
  const totalDias = diasConRegistro(registros).size;
  const constanciaMensual = porcentajeDiasDelMes(registros);
  const hoyCumplido = heatmap.find((d) => d.fecha === diaClaveHoy())?.completado ?? false;

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-5 px-4 pt-6 pb-6 sm:px-5 sm:pt-8">
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

      <section className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              <Target className="size-3.5 text-[var(--brand)]" aria-hidden />
              Meta del mes
            </p>
            <h2 className="mt-1 text-base font-semibold">Constancia de pesaje</h2>
          </div>
          <span className="tabular text-2xl font-semibold tracking-tight">{constanciaMensual}%</span>
        </div>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"
          role="progressbar"
          aria-label="Constancia de pesaje este mes"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={constanciaMensual}
        >
          <div className="h-full rounded-full bg-[var(--brand)] transition-[width]" style={{ width: `${constanciaMensual}%` }} />
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {constanciaMensual === 100 ? "Has registrado todos los días del mes." : "Registra tu peso cada día para completar la meta."}
        </p>
      </section>

      <section className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Actividad</h2>
          <p className="text-xs text-[var(--text-muted)]">Últimos 3 meses</p>
        </div>
        <HeatmapActividad dias={heatmap} />
      </section>
    </main>
  );
}
