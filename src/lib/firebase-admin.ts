import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
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

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

let cachedAuth: Auth | null = null;
let cachedDb: Database | null = null;

export function getAdminAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getAdminApp());
  }
  return cachedAuth;
}

/**
 * Base de datos con credenciales de administrador: se salta las reglas de
 * seguridad, así que TODA consulta debe acotarse al uid del usuario ya
 * verificado (ver requireUsuario en session.ts). Las reglas siguen siendo la
 * red de seguridad frente al cliente, no frente a este código.
 */
export function getAdminDb(): Database {
  if (!cachedDb) {
    cachedDb = getDatabase(getAdminApp());
  }
  return cachedDb;
}
