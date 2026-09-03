/**
 * Borra los registros del esquema antiguo (los que cuelgan directamente de
 * registros_peso/<id> en vez de registros_peso/<uid>/<id>), una vez verificada
 * la migración con scripts/migrar-a-uid.mjs.
 *
 * Uso:
 *   node scripts/limpiar-registros-antiguos.mjs            # simulación
 *   node scripts/limpiar-registros-antiguos.mjs --aplicar  # borra de verdad
 *
 * Haz una copia de seguridad antes:
 *   curl "<DATABASE_URL>/registros_peso.json" -o backups/antes-de-limpiar.json
 */
import { existsSync, readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const archivoEnv = [".env.local", ".env"].find((f) => existsSync(f));
if (!archivoEnv) {
  console.error("No encuentro .env.local ni .env.");
  process.exit(1);
}

for (const linea of readFileSync(archivoEnv, "utf8").split("\n")) {
  const limpia = linea.trim();
  if (!limpia || limpia.startsWith("#")) continue;
  const i = limpia.indexOf("=");
  if (i === -1) continue;
  const clave = limpia.slice(0, i).trim();
  let valor = limpia.slice(i + 1).trim();
  if (
    (valor.startsWith('"') && valor.endsWith('"')) ||
    (valor.startsWith("'") && valor.endsWith("'"))
  ) {
    valor = valor.slice(1, -1);
  }
  process.env[clave] ??= valor;
}

const aplicar = process.argv.includes("--aplicar");

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
});

const db = getDatabase();
const snapshot = await db.ref("registros_peso").get();

if (!snapshot.exists()) {
  console.log("No hay nada.");
  process.exit(0);
}

// Un nodo es "antiguo" si tiene campo `peso` propio; los de usuario son
// contenedores de registros y no lo tienen.
const antiguos = Object.entries(snapshot.val())
  .filter(([, v]) => v && typeof v === "object" && v.peso)
  .map(([id]) => id);

console.log(`Registros antiguos encontrados: ${antiguos.length}`);

if (antiguos.length === 0) {
  console.log("Nada que limpiar.");
  process.exit(0);
}

if (!aplicar) {
  console.log(antiguos.slice(0, 5).map((id) => `  ${id}`).join("\n"));
  console.log("\nSimulación. Añade --aplicar para borrar.");
  process.exit(0);
}

const borrado = Object.fromEntries(antiguos.map((id) => [id, null]));
await db.ref("registros_peso").update(borrado);
console.log(`✓ ${antiguos.length} registros antiguos borrados.`);
process.exit(0);
