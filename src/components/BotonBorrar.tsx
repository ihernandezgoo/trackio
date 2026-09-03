"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { borrarRegistro } from "@/lib/actions";

export default function BotonBorrar({ id, etiqueta }: { id: string; etiqueta: string }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  function borrar() {
    iniciar(async () => {
      const resultado = await borrarRegistro(id);
      if (!resultado.ok) {
        setError(resultado.error ?? "No se pudo borrar.");
        setConfirmando(false);
      }
    });
  }

  if (error) {
    return (
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirmando(true);
        }}
        className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-[var(--critical)]"
      >
        Error · reintentar
      </button>
    );
  }

  if (confirmando) {
    return (
      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={borrar}
          disabled={pendiente}
          className="rounded-lg bg-[var(--critical)] px-2.5 py-1 text-xs font-semibold text-white transition disabled:opacity-50"
        >
          {pendiente ? "…" : "Borrar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          disabled={pendiente}
          className="rounded-lg px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] disabled:opacity-50"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      aria-label={`Borrar registro de ${etiqueta}`}
      className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] opacity-0 transition hover:bg-[var(--critical)]/10 hover:text-[var(--critical)] focus-visible:opacity-100 group-hover:opacity-100 max-sm:opacity-100"
    >
      <X className="size-4" aria-hidden />
    </button>
  );
}
