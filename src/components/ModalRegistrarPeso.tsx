"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { crearRegistroRapido } from "@/lib/actions";
import { PESO_MAXIMO, PESO_MINIMO, type EstadoAccion } from "@/lib/registros";

const ESTADO_INICIAL: EstadoAccion = { ok: false };

function BotonGuardar() {
  // useFormStatus lee el estado del <form> padre, sin duplicar estado propio.
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-xl bg-[var(--brand)] px-4 py-3 font-semibold text-[var(--brand-contrast)] transition hover:brightness-110 disabled:opacity-50"
    >
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

export default function ModalRegistrarPeso({ ultimoPeso }: { ultimoPeso: number | null }) {
  const [abierto, setAbierto] = useState(false);
  const dialogoRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<HTMLButtonElement>(null);
  const tituloId = useId();

  // Envolvemos la Server Action para cerrar en el mismo paso en que se guarda,
  // en lugar de reaccionar al resultado desde un efecto.
  const [estado, accion] = useActionState(
    async (previo: EstadoAccion, formData: FormData) => {
      const resultado = await crearRegistroRapido(previo, formData);
      if (resultado.ok) setAbierto(false);
      return resultado;
    },
    ESTADO_INICIAL,
  );

  // Cierre con Escape, bloqueo del scroll de fondo y foco atrapado en el diálogo.
  useEffect(() => {
    if (!abierto) {
      disparadorRef.current?.focus();
      return;
    }

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function alPulsar(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAbierto(false);
        return;
      }
      if (e.key !== "Tab") return;

      const foco = dialogoRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!foco?.length) return;

      const primero = foco[0];
      const ultimo = foco[foco.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", alPulsar);
    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto]);

  return (
    <>
      <div className="flex w-full flex-col gap-2.5 sm:flex-row">
        <button
          ref={disparadorRef}
          type="button"
          onClick={() => setAbierto(true)}
          className="flex-1 rounded-2xl bg-[var(--brand)] px-6 py-3.5 text-[15px] font-semibold text-[var(--brand-contrast)] transition hover:brightness-110 active:scale-[0.98]"
        >
          Registrar peso
        </button>
        <Link
          href="/history"
          className="flex-1 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-3.5 text-center text-[15px] font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] active:scale-[0.98]"
        >
          Ver historial
        </Link>
      </div>

      {abierto && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={() => setAbierto(false)}
        >
          <div
            ref={dialogoRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl border-t border-[var(--border)] bg-[var(--surface)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-lift)] sm:rounded-3xl sm:border"
          >
            <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-[var(--border-strong)] sm:hidden" />

            <h2 id={tituloId} className="text-lg font-semibold tracking-tight">
              ¿Cuánto pesas hoy?
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              La fecha y hora se guardan automáticamente.
            </p>

            <form action={accion}>
              <div className="my-6 flex items-baseline justify-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  name="peso"
                  required
                  autoFocus
                  aria-label={`Peso en kilos, entre ${PESO_MINIMO} y ${PESO_MAXIMO}`}
                  defaultValue={ultimoPeso ?? undefined}
                  placeholder="0.0"
                  className="tabular w-36 bg-transparent text-center text-6xl font-semibold tracking-tight outline-none placeholder:text-[var(--text-muted)]"
                />
                <span className="text-lg font-medium text-[var(--text-muted)]">kg</span>
              </div>

              <input
                type="text"
                name="nota"
                maxLength={280}
                placeholder="Nota opcional (ej: en ayunas)"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand)]"
              />

              {estado.error && (
                <p role="alert" className="mt-3 text-sm font-medium text-[var(--critical)]">
                  {estado.error}
                </p>
              )}

              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)]"
                >
                  Cancelar
                </button>
                <BotonGuardar />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
