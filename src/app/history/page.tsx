import { getRegistros } from "@/lib/actions";
import { calcularCambio, ultimos7Dias } from "@/lib/stats";
import TarjetaCambio from "@/components/TarjetaCambio";
import FiltrosHistorial from "@/components/FiltrosHistorial";
import GraficoSemanal from "@/components/GraficoSemanal";
import TabsHistorial from "@/components/TabsHistorial";

export default async function HistoryPage() {
  const registros = await getRegistros();

  const cambioDiario = calcularCambio(registros, 1);
  const cambioSemanal = calcularCambio(registros, 7);
  const cambioMensual = calcularCambio(registros, 30);
  const cambioAnual = calcularCambio(registros, 365);
  const semana = ultimos7Dias(registros);

  return (
    <main className="flex w-full flex-col gap-6 px-5 pt-8 pb-6">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Evolución
        </p>
        <h1 className="mt-1 text-[1.75rem] font-semibold leading-tight tracking-tight">
          Historial
        </h1>
      </header>

      <TabsHistorial
        historial={
          <div className="flex flex-col gap-4">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
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
