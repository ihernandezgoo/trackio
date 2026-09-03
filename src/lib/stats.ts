import type { Registro } from "@/lib/registros";

export type Cambio = {
  actual: number | null;
  anterior: number | null;
  diferencia: number | null;
};

/**
 * Trabajamos las fechas a mediodía: sumar o restar días desde medianoche puede
 * caer en el mismo día (o saltarse uno) en los cambios de horario de verano.
 */
function aMediodia(fecha: Date): Date {
  const copia = new Date(fecha);
  copia.setHours(12, 0, 0, 0);
  return copia;
}

function sumarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

function claveDia(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function diaClaveHoy(): string {
  return claveDia(new Date());
}

/** `registros` llega ordenado de más reciente a más antiguo. */
function pesoEnFecha(registros: Registro[], antesDe: Date): number | null {
  const previo = registros.find((r) => new Date(r.fecha_hora) <= antesDe);
  return previo ? previo.peso.valor : null;
}

export function calcularCambio(registros: Registro[], dias: number): Cambio {
  if (registros.length === 0) return { actual: null, anterior: null, diferencia: null };

  const actual = registros[0].peso.valor;
  const limite = sumarDias(aMediodia(new Date()), -dias);
  const anterior = pesoEnFecha(registros, limite);

  return {
    actual,
    anterior,
    diferencia: anterior === null ? null : Number((actual - anterior).toFixed(1)),
  };
}

/**
 * Sitúa el peso actual dentro del rango de los últimos `dias` (0 = tu mínimo,
 * 100 = tu máximo). Devuelve null si no hay rango que medir (un solo pesaje o
 * todos iguales), para no dibujar un progreso inventado.
 */
export function posicionEnRango(registros: Registro[], dias: number): number | null {
  if (registros.length === 0) return null;

  const limite = sumarDias(aMediodia(new Date()), -dias);
  const enVentana = registros.filter((r) => new Date(r.fecha_hora) >= limite);
  if (enVentana.length < 2) return null;

  const pesos = enVentana.map((r) => r.peso.valor);
  const min = Math.min(...pesos);
  const max = Math.max(...pesos);
  if (max === min) return null;

  const actual = registros[0].peso.valor;
  return Math.round(((actual - min) / (max - min)) * 100);
}

export function diasConRegistro(registros: Registro[]): Set<string> {
  return new Set(registros.map((r) => claveDia(new Date(r.fecha_hora))));
}

/**
 * Días consecutivos pesándose. Si hoy todavía no hay registro la racha no se
 * pierde: se cuenta desde ayer, porque el día aún no ha terminado.
 */
export function calcularRachaActual(registros: Registro[]): number {
  const dias = diasConRegistro(registros);
  if (dias.size === 0) return 0;

  let cursor = aMediodia(new Date());
  if (!dias.has(claveDia(cursor))) {
    cursor = sumarDias(cursor, -1);
    if (!dias.has(claveDia(cursor))) return 0;
  }

  let racha = 0;
  while (dias.has(claveDia(cursor))) {
    racha += 1;
    cursor = sumarDias(cursor, -1);
  }

  return racha;
}

export type DiaResumen = {
  fecha: string;
  etiqueta: string;
  peso: number | null;
};

const ETIQUETAS_DIA = ["D", "L", "M", "X", "J", "V", "S"];

export function ultimos7Dias(registros: Registro[]): DiaResumen[] {
  // registros viene ordenado desc, así que el primero de cada día es el más reciente.
  const porDia = new Map<string, number>();
  for (const r of registros) {
    const clave = claveDia(new Date(r.fecha_hora));
    if (!porDia.has(clave)) porDia.set(clave, r.peso.valor);
  }

  const hoy = aMediodia(new Date());
  const resultado: DiaResumen[] = [];

  for (let i = 6; i >= 0; i--) {
    const fecha = sumarDias(hoy, -i);
    const clave = claveDia(fecha);
    resultado.push({
      fecha: clave,
      etiqueta: ETIQUETAS_DIA[fecha.getDay()],
      peso: porDia.get(clave) ?? null,
    });
  }

  return resultado;
}

/** Porcentaje de días del mes en curso (hasta hoy) con al menos un pesaje. */
export function porcentajeDiasDelMes(registros: Registro[]): number {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();
  const diaDelMes = hoy.getDate();

  const diasDelMes = new Set<string>();
  for (const r of registros) {
    const fecha = new Date(r.fecha_hora);
    if (fecha.getFullYear() === anio && fecha.getMonth() === mes) {
      diasDelMes.add(claveDia(fecha));
    }
  }

  return Math.round((diasDelMes.size / diaDelMes) * 100);
}

export type DiaHeatmap = {
  fecha: string;
  completado: boolean;
};

export function generarHeatmap(registros: Registro[]): DiaHeatmap[] {
  const dias = diasConRegistro(registros);
  const hoy = new Date();

  // Ventana de 3 meses: los dos anteriores más el actual, alineada a semanas
  // completas (de domingo a sábado) para que la rejilla cuadre.
  let cursor = aMediodia(new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1));
  cursor = sumarDias(cursor, -cursor.getDay());

  let fin = aMediodia(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0));
  fin = sumarDias(fin, 6 - fin.getDay());

  const resultado: DiaHeatmap[] = [];
  while (cursor <= fin) {
    const clave = claveDia(cursor);
    resultado.push({ fecha: clave, completado: dias.has(clave) });
    cursor = sumarDias(cursor, 1);
  }

  return resultado;
}
