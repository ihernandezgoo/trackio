"use client";

import type { UserCredential } from "firebase/auth";

export async function crearSesion(credential: UserCredential) {
  const idToken = await credential.user.getIdToken();

  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    throw new Error("No se pudo crear la sesión");
  }
}

export function mensajeErrorAuth(error: unknown): string {
  const codigo = (error as { code?: string })?.code ?? "";

  switch (codigo) {
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con ese correo.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/popup-closed-by-user":
      return "Se cerró la ventana de Google antes de completar el inicio de sesión.";
    default:
      return "Ha ocurrido un error. Inténtalo de nuevo.";
  }
}
