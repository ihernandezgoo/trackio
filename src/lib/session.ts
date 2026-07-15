import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export async function getUsuarioActual(): Promise<{ uid: string; email: string | null } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}

export async function requireUsuario() {
  const usuario = await getUsuarioActual();
  if (!usuario) throw new Error("No autenticado");
  return usuario;
}
