"use server";

import { revalidatePath } from "next/cache";
import { getAdminDb } from "@/lib/firebase-admin";
import { getUsuario } from "@/lib/session";
import {
  NOTA_MAX_LONGITUD,
  PESO_MAXIMO,
  PESO_MINIMO,
  type EstadoAccion,
  type MomentoDia,
  type Registro,
} from "@/lib/registros";

/** Las tres vistas dependen de los mismos datos. */
function revalidarVistas() {
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/goals");
}

/**
 * Todas las rutas cuelgan del uid del propietario. El SDK de administrador se
 * salta las reglas de seguridad, así que acotar por uid aquí no es opcional.
 */
function registrosRef() {
  const { uid } = getUsuario();
  return getAdminDb().ref(`registros_peso/${uid}`);
}

export async function getRegistros(): Promise<Registro[]> {
  const snapshot = await registrosRef().orderByChild("fecha_hora").get();

  if (!snapshot.exists()) return [];

  const registros: Registro[] = [];
  snapshot.forEach((child) => {
    registros.push({ ...child.val(), id: child.key as string });
  });

  // orderByChild devuelve ascendente; la UI espera el más reciente primero.
  return registros.reverse();
}

function momentoDelDiaActual(): MomentoDia {
  const hora = new Date().getHours();
  if (hora < 12) return "mañana";
  if (hora < 20) return "tarde";
  return "noche";
}

export async function crearRegistroRapido(
  _estadoPrevio: EstadoAccion,
  formData: FormData,
): Promise<EstadoAccion> {
  const pesoTexto = String(formData.get("peso") ?? "").trim().replace(",", ".");
  const valor = Number(pesoTexto);

  if (!pesoTexto || !Number.isFinite(valor)) {
    return { ok: false, error: "Escribe un peso válido." };
  }
  if (valor < PESO_MINIMO || valor > PESO_MAXIMO) {
    return { ok: false, error: `El peso debe estar entre ${PESO_MINIMO} y ${PESO_MAXIMO} kg.` };
  }

  const nota = String(formData.get("nota") ?? "").trim().slice(0, NOTA_MAX_LONGITUD);
  const now = new Date().toISOString();

  // Un decimal es la precisión real de una báscula doméstica.
  const pesoRedondeado = Math.round(valor * 10) / 10;

  try {
    await registrosRef().push().set({
      peso: { valor: pesoRedondeado, unidad: "kg" },
      fecha_hora: now,
      ...(nota ? { nota } : {}),
      condicion: { en_ayunas: false, momento_dia: momentoDelDiaActual() },
      dispositivo: "manual",
      creado_en: now,
      actualizado_en: now,
    });
  } catch {
    return { ok: false, error: "No se pudo guardar. Inténtalo de nuevo." };
  }

  revalidarVistas();
  return { ok: true };
}

export async function borrarRegistro(id: string): Promise<EstadoAccion> {
  // Un id con "/" o ".." podría escapar de la rama del usuario.
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return { ok: false, error: "Registro no válido." };
  }

  try {
    await registrosRef().child(id).remove();
  } catch {
    return { ok: false, error: "No se pudo borrar. Inténtalo de nuevo." };
  }

  revalidarVistas();
  return { ok: true };
}
