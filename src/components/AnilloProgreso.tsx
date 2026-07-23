export default function AnilloProgreso({
  valor,
  unidad,
  etiqueta,
}: {
  valor: number | null;
  unidad: string;
  etiqueta: string;
}) {
  const radio = 88;
  const circunferencia = 2 * Math.PI * radio;

  return (
    <div className="relative flex h-52 w-52 items-center justify-center sm:h-60 sm:w-60">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radio}
          fill="none"
          stroke="var(--surface-muted)"
          strokeWidth="8"
        />
        <circle
          cx="100"
          cy="100"
          r={radio}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={valor === null ? circunferencia : circunferencia * 0.22}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        {valor === null ? (
          <span className="text-base font-medium text-[var(--text-muted)]">Sin registros</span>
        ) : (
          <>
            <span className="tabular text-[3.25rem] font-semibold leading-none tracking-tight sm:text-6xl">
              {valor}
            </span>
            <span className="mt-1.5 text-sm font-medium text-[var(--text-muted)]">{unidad}</span>
          </>
        )}
        <span className="mt-2 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {etiqueta}
        </span>
      </div>
    </div>
  );
}
