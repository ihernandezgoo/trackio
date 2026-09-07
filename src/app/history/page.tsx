import type { Metadata } from "next";
import { getRegistros } from "@/lib/actions";
import { calcularCambio, ultimos7Dias } from "@/lib/stats";
import TarjetaCambio from "@/components/TarjetaCambio";
import FiltrosHistorial from "@/components/FiltrosHistorial";
import GraficoSemanal from "@/components/GraficoSemanal";
import TabsHistorial from "@/components/TabsHistorial";
import { TrendingDown, TrendingUp, Weight } from "lucide-react";

export const metadata: Metadata = {
  title: "Historial · Trackio",
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const registros = await getRegistros();

  const cambioDiario = calcularCambio(registros, 1);
  const cambioSemanal = calcularCambio(registros, 7);
  const cambioMensual = calcularCambio(registros, 30);
  const cambioAnual = calcularCambio(registros, 365);
  const semana = ultimos7Dias(registros);
  const ultimoRegistro = registros[0];
  const diasConPeso = semana.filter((dia) => dia.peso !== null).length;
  const tendencia = cambioSemanal.diferencia;

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-6 px-4 pt-6 pb-6 sm:px-5 sm:pt-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Evolución
        </p>
        <h1 className="mt-1 text-[1.75rem] font-semibold leading-tight tracking-tight">
          Historial
        </h1>
      </header>

      <section className="grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3">
        <div className="col-span-2 flex min-w-0 min-h-[104px] items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:col-span-1">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
            <Weight className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Último peso
            </p>
            <p className="tabular break-words text-xl font-semibold leading-tight tracking-tight">
              {ultimoRegistro ? `${ultimoRegistro.peso.valor} kg` : "Sin registros"}
            </p>
          </div>
        </div>
        <div className="flex min-w-0 min-h-[104px] flex-col justify-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Esta semana
          </span>
          <span className="tabular flex flex-wrap items-baseline gap-x-1 text-xl font-semibold leading-tight tracking-tight">
            {diasConPeso} <span className="text-sm font-medium text-[var(--text-muted)]">de 7 días</span>
          </span>
        </div>
        <div className="flex min-w-0 min-h-[104px] flex-col justify-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            {tendencia !== null && tendencia <= 0 ? <TrendingDown className="size-3.5 text-[var(--good)]" aria-hidden /> : <TrendingUp className="size-3.5 text-[var(--critical)]" aria-hidden />}
            Cambio semanal
          </span>
          <span className="tabular break-words text-xl font-semibold leading-tight tracking-tight">
            {tendencia === null ? "—" : `${tendencia > 0 ? "+" : ""}${tendencia} kg`}
          </span>
        </div>
      </section>

      <TabsHistorial
        historial={
          <div className="flex flex-col gap-4">
            <section className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold">Esta semana</h2>
                <p className="text-xs text-[var(--text-muted)]">Últimos 7 días</p>
              </div>
              <GraficoSemanal dias={semana} />
            </section>

            <section className="grid grid-cols-2 gap-2.5">
              <TarjetaCambio titulo="Diario" cambio={cambioDiario} />
              <TarjetaCambio titulo="Semanal" cambio={cambioSemanal} />
              <TarjetaCambio titulo="Mensual" cambio={cambioMensual} />
              <TarjetaCambio titulo="Anual" cambio={cambioAnual} />
            </section>
          </div>
        }
        filtros={<FiltrosHistorial registros={registros} />}
      />
    </main>
  );
}
