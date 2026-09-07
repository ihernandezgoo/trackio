export const PESO_MINIMO = 20;
export const PESO_MAXIMO = 500;
export const NOTA_MAX_LONGITUD = 280;

export type MomentoDia = "mañana" | "tarde" | "noche";

export type Registro = {
  id: string;
  peso: {
    valor: number;
    unidad: "kg";
  };
  fecha_hora: string;
  nota?: string;
  condicion: {
    en_ayunas: boolean;
    momento_dia: MomentoDia;
  };
  dispositivo: "manual";
  creado_en: string;
  actualizado_en: string;
};

/** Resultado de una Server Action: el error viaja como estado, no como excepción. */
export type EstadoAccion = { ok: boolean; error?: string };

/**
 * Meta de peso del usuario. `peso_inicial` se congela al fijar la meta: sin él
 * el progreso no tendría origen desde el que medir, y usar el primer registro
 * histórico daría un porcentaje distinto cada vez que se cambia el objetivo.
 */
export type Meta = {
  objetivo: number;
  peso_inicial: number;
  creado_en: string;
};
