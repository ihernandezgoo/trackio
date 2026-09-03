import "server-only";

import { cache } from "react";

/**
 * Trackio es una app de un solo usuario: no hay pantalla de login. El servidor
 * trabaja siempre en nombre del propietario, cuyo uid se configura en
 * TRACKIO_UID (ver .env.example).
 *
 * Ese uid no viaja nunca al navegador: se usa solo aquí, en el servidor, para
 * acotar las consultas del SDK de administrador. Las reglas de
 * database.rules.json siguen cerradas, así que nadie puede leer la base de
 * datos desde fuera.
 */
export type Usuario = { uid: string };

export const getUsuario = cache((): Usuario => {
  const uid = process.env.TRACKIO_UID;

  if (!uid) {
    throw new Error(
      "Falta la variable TRACKIO_UID. Copia .env.example a .env.local y rellénala.",
    );
  }

  return { uid };
});
