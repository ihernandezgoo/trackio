import type { Meta, Registro } from "@/lib/registros";

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

export type ProgresoMeta = {
  actual: number;
  objetivo: number;
  pesoInicial: number;
  /** Kilos que faltan (siempre positivo). 0 si ya se alcanzó. */
  restante: number;
  /** 0-100, acotado: el avance recorrido desde el peso inicial hacia la meta. */
  porcentaje: number;
  alcanzada: boolean;
  /** Si la meta es bajar de peso. Determina el signo del ritmo "bueno". */
  bajando: boolean;
  /** Kg por semana según la tendencia reciente. Negativo = bajando. */
  ritmoSemanal: number | null;
  /** Semanas estimadas al ritmo actual, si este acerca a la meta. */
  semanasEstimadas: number | null;
};

/**
 * Ritmo de cambio en kg/semana ajustando una recta por mínimos cuadrados a los
 * pesajes de los últimos `dias`. Una regresión aguanta el ruido diario (agua,
 * comida) mucho mejor que restar el primer y el último pesaje, que dependería
 * de si justo esos dos días fueron atípicos.
 */
export function ritmoSemanal(registros: Registro[], dias = 28): number | null {
  const limite = sumarDias(aMediodia(new Date()), -dias);
  const enVentana = registros.filter((r) => new Date(r.fecha_hora) >= limite);

  // Con menos de 2 días distintos no hay pendiente que estimar.
  const porDia = new Map<string, { x: number; y: number }>();
  for (const r of enVentana) {
    const fecha = new Date(r.fecha_hora);
    const clave = claveDia(fecha);
    // registros viene desc: el primero de cada día es el más reciente.
    if (!porDia.has(clave)) {
      porDia.set(clave, {
        x: aMediodia(fecha).getTime() / 86_400_000,
        y: r.peso.valor,
      });
    }
  }

  const puntos = [...porDia.values()];
  if (puntos.length < 2) return null;

  const n = puntos.length;
  const mediaX = puntos.reduce((s, p) => s + p.x, 0) / n;
  const mediaY = puntos.reduce((s, p) => s + p.y, 0) / n;

  let numerador = 0;
  let denominador = 0;
  for (const p of puntos) {
    numerador += (p.x - mediaX) * (p.y - mediaY);
    denominador += (p.x - mediaX) ** 2;
  }

  // Todos los pesajes el mismo día: sin eje temporal no hay pendiente.
  if (denominador === 0) return null;

  const pendienteDiaria = numerador / denominador;
  return Number((pendienteDiaria * 7).toFixed(2));
}

export function calcularProgresoMeta(
  registros: Registro[],
  meta: Meta | null,
): ProgresoMeta | null {
  if (!meta || registros.length === 0) return null;

  const actual = registros[0].peso.valor;
  const { objetivo, peso_inicial: pesoInicial } = meta;
  const bajando = objetivo < pesoInicial;

  const restanteReal = bajando ? actual - objetivo : objetivo - actual;
  const alcanzada = restanteReal <= 0;

  const recorrido = Math.abs(pesoInicial - objetivo);
  // Con signo: alejarse del objetivo debe dar avance negativo (y acotarse a 0),
  // no contar como progreso por el mero hecho de haberte movido.
  const avanzado = bajando ? pesoInicial - actual : actual - pesoInicial;
  // Si la meta se fijó en el peso ya alcanzado no hay recorrido que medir.
  const porcentaje =
    recorrido === 0
      ? 100
      : Math.max(0, Math.min(100, Math.round((avanzado / recorrido) * 100)));

  const ritmo = ritmoSemanal(registros);

  // Solo proyectamos si el ritmo empuja hacia la meta: con el signo contrario
  // (o parado) la estimación sería negativa o infinita, y mentiría.
  let semanasEstimadas: number | null = null;
  if (!alcanzada && ritmo !== null && ritmo !== 0) {
    const acercandose = bajando ? ritmo < 0 : ritmo > 0;
    if (acercandose) {
      semanasEstimadas = Math.ceil(restanteReal / Math.abs(ritmo));
    }
  }

  return {
    actual,
    objetivo,
    pesoInicial,
    restante: Number(Math.max(0, restanteReal).toFixed(1)),
    porcentaje: alcanzada ? 100 : porcentaje,
    alcanzada,
    bajando,
    ritmoSemanal: ritmo,
    semanasEstimadas,
  };
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
