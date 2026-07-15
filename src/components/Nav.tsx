"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { History, House, LogOut } from 'lucide-react';

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function cerrarSesion() {
    await signOut(auth);
    await fetch("/api/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  const iconClase = (activo: boolean) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition ${
      activo ? "text-[var(--brand)]" : "text-[var(--text-muted)]"
    }`;

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <nav className="sticky bottom-0 z-20 mt-6 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
      <div className="relative mx-auto flex w-full max-w-md items-center justify-between px-8">
        <Link href="/history" className={iconClase(pathname === "/history")}>
          <History className="h-5 w-5" />
          Historial
        </Link>

        <Link
          href="/"
          aria-label="Añadir peso"
          className="absolute left-1/2 -top-6 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[var(--brand)] text-2xl font-bold text-white shadow-lg shadow-[var(--brand)]/30 transition hover:brightness-110"
        >
          <House className="h-5 w-5" />
        </Link>

        <button type="button" onClick={cerrarSesion} className={iconClase(false)}>
          <LogOut className="h-5 w-5" />
          Salir
        </button>
      </div>
    </nav>
  );
}
