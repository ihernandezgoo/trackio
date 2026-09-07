"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { Target, TrendingDown, Trophy, Pencil } from "lucide-react";
import { borrarMeta, guardarMeta } from "@/lib/actions";
import { PESO_MAXIMO, PESO_MINIMO, type EstadoAccion } from "@/lib/registros";
import type { ProgresoMeta } from "@/lib/stats";

const ESTADO_INICIAL: EstadoAccion = { ok: false };

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-contrast)] transition hover:brightness-110 disabled:opacity-50"
    >
      {pending ? "Guardando…" : "Guardar meta"}
    </button>
  );
}

/** Formulario de alta/edición. Se reutiliza tanto si hay meta como si no. */
function FormularioMeta({
  valorInicial,
  onHecho,
  onCancelar,
}: {
  valorInicial?: number;
  onHecho: () => void;
  onCancelar?: () => void;
}) {
  const campoId = useId();

  const [estado, accion] = useActionState(async (previo: EstadoAccion, datos: FormData) => {
    const resultado = await guardarMeta(previo, datos);
    if (resultado.ok) onHecho();
    return resultado;
  }, ESTADO_INICIAL);

  return (
    <form action={accion} className="mt-4">
      <label htmlFor={campoId} className="text-sm text-[var(--text-secondary)]">
        ¿Qué peso quieres alcanzar?
      </label>
      <div className="mt-2 flex items-center gap-2">
        <input
          id={campoId}
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          name="objetivo"
          required
          autoFocus
          defaultValue={valorInicial}
          placeholder="70.0"
          aria-label={`Peso objetivo en kilos, entre ${PESO_MINIMO} y ${PESO_MAXIMO}`}
          className="tabular w-28 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 text-center text-2xl font-semibold outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand)]"
        />
        <span className="text-sm font-medium text-[var(--text-muted)]">kg</span>
      </div>

      {estado.error && (
        <p role="alert" className="mt-3 text-sm font-medium text-[var(--critical)]">
          {estado.error}
        </p>
      )}

      <div className="mt-4 flex gap-2.5">
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)]"
          >
            Cancelar
          </button>
        )}
        <BotonGuardar />
      </div>
    </form>
  );
}

export default function TarjetaMeta({ progreso }: { progreso: ProgresoMeta | null }) {
  const [editando, setEditando] = useState(false);

  // Sin meta fijada: invitamos a crearla.
  if (!progreso) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          <Target className="size-3.5 text-[var(--brand)]" aria-hidden />
          Meta de peso
        </p>
        {editando ? (
          <FormularioMeta onHecho={() => setEditando(false)} onCancelar={() => setEditando(false)} />
        ) : (
          <>
            <h2 className="mt-1 text-base font-semibold">Aún no tienes objetivo</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Fija un peso meta para seguir tu progreso y ver una estimación de cuándo lo
              alcanzarás.
            </p>
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="mt-4 w-full rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-contrast)] transition hover:brightness-110 sm:w-auto sm:px-5"
            >
              Fijar objetivo
            </button>
          </>
        )}
      </section>
    );
  }

  const { actual, objetivo, pesoInicial, restante, porcentaje, alcanzada, ritmoSemanal, semanasEstimadas } =
    progreso;

  return (
    <section
      className={`rounded-2xl border p-4 sm:p-5 ${
        alcanzada
          ? "border-[var(--good)]/25 bg-[var(--good)]/8"
          : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {alcanzada ? (
            <Trophy className="size-3.5 text-[var(--good)]" aria-hidden />
          ) : (
            <Target className="size-3.5 text-[var(--brand)]" aria-hidden />
          )}
          Meta de peso
        </p>
        {!editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            aria-label="Editar meta de peso"
            className="-m-1.5 rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
          >
            <Pencil className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {editando ? (
        <FormularioMeta
          valorInicial={objetivo}
          onHecho={() => setEditando(false)}
          onCancelar={() => setEditando(false)}
        />
      ) : (
        <>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="tabular text-3xl font-semibold tracking-tight">{actual}</span>
            <span className="text-sm text-[var(--text-muted)]">→</span>
            <span className="tabular text-2xl font-semibold tracking-tight text-[var(--brand)]">
              {objetivo}
            </span>
            <span className="text-sm font-medium text-[var(--text-muted)]">kg</span>
          </div>

          <p className="mt-1 text-sm font-medium">
            {alcanzada ? (
              <span className="text-[var(--good)]">¡Objetivo alcanzado!</span>
            ) : (
              <>
                Te {restante === 1 ? "falta" : "faltan"}{" "}
                <span className="tabular font-semibold">{restante} kg</span>
              </>
            )}
          </p>

          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"
            role="progressbar"
            aria-label="Progreso hacia la meta de peso"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={porcentaje}
          >
            <div
              className={`h-full rounded-full transition-[width] ${
                alcanzada ? "bg-[var(--good)]" : "bg-[var(--brand)]"
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
            <span className="tabular">Inicio {pesoInicial}</span>
            <span className="tabular font-medium text-[var(--text-secondary)]">{porcentaje}%</span>
            <span className="tabular">Meta {objetivo}</span>
          </div>

          {!alcanzada && ritmoSemanal !== null && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--border)] pt-3 text-xs">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <TrendingDown className="size-3.5" aria-hidden />
                Ritmo{" "}
                <span className="tabular font-semibold text-[var(--foreground)]">
                  {ritmoSemanal > 0 ? "+" : ""}
                  {ritmoSemanal} kg/sem
                </span>
              </span>
              {semanasEstimadas !== null ? (
                <span className="text-[var(--text-secondary)]">
                  Estimado{" "}
                  <span className="tabular font-semibold text-[var(--foreground)]">
                    ~{semanasEstimadas} {semanasEstimadas === 1 ? "semana" : "semanas"}
                  </span>
                </span>
              ) : (
                <span className="text-[var(--text-muted)]">
                  Sin estimación: no te estás acercando a la meta.
                </span>
              )}
            </div>
          )}

          <form
            action={async () => {
              await borrarMeta();
            }}
            className="mt-3"
          >
            <button
              type="submit"
              className="text-xs font-medium text-[var(--text-muted)] underline-offset-2 transition hover:text-[var(--critical)] hover:underline"
            >
              Quitar meta
            </button>
          </form>
        </>
      )}
    </section>
  );
}
