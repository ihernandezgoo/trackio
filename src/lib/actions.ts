"use server";

import { revalidatePath } from "next/cache";
import { ref, push, set, remove, get } from "firebase/database";
import { db } from "@/lib/firebase";
import type { Registro } from "@/lib/registros";

export async function getRegistros(): Promise<Registro[]> {
  const snapshot = await get(ref(db, "registros_peso"));

  if (!snapshot.exists()) return [];

  const registros: Registro[] = [];
  snapshot.forEach((child) => {
    registros.push({ id: child.key as string, ...child.val() });
  });

  return registros.sort((a, b) => b.fecha_hora.localeCompare(a.fecha_hora));
}

function momentoDelDiaActual(): "mañana" | "tarde" | "noche" {
  const hora = new Date().getHours();
  if (hora < 12) return "mañana";
  if (hora < 20) return "tarde";
  return "noche";
}

export async function crearRegistroRapido(formData: FormData) {
  const pesoTexto = String(formData.get("peso") ?? "").replace(",", ".");
  const valor = Number(pesoTexto);
  const nota = String(formData.get("nota") ?? "").trim();

  if (!valor || valor <= 0) {
    throw new Error("El peso debe ser un número mayor que 0");
  }

  const now = new Date().toISOString();
  const nuevoRef = push(ref(db, "registros_peso"));

  await set(nuevoRef, {
    usuario_id: "temporal",
    peso: { valor, unidad: "kg" },
    fecha_hora: now,
    nota: nota || null,
    condicion: { en_ayunas: false, momento_dia: momentoDelDiaActual() },
    dispositivo: "manual",
    creado_en: now,
    actualizado_en: now,
  });

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/goals");
}

export async function borrarRegistro(id: string) {
  await remove(ref(db, `registros_peso/${id}`));
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/goals");
}
