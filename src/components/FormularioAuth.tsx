"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { crearSesion, mensajeErrorAuth } from "@/lib/auth-client";

export default function FormularioAuth({ modo }: { modo: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const credential =
        modo === "login"
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);

      await crearSesion(credential);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(mensajeErrorAuth(err));
      setEnviando(false);
    }
  }

  async function conGoogle() {
    setError(null);
    setEnviando(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      await crearSesion(credential);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(mensajeErrorAuth(err));
      setEnviando(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <form onSubmit={enviar} className="flex flex-col gap-3">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-base outline-none focus:border-[var(--brand)]"
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={modo === "login" ? "current-password" : "new-password"}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3 text-base outline-none focus:border-[var(--brand)]"
        />

        {error && <p className="text-sm text-[var(--critical)]">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="mt-1 w-full rounded-full bg-[var(--brand)] px-6 py-3 text-base font-semibold text-white shadow-md shadow-[var(--brand)]/25 transition hover:brightness-110 disabled:opacity-50"
        >
          {enviando ? "Cargando…" : modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
        <div className="h-px flex-1 bg-[var(--border)]" />
        o
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <button
        type="button"
        onClick={conGoogle}
        disabled={enviando}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] px-6 py-3 text-base font-semibold transition hover:bg-[var(--surface-muted)] disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.61z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.19l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.95 10.69A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.69V4.98H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.02l2.99-2.33z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.98l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
          />
        </svg>
        Continuar con Google
      </button>
    </div>
  );
}
