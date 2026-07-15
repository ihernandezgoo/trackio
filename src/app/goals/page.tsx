import { getRegistros } from "@/lib/actions";
import { calcularRachaActual, diasConRegistro, generarHeatmap } from "@/lib/stats";
import HeatmapActividad from "@/components/HeatmapActividad";

export default async function GoalsPage() {
  const registros = await getRegistros();
  const heatmap = generarHeatmap(registros);
  const racha = calcularRachaActual(registros);
  const totalDias = diasConRegistro(registros).size;
  const hoyCumplido = heatmap[heatmap.length - 1]?.completado ?? false;

  return (
    <main className="flex w-full flex-col gap-6 px-6 pt-8 pb-6">
      <header>
        <h1 className="text-2xl font-bold">Objetivos</h1>
        <p className="text-sm text-[var(--text-secondary)]">Sigue tu constancia día a día</p>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold">Pésate al menos una vez al día</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {hoyCumplido ? "Objetivo cumplido hoy ✅" : "Todavía no te has pesado hoy"}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            style={
              hoyCumplido
                ? { background: "color-mix(in oklab, var(--good) 15%, transparent)", color: "var(--good)" }
                : { background: "var(--surface-muted)", color: "var(--text-secondary)" }
            }
          >
            {hoyCumplido ? "Hoy: hecho" : "Hoy: pendiente"}
          </span>
        </div>

        <div className="flex gap-6">
          <div>
            <span className="block text-2xl font-bold">{racha}</span>
            <span className="text-xs text-[var(--text-secondary)]">días seguidos</span>
          </div>
          <div>
            <span className="block text-2xl font-bold">{totalDias}</span>
            <span className="text-xs text-[var(--text-secondary)]">días totales</span>
          </div>
        </div>

        <HeatmapActividad dias={heatmap} />
      </section>
    </main>
  );
}
