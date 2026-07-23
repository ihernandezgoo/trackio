import type { DiaHeatmap } from "@/lib/stats";

const DIAS_LABEL = ["", "L", "", "X", "", "V", ""];
const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function agruparPorSemana(dias: DiaHeatmap[]): DiaHeatmap[][] {
  const semanas: DiaHeatmap[][] = [];
  for (let i = 0; i < dias.length; i += 7) {
    semanas.push(dias.slice(i, i + 7));
  }
  return semanas;
}

export default function HeatmapActividad({ dias }: { dias: DiaHeatmap[] }) {
  const semanas = agruparPorSemana(dias);

  const etiquetasMes: { semanaIndex: number; mes: string }[] = [];
  let ultimoMes = -1;
  semanas.forEach((semana, i) => {
    const primerDia = new Date(semana[0].fecha);
    const mes = primerDia.getMonth();
    if (mes !== ultimoMes) {
      etiquetasMes.push({ semanaIndex: i, mes: MESES[mes] });
      ultimoMes = mes;
    }
  });

  return (
    <div className="flex w-full justify-center overflow-x-auto">
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1.5 pl-7 text-[11px] text-[var(--text-muted)]">
          {semanas.map((_, i) => {
            const etiqueta = etiquetasMes.find((e) => e.semanaIndex === i);
            return (
              <div key={i} className="w-[26px] shrink-0">
                {etiqueta ? etiqueta.mes : ""}
              </div>
            );
          })}
        </div>

        <div className="flex gap-1.5">
          <div className="flex w-7 shrink-0 flex-col gap-1.5 pr-1 text-[11px] text-[var(--text-muted)]">
            {DIAS_LABEL.map((label, i) => (
              <div key={i} className="flex h-[26px] items-center leading-none">
                {label}
              </div>
            ))}
          </div>

          {semanas.map((semana, i) => (
            <div key={i} className="flex shrink-0 flex-col gap-1.5">
              {semana.map((dia) => (
                <div
                  key={dia.fecha}
                  title={`${dia.fecha}${dia.completado ? " · pesado" : ""}`}
                  className="size-[26px] rounded-md"
                  style={{
                    background: dia.completado ? "var(--brand)" : "var(--surface-muted)",
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 pt-2 pl-7 text-[11px] text-[var(--text-muted)]">
          <span className="size-3 rounded-[4px]" style={{ background: "var(--surface-muted)" }} />
          <span className="size-3 rounded-[4px]" style={{ background: "var(--brand)" }} />
          <span>Pesaje diario</span>
        </div>
      </div>
    </div>
  );
}
