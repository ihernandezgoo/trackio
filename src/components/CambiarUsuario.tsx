"use client";

import { useRef, useState } from "react";
import { cambiarUsername } from "@/lib/actions";

export default function CambiarUsuario({ username }: { username: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current?.reportValidity()) return;
    setGuardando(true);
    try {
      await cambiarUsername(new FormData(formRef.current));
      setEditando(false);
    } finally {
      setGuardando(false);
    }
  }

  if (!editando) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        Hola,{" "}
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="font-medium text-[var(--brand)] underline underline-offset-2 transition hover:brightness-110"
        >
          {username}
        </button>
      </p>
    );
  }

  return (
    <form ref={formRef} onSubmit={guardar} className="mt-1 flex items-center gap-2">
      <input
        type="text"
        name="username"
        required
        maxLength={32}
        autoFocus
        defaultValue={username}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditando(false);
        }}
        className="w-36 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--brand)]"
      />
      <button
        type="submit"
        disabled={guardando}
        className="rounded-full bg-[var(--brand)] px-3 py-1 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
      >
        {guardando ? "…" : "Guardar"}
      </button>
      <button
        type="button"
        onClick={() => setEditando(false)}
        disabled={guardando}
        className="rounded-full px-2 py-1 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)] disabled:opacity-50"
      >
        Cancelar
      </button>
    </form>
  );
}
