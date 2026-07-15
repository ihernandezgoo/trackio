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
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx="32" cy="32" r={radio} fill="none" stroke="var(--surface-muted)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={radio}
            fill="none"
            stroke={COLORES[color]}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={circunferencia * (1 - clamped / 100)}
          />
        </svg>
        <span className="absolute text-xs font-semibold">{valorTexto}</span>
      </div>
      <span className="text-xs font-medium text-[var(--text-secondary)]">{etiqueta}</span>
    </div>
  );
}
