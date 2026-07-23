"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { CLAVE_TEMA } from "@/components/ScriptTema";

type Tema = "light" | "dark" | "system";

const OPCIONES: { valor: Tema; icono: typeof Sun; etiqueta: string }[] = [
  { valor: "light", icono: Sun, etiqueta: "Claro" },
  { valor: "system", icono: Monitor, etiqueta: "Sistema" },
  { valor: "dark", icono: Moon, etiqueta: "Oscuro" },
];

/**
 * El tema vive en el DOM (atributo data-theme, que fija el script inline antes
 * del primer pintado) y en localStorage. Lo leemos con useSyncExternalStore
 * para que el render del servidor devuelva "system" y el del cliente el valor
 * real, sin efectos ni mismatch de hidratación.
 */
const suscriptores = new Set<() => void>();

function suscribir(alCambiar: () => void) {
  suscriptores.add(alCambiar);
  return () => {
    suscriptores.delete(alCambiar);
  };
}

function notificar() {
  suscriptores.forEach((s) => s());
}

function snapshotCliente(): Tema {
  const actual = document.documentElement.getAttribute("data-theme");
  return actual === "light" || actual === "dark" ? actual : "system";
}

// El servidor no conoce la preferencia; "system" es el marcado neutro.
const snapshotServidor = (): Tema => "system";

export default function BotonTema() {
  const tema = useSyncExternalStore(suscribir, snapshotCliente, snapshotServidor);

  const aplicar = useCallback((siguiente: Tema) => {
    if (siguiente === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", siguiente);
    }

    try {
      if (siguiente === "system") localStorage.removeItem(CLAVE_TEMA);
      else localStorage.setItem(CLAVE_TEMA, siguiente);
    } catch {
      // localStorage no disponible (modo privado): el cambio vale solo para esta sesión.
    }

    notificar();
  }, []);

  return (
    <div
      role="radiogroup"
      aria-label="Tema de la interfaz"
      className="inline-flex items-center gap-0.5 rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5"
    >
      {OPCIONES.map(({ valor, icono: Icono, etiqueta }) => {
        const activo = tema === valor;
        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={activo}
            aria-label={etiqueta}
            title={etiqueta}
            onClick={() => aplicar(valor)}
            className={`flex size-7 items-center justify-center rounded-full transition ${
              activo
                ? "bg-[var(--brand)] text-[var(--brand-contrast)]"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <Icono className="size-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
