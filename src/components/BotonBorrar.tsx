"use client";

import { borrarRegistro } from "@/lib/actions";

export default function BotonBorrar({ id }: { id: string }) {
  return (
    <button
      onClick={() => borrarRegistro(id)}
      aria-label="Borrar registro"
      className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--critical)]/10 hover:text-[var(--critical)]"
    >
      ✕
    </button>
  );
}
