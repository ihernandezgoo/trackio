/**
 * Comprueba que el servidor puede leer los registros con las reglas cerradas.
 * Replica exactamente lo que hace getRegistros() en src/lib/actions.ts.
 *
 *   node scripts/verificar-lectura.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const archivoEnv = [".env.local", ".env"].find((f) => existsSync(f));
for (const linea of readFileSync(archivoEnv, "utf8").split("\n")) {
  const limpia = linea.trim();
  if (!limpia || limpia.startsWith("#")) continue;
  const i = limpia.indexOf("=");
  if (i === -1) continue;
  let valor = limpia.slice(i + 1).trim();
  if (
    (valor.startsWith('"') && valor.endsWith('"')) ||
    (valor.startsWith("'") && valor.endsWith("'"))
  ) {
    valor = valor.slice(1, -1);
  }
  process.env[limpia.slice(0, i).trim()] ??= valor;
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
});

const uid = process.env.TRACKIO_UID;
if (!uid) {
  console.error("Falta TRACKIO_UID.");
  process.exit(1);
}

// Exactamente la misma consulta que hace getRegistros() en la app. Va primero:
// leer antes la rama padre deja al SDK con datos cacheados que enmascaran el
// resultado real de esta consulta.
const snapshot = await getDatabase()
  .ref(`registros_peso/${uid}`)
  .orderByChild("fecha_hora")
  .get();

if (!snapshot.exists()) {
  console.error("✗ El servidor no ve ningún registro.");
  process.exit(1);
}

// Ojo: en el forEach de Firebase, devolver un valor truthy CANCELA la
// iteración. La flecha debe llevar llaves para que retorne undefined; sin
// ellas, push() devuelve la nueva longitud (>= 1) y solo se lee el primero.
const registros = [];
snapshot.forEach((child) => {
  registros.push({ ...child.val(), id: child.key });
});
registros.reverse();

console.log(`✓ El servidor lee ${registros.length} registros con las reglas cerradas.`);
console.log(`  Más reciente: ${registros[0].peso.valor} kg  (${registros[0].fecha_hora})`);
console.log(`  Más antiguo:  ${registros.at(-1).peso.valor} kg  (${registros.at(-1).fecha_hora})`);

const malformados = registros.filter(
  (r) => typeof r.peso?.valor !== "number" || !r.fecha_hora || !r.condicion?.momento_dia,
);
console.log(
  malformados.length
    ? `✗ ${malformados.length} registros con forma inesperada`
    : "✓ Todos los registros tienen la forma que espera la UI.",
);

process.exit(malformados.length ? 1 : 0);
