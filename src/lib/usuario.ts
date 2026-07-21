import { cookies } from "next/headers";

export const USERNAME_COOKIE = "trackio_username";
export const USERNAME_POR_DEFECTO = "usuario";

export function normalizarUsername(valor: string): string {
  return valor.trim().toLowerCase().slice(0, 32);
}

export async function getUsername(): Promise<string> {
  const store = await cookies();
  const valor = store.get(USERNAME_COOKIE)?.value;
  const normalizado = valor ? normalizarUsername(valor) : "";
  return normalizado || USERNAME_POR_DEFECTO;
}
