/**
 * Migra los registros del esquema antiguo (registros_peso/<id>, identificados
 * por un `username` en una cookie) al nuevo (registros_peso/<uid>/<id>), que es
 * lo que hacen cumplible las reglas de database.rules.json.
 *
 * Uso:
 *   node scripts/migrar-a-uid.mjs <email>            # simulación, no escribe
 *   node scripts/migrar-a-uid.mjs <email> --aplicar  # escribe de verdad
 *
 * Requiere las credenciales de administrador en .env.local (ver .env.example).
 * El script NO borra nada: deja los datos antiguos donde están para que puedas
 * verificar el resultado y borrarlos después a mano.
 */
import { existsSync, readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

// Carga el primer archivo de entorno que exista, sin dependencias externas.
const archivoEnv = [".env.local", ".env"].find((f) => existsSync(f));
if (!archivoEnv) {
  console.error("No encuentro .env.local ni .env. Copia .env.example y rellénalo.");
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

const email = process.argv[2];
const aplicar = process.argv.includes("--aplicar");

if (!email) {
  console.error("Falta el email. Uso: node scripts/migrar-a-uid.mjs <email> [--aplicar]");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
});

const { uid } = await getAuth().getUserByEmail(email);
console.log(`Usuario: ${email} -> uid ${uid}`);

const db = getDatabase();
const snapshot = await db.ref("registros_peso").get();

if (!snapshot.exists()) {
  console.log("No hay nada que migrar.");
  process.exit(0);
}

const migrados = {};
let omitidos = 0;

for (const [id, valor] of Object.entries(snapshot.val())) {
  // Los registros ya migrados cuelgan de un uid: son objetos de objetos, sin
  // campo `peso` propio. Los saltamos para que el script sea reejecutable.
  if (!valor || typeof valor !== "object" || !valor.peso) {
    omitidos += 1;
    continue;
  }

  const limpio = {
    peso: { valor: valor.peso.valor, unidad: "kg" },
    fecha_hora: valor.fecha_hora,
    condicion: {
      en_ayunas: valor.condicion?.en_ayunas ?? false,
      momento_dia: valor.condicion?.momento_dia ?? "mañana",
    },
    dispositivo: "manual",
    creado_en: valor.creado_en ?? valor.fecha_hora,
    actualizado_en: valor.actualizado_en ?? valor.fecha_hora,
  };
  // `nota` solo si existe: las reglas rechazan null en un campo validado.
  if (valor.nota) limpio.nota = String(valor.nota).slice(0, 280);

  migrados[id] = limpio;
}

const total = Object.keys(migrados).length;
console.log(`Registros a migrar: ${total}${omitidos ? ` (omitidos: ${omitidos})` : ""}`);

if (!aplicar) {
  const muestra = Object.entries(migrados).slice(0, 3);
  for (const [id, r] of muestra) console.log(`  ${id}  ${r.peso.valor} kg  ${r.fecha_hora}`);
  console.log("\nSimulación. Vuelve a ejecutarlo con --aplicar para escribir.");
  process.exit(0);
}

await db.ref(`registros_peso/${uid}`).update(migrados);
console.log(`✓ ${total} registros escritos en registros_peso/${uid}`);
console.log("Los datos antiguos siguen ahí. Bórralos a mano cuando lo verifiques.");
process.exit(0);
