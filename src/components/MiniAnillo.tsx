const COLORES = {
  brand: "var(--brand)",
  verde: "var(--ring-2)",
  ambar: "var(--ring-3)",
  azul: "var(--ring-4)",
} as const;

export default function MiniAnillo({
  porcentaje,
  etiqueta,
  valorTexto,
  color,
}: {
  porcentaje: number;
  etiqueta: string;
  valorTexto: string;
  color: keyof typeof COLORES;
}) {
  const radio = 26;
  const circunferencia = 2 * Math.PI * radio;
  const clamped = Math.max(0, Math.min(100, porcentaje));

  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-2 py-3">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx="32" cy="32" r={radio} fill="none" stroke="var(--surface-muted)" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r={radio}
            fill="none"
            stroke={COLORES[color]}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={circunferencia * (1 - clamped / 100)}
          />
        </svg>
        <span className="tabular absolute text-sm font-semibold">{valorTexto}</span>
      </div>
      <span className="text-center text-[11px] font-medium leading-tight text-[var(--text-muted)]">
        {etiqueta}
      </span>
    </div>
  );
}
