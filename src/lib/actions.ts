"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ref, push, set, remove, get } from "firebase/database";
import { db } from "@/lib/firebase";
import type { Registro } from "@/lib/registros";
import {
  USERNAME_COOKIE,
  USERNAME_POR_DEFECTO,
  getUsername,
  normalizarUsername,
} from "@/lib/usuario";

const USUARIO_ID = "temporal";

export async function getRegistros(): Promise<Registro[]> {
  const username = await getUsername();
  const snapshot = await get(ref(db, "registros_peso"));

  if (!snapshot.exists()) return [];

  const registros: Registro[] = [];
  snapshot.forEach((child) => {
    const val = child.val();
    const registro: Registro = {
      ...val,
      id: child.key as string,
      usuario_id: val.usuario_id ?? USUARIO_ID,
      username: val.username ?? USERNAME_POR_DEFECTO,
    };
    if (registro.username === username) registros.push(registro);
  });

  return registros.sort((a, b) => b.fecha_hora.localeCompare(a.fecha_hora));
}

export async function cambiarUsername(formData: FormData) {
  const username = normalizarUsername(String(formData.get("username") ?? ""));

  if (!username) {
    throw new Error("El nombre de usuario no puede estar vacío");
  }

  const store = await cookies();
  store.set(USERNAME_COOKIE, username, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/goals");
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

  const username = await getUsername();
  const now = new Date().toISOString();
  const nuevoRef = push(ref(db, "registros_peso"));

  await set(nuevoRef, {
    usuario_id: USUARIO_ID,
    username,
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
  const username = await getUsername();
  const registroRef = ref(db, `registros_peso/${id}`);
  const snapshot = await get(registroRef);

  if (!snapshot.exists()) return;

  const dueño = snapshot.val()?.username ?? USERNAME_POR_DEFECTO;
  if (dueño !== username) {
    throw new Error("No puedes borrar un registro de otro usuario");
  }

  await remove(registroRef);
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/goals");
}
