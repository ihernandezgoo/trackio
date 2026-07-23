import type { Registro } from "@/lib/registros";

export type Cambio = {
  actual: number | null;
  anterior: number | null;
  diferencia: number | null;
};

function pesoEnFecha(registros: Registro[], antesDe: Date): number | null {
  const previos = registros.filter((r) => new Date(r.fecha_hora) <= antesDe);
  if (previos.length === 0) return null;
  return previos[0].peso.valor;
}

export function calcularCambio(registros: Registro[], dias: number): Cambio {
  if (registros.length === 0) return { actual: null, anterior: null, diferencia: null };

  const actual = registros[0].peso.valor;
  const limite = new Date();
  limite.setDate(limite.getDate() - dias);

  const anterior = pesoEnFecha(registros, limite);

  return {
    actual,
    anterior,
    diferencia: anterior === null ? null : Number((actual - anterior).toFixed(1)),
  };
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

export function diasConRegistro(registros: Registro[]): Set<string> {
  return new Set(registros.map((r) => claveDia(new Date(r.fecha_hora))));
}

export function calcularRachaActual(registros: Registro[]): number {
  const dias = diasConRegistro(registros);
  let racha = 0;
  const cursor = new Date();

  while (dias.has(claveDia(cursor))) {
    racha += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return racha;
}

export type DiaResumen = {
  fecha: string;
  etiqueta: string;
  peso: number | null;
};

export function ultimos7Dias(registros: Registro[]): DiaResumen[] {
  const porDia = new Map<string, number>();
  for (const r of registros) {
    const clave = claveDia(new Date(r.fecha_hora));
    if (!porDia.has(clave)) porDia.set(clave, r.peso.valor);
  }

  const etiquetas = ["D", "L", "M", "X", "J", "V", "S"];
  const resultado: DiaResumen[] = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    const clave = claveDia(fecha);
    resultado.push({
      fecha: clave,
      etiqueta: etiquetas[fecha.getDay()],
      peso: porDia.get(clave) ?? null,
    });
  }

  return resultado;
}

export function porcentajeDiasDelMes(registros: Registro[]): number {
  const dias = diasConRegistro(registros);
  const hoy = new Date();
  const diaDelMes = hoy.getDate();

  let contador = 0;
  for (let d = 1; d <= diaDelMes; d++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), d);
    if (dias.has(claveDia(fecha))) contador += 1;
  }

  return Math.round((contador / diaDelMes) * 100);
}

export type DiaHeatmap = {
  fecha: string;
  completado: boolean;
};

export function generarHeatmap(registros: Registro[]): DiaHeatmap[] {
  const dias = diasConRegistro(registros);
  const hoy = new Date();

  // Ventana de 3 meses: los dos anteriores más el actual.
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1);
  inicioMes.setDate(inicioMes.getDate() - inicioMes.getDay());

  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  finMes.setDate(finMes.getDate() + (6 - finMes.getDay()));
  finMes.setHours(0, 0, 0, 0);

  const resultado: DiaHeatmap[] = [];
  const cursor = new Date(inicioMes);

  while (cursor <= finMes) {
    resultado.push({
      fecha: claveDia(cursor),
      completado: dias.has(claveDia(cursor)),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return resultado;
}
