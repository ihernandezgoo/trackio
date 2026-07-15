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
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="flex-1 rounded-full bg-[var(--brand)] px-6 py-3 text-base font-semibold text-white shadow-md shadow-[var(--brand)]/25 transition hover:brightness-110"
        >
          Registrar peso
        </button>
        <a
          href="/history"
          className="flex-1 rounded-full bg-[var(--surface-muted)] px-6 py-3 text-center text-base font-semibold text-[var(--foreground)] transition hover:brightness-95"
        >
          Ver historial
        </a>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
          <form
            ref={formRef}
            onSubmit={guardar}
            className="w-full max-w-sm rounded-t-2xl bg-[var(--surface)] p-5 shadow-lg sm:rounded-2xl"
          >
            <h2 className="text-lg font-semibold">¿Cuánto pesas hoy?</h2>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              La fecha y hora se guardan automáticamente.
            </p>

            <div className="flex items-baseline justify-center gap-2 py-2">
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                name="peso"
                required
                autoFocus
                defaultValue={ultimoPeso ?? undefined}
                placeholder="0.0"
                className="w-32 bg-transparent text-center text-5xl font-bold outline-none"
              />
              <span className="text-lg font-medium text-[var(--text-muted)]">kg</span>
            </div>

            <input
              type="text"
              name="nota"
              placeholder="Mensaje opcional (ej: en ayunas)"
              className="mt-3 w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-base outline-none focus:border-[var(--brand)]"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setAbierto(false)}
                disabled={guardando}
                className="flex-1 rounded-full border border-[var(--border)] px-4 py-2 font-medium transition hover:bg-[var(--surface-muted)] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 rounded-full bg-[var(--brand)] px-4 py-2 font-medium text-white transition hover:brightness-110 disabled:opacity-50"
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
