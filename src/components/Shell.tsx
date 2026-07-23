"use client";

import { usePathname } from "next/navigation";

/** Rutas que necesitan un contenedor ancho en escritorio. */
const RUTAS_ANCHAS = ["/goals"];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ancho = RUTAS_ANCHAS.includes(pathname);

  return (
    <div
      className={`flex min-h-full w-full flex-col bg-[var(--background)] transition-[max-width] duration-300 sm:min-h-[860px] sm:rounded-[2rem] sm:border sm:border-[var(--border)] sm:shadow-[var(--shadow-lift)] ${
        ancho ? "max-w-3xl" : "max-w-md"
      }`}
    >
      {children}
    </div>
  );
}
