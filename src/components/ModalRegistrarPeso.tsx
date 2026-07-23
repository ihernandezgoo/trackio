"use client";

import { useRef, useState } from "react";
import { crearRegistroRapido } from "@/lib/actions";

export default function ModalRegistrarPeso({ ultimoPeso }: { ultimoPeso: number | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [guardando, setGuardando] = useState(false);
  const [abierto, setAbierto] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current?.reportValidity()) return;
    setGuardando(true);
    try {
      const formData = new FormData(formRef.current);
      await crearRegistroRapido(formData);
      formRef.current.reset();
      setAbierto(false);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div className="flex w-full flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="flex-1 rounded-2xl bg-[var(--brand)] px-6 py-3.5 text-[15px] font-semibold text-[var(--brand-contrast)] transition hover:brightness-110 active:scale-[0.98]"
        >
          Registrar peso
        </button>
        <a
          href="/history"
          className="flex-1 rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-3.5 text-center text-[15px] font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] active:scale-[0.98]"
        >
          Ver historial
        </a>
      </div>

      {abierto && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
          onClick={() => !guardando && setAbierto(false)}
        >
          <form
            ref={formRef}
            onSubmit={guardar}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl border-t border-[var(--border)] bg-[var(--surface)] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-lift)] sm:rounded-3xl sm:border"
          >
            <div className="mx-auto mb-5 h-1 w-9 rounded-full bg-[var(--border-strong)] sm:hidden" />

            <h2 className="text-lg font-semibold tracking-tight">¿Cuánto pesas hoy?</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              La fecha y hora se guardan automáticamente.
            </p>

            <div className="my-6 flex items-baseline justify-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                name="peso"
                required
                autoFocus
                defaultValue={ultimoPeso ?? undefined}
                placeholder="0.0"
                className="tabular w-36 bg-transparent text-center text-6xl font-semibold tracking-tight outline-none placeholder:text-[var(--text-muted)]"
              />
              <span className="text-lg font-medium text-[var(--text-muted)]">kg</span>
            </div>

            <input
              type="text"
              name="nota"
              placeholder="Nota opcional (ej: en ayunas)"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand)]"
            />

            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setAbierto(false)}
                disabled={guardando}
                className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 rounded-xl bg-[var(--brand)] px-4 py-3 font-semibold text-[var(--brand-contrast)] transition hover:brightness-110 disabled:opacity-50"
              >
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
