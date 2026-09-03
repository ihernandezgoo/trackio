import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calcularCambio,
  calcularRachaActual,
  generarHeatmap,
  porcentajeDiasDelMes,
  posicionEnRango,
  ultimos7Dias,
} from "../stats.ts";
import type { Registro } from "../registros.ts";

/** Construye un registro a N días de hoy (0 = hoy). */
function reg(diasAtras: number, valor: number, nota?: string): Registro {
  const fecha = new Date();
  fecha.setHours(12, 0, 0, 0);
  fecha.setDate(fecha.getDate() - diasAtras);
  const iso = fecha.toISOString();
  return {
    id: `r${diasAtras}`,
    peso: { valor, unidad: "kg" },
    fecha_hora: iso,
    ...(nota ? { nota } : {}),
    condicion: { en_ayunas: false, momento_dia: "mañana" },
    dispositivo: "manual",
    creado_en: iso,
    actualizado_en: iso,
  };
}

/** La lista siempre llega ordenada de más reciente a más antiguo. */
function lista(...rs: Registro[]): Registro[] {
  return [...rs].sort((a, b) => b.fecha_hora.localeCompare(a.fecha_hora));
}

test("racha: cuenta días consecutivos incluyendo hoy", () => {
  assert.equal(calcularRachaActual(lista(reg(0, 80), reg(1, 81), reg(2, 82))), 3);
});

test("racha: NO se pierde si hoy aún no te has pesado", () => {
  // Este era el bug: devolvía 0 en cuanto pasaba la medianoche.
  assert.equal(calcularRachaActual(lista(reg(1, 81), reg(2, 82), reg(3, 83))), 3);
});

test("racha: se rompe si faltan dos días seguidos", () => {
  assert.equal(calcularRachaActual(lista(reg(2, 82), reg(3, 83))), 0);
});

test("racha: sin registros es 0", () => {
  assert.equal(calcularRachaActual([]), 0);
});

test("racha: ignora huecos intermedios", () => {
  assert.equal(calcularRachaActual(lista(reg(0, 80), reg(1, 81), reg(5, 85))), 2);
});

test("cambio: usa el registro más cercano al límite", () => {
  const c = calcularCambio(lista(reg(0, 80), reg(8, 82), reg(200, 95)), 7);
  assert.equal(c.actual, 80);
  assert.equal(c.anterior, 82);
  assert.equal(c.diferencia, -2);
});

test("cambio: sin referencia anterior devuelve null", () => {
  const c = calcularCambio(lista(reg(0, 80)), 7);
  assert.equal(c.diferencia, null);
});

test("cambio: lista vacía no rompe", () => {
  assert.deepEqual(calcularCambio([], 7), { actual: null, anterior: null, diferencia: null });
});

test("ultimos7Dias: siempre devuelve 7 días y coloca el peso del día", () => {
  const dias = ultimos7Dias(lista(reg(0, 80), reg(3, 83)));
  assert.equal(dias.length, 7);
  assert.equal(dias[6].peso, 80); // hoy es el último
  assert.equal(dias[3].peso, 83);
  assert.equal(dias[5].peso, null);
});

test("ultimos7Dias: con dos pesajes el mismo día toma el más reciente", () => {
  // Dos horas fijas del mismo día, para no depender de cuándo se ejecute el test.
  const base = new Date();
  const aLas = (hora: number) => {
    const d = new Date(base);
    d.setHours(hora, 0, 0, 0);
    return d.toISOString();
  };
  const temprano = { ...reg(0, 79), id: "temprano", fecha_hora: aLas(7) };
  const tarde = { ...reg(0, 81), id: "tarde", fecha_hora: aLas(21) };
  const dias = ultimos7Dias(lista(temprano, tarde));
  assert.equal(dias[6].peso, 81);
});

test("porcentajeDiasDelMes: ignora registros de meses anteriores", () => {
  const hoy = new Date();
  const haceUnAnio = new Date(hoy);
  haceUnAnio.setFullYear(hoy.getFullYear() - 1);
  haceUnAnio.setHours(12, 0, 0, 0);

  const antiguo: Registro = { ...reg(0, 90), id: "viejo", fecha_hora: haceUnAnio.toISOString() };
  const pct = porcentajeDiasDelMes(lista(reg(0, 80), antiguo));
  assert.equal(pct, Math.round((1 / hoy.getDate()) * 100));
});

test("porcentajeDiasDelMes: sin registros es 0", () => {
  assert.equal(porcentajeDiasDelMes([]), 0);
});

test("posicionEnRango: sitúa el peso actual entre el mínimo y el máximo", () => {
  // actual 80, rango 78–82 -> (80-78)/(82-78) = 50%
  assert.equal(posicionEnRango(lista(reg(0, 80), reg(5, 78), reg(10, 82)), 30), 50);
});

test("posicionEnRango: null cuando no hay rango que medir", () => {
  assert.equal(posicionEnRango([], 30), null, "sin registros");
  assert.equal(posicionEnRango(lista(reg(0, 80)), 30), null, "un solo pesaje");
  assert.equal(posicionEnRango(lista(reg(0, 80), reg(3, 80)), 30), null, "todos iguales");
});

test("posicionEnRango: ignora registros fuera de la ventana", () => {
  // El de hace 100 días no cuenta: el rango real es 80–82.
  assert.equal(posicionEnRango(lista(reg(0, 80), reg(5, 82), reg(100, 50)), 30), 0);
});

test("heatmap: devuelve semanas completas y marca los días con registro", () => {
  const dias = generarHeatmap(lista(reg(0, 80)));
  assert.equal(dias.length % 7, 0, "debe cubrir semanas enteras");
  assert.equal(dias.filter((d) => d.completado).length, 1);
  // Sin fechas duplicadas ni saltos (comprobación anti-DST).
  assert.equal(new Set(dias.map((d) => d.fecha)).size, dias.length);
});
