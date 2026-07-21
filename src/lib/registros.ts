export type Registro = {
  id: string;
  usuario_id: string;
  username: string;
  peso: {
    valor: number;
    unidad: "kg";
  };
  fecha_hora: string;
  nota?: string;
  condicion: {
    en_ayunas: boolean;
    momento_dia: "mañana" | "tarde" | "noche";
  };
  dispositivo: "manual";
  creado_en: string;
  actualizado_en: string;
};
