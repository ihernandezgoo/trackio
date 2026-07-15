import { getRegistros } from "@/lib/actions";
import { calcularRachaActual, diasConRegistro, generarHeatmap, diaClaveHoy } from "@/lib/stats";
import HeatmapActividad from "@/components/HeatmapActividad";

export default async function GoalsPage() {
  const registros = await getRegistros();
  const heatmap = generarHeatmap(registros);
  const racha = calcularRachaActual(registros);
  const totalDias = diasConRegistro(registros).size;
  const hoyCumplido = heatmap.find((d) => d.fecha === diaClaveHoy())?.completado ?? false;

  return (
    <main className="flex w-full flex-col gap-6 px-6 pt-8 pb-6">
      <header>
        <h1 className="text-2xl font-bold">Objetivos</h1>
        <p className="text-sm text-[var(--text-secondary)]">Proximamente...</p>
      </header>
    </main>
  );
}
