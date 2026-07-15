export default function AnilloProgreso({
  valor,
  unidad,
  etiqueta,
}: {
  valor: number | null;
  unidad: string;
  etiqueta: string;
}) {
  const radio = 90;
  const circunferencia = 2 * Math.PI * radio;

  return (
    <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radio}
          fill="none"
          stroke="var(--surface-muted)"
          strokeWidth="12"
        />
        <circle
          cx="100"
          cy="100"
          r={radio}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={valor === null ? circunferencia : circunferencia * 0.22}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        {valor === null ? (
          <span className="text-lg font-medium text-[var(--text-muted)]">Sin registros</span>
        ) : (
          <>
            <span className="text-5xl font-bold sm:text-6xl">{valor}</span>
            <span className="text-sm font-medium text-[var(--text-muted)]">{unidad}</span>
          </>
        )}
        <span className="mt-2 text-xs font-medium text-[var(--text-secondary)]">{etiqueta}</span>
      </div>
    </div>
  );
}
