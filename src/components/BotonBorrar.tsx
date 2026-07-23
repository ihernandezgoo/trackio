"use client";

import { X } from "lucide-react";
import { borrarRegistro } from "@/lib/actions";

export default function BotonBorrar({ id }: { id: string }) {
  return (
    <button
      onClick={() => borrarRegistro(id)}
      aria-label="Borrar registro"
      className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] opacity-0 transition hover:bg-[var(--critical)]/10 hover:text-[var(--critical)] focus-visible:opacity-100 group-hover:opacity-100 max-sm:opacity-100"
    >
      <X className="size-4" aria-hidden />
    </button>
  );
}
