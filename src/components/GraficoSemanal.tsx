import type { DiaResumen } from "@/lib/stats";

export default function GraficoSemanal({ dias }: { dias: DiaResumen[] }) {
  const pesos = dias.map((d) => d.peso).filter((p): p is number => p !== null);
  const max = pesos.length ? Math.max(...pesos) : 0;
  const min = pesos.length ? Math.min(...pesos) : 0;
  const rango = Math.max(max - min, 1);

  return (
    <div className="flex h-32 items-end justify-between gap-2">
      {dias.map((dia) => {
        const alturaPct = dia.peso === null ? 4 : 20 + ((dia.peso - min) / rango) * 80;
        return (
          <div key={dia.fecha} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-24 w-full items-end justify-center">
              <div
                title={dia.peso !== null ? `${dia.peso} kg` : "Sin registro"}
                style={{ height: `${alturaPct}%` }}
                className={`w-2.5 rounded-full ${
                  dia.peso === null ? "bg-[var(--surface-muted)]" : "bg-[var(--brand)]"
                }`}
              />
            </div>
            <span className="text-xs font-medium text-[var(--text-muted)]">{dia.etiqueta}</span>
          </div>
        );
      })}
    </div>
  );
}
