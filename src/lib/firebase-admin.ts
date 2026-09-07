import "server-only";

// Ojo: no importes "firebase-admin/auth" aquí. Arrastra jwks-rsa, que hace
// require() de jose (ESM puro) y revienta en el runtime de Vercel con
// ERR_REQUIRE_ESM. Trackio no tiene login, así que no hace ninguna falta.
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";

function parsePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  // Vercel/CLI a veces guarda la clave con comillas envolventes literales.
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  // Convierte \n literales en saltos reales. Si ya tiene saltos reales, no los toca.
  return key.replace(/\\n/g, "\n");
}

/**
 * Sin esto, una variable que falte en el hosting (Vercel) revienta dentro de
 * cert() con un mensaje críptico sobre "project_id", y la página solo muestra
 * "A server error occurred". Fallar aquí deja el motivo en los logs.
 */
function requireEnv(nombre: string): string {
  const valor = process.env[nombre]?.trim();

  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. En local: copia .env.example a ` +
        `.env.local y rellénala. En Vercel: Settings > Environment Variables ` +
        `(marca Production) y vuelve a desplegar.`,
    );
  }

  return valor;
}

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const privateKey = parsePrivateKey(requireEnv("FIREBASE_PRIVATE_KEY"));

  // Una clave sin saltos de línea reales no la acepta OpenSSL: suele pasar al
  // pegarla en el panel de Vercel perdiendo el formato del JSON original.
  if (!privateKey?.includes("\n")) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY no tiene saltos de línea. Pega la clave completa " +
        "tal cual viene en el JSON de la cuenta de servicio, incluidos los \\n.",
    );
  }

  return initializeApp({
    credential: cert({
      projectId: requireEnv("FIREBASE_PROJECT_ID"),
      clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey,
    }),
    databaseURL: requireEnv("NEXT_PUBLIC_FIREBASE_DATABASE_URL"),
  });
}

let cachedDb: Database | null = null;

/**
 * Base de datos con credenciales de administrador: se salta las reglas de
 * seguridad, así que TODA consulta debe acotarse al uid del propietario (ver
 * getUsuario en session.ts). Las reglas siguen siendo la red de seguridad
 * frente al cliente, no frente a este código.
 */
export function getAdminDb(): Database {
  if (!cachedDb) {
    cachedDb = getDatabase(getAdminApp());
  }
  return cachedDb;
}
