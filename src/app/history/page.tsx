import { getRegistros } from "@/lib/actions";
import { calcularCambio, ultimos7Dias } from "@/lib/stats";
import TarjetaCambio from "@/components/TarjetaCambio";
import TablaRegistros from "@/components/TablaRegistros";
import GraficoSemanal from "@/components/GraficoSemanal";

export default async function HistoryPage() {
  const registros = await getRegistros();

  const cambioDiario = calcularCambio(registros, 1);
  const cambioSemanal = calcularCambio(registros, 7);
  const cambioMensual = calcularCambio(registros, 30);
  const cambioAnual = calcularCambio(registros, 365);
  const semana = ultimos7Dias(registros);

  return (
    <main className="flex w-full flex-col gap-6 px-6 pt-8 pb-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historial</h1>
          <p className="text-sm text-[var(--text-secondary)]">Evolución de tu peso</p>
        </div>
      </header>

      <section className="rounded-2xl bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Resumen</h2>
            <p className="text-xs text-[var(--text-secondary)]">Esta semana</p>
          </div>
        </div>
        <GraficoSemanal dias={semana} />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <TarjetaCambio titulo="Diario" cambio={cambioDiario} />
        <TarjetaCambio titulo="Semanal" cambio={cambioSemanal} />
        <TarjetaCambio titulo="Mensual" cambio={cambioMensual} />
        <TarjetaCambio titulo="Anual" cambio={cambioAnual} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Todos los registros</h2>
        <TablaRegistros registros={registros} />
      </section>
    </main>
  );
}
