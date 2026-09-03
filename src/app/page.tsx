import type { Metadata } from "next";
import { getRegistros } from "@/lib/actions";
import {
  calcularCambio,
  calcularRachaActual,
  porcentajeDiasDelMes,
  posicionEnRango,
} from "@/lib/stats";
import AnilloProgreso from "@/components/AnilloProgreso";
import MiniAnillo from "@/components/MiniAnillo";
import ModalRegistrarPeso from "@/components/ModalRegistrarPeso";
import BotonTema from "@/components/BotonTema";

export const metadata: Metadata = {
  title: "Trackio · Registro de peso",
};

// Los registros se leen en cada petición: sin esto la página se prerenderizaría
// en el build y mostraría el peso congelado de ese momento.
export const dynamic = "force-dynamic";

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

/** Meta implícita: pesarse todos los días de la semana. */
const OBJETIVO_RACHA = 7;

export default async function Home() {
  const registros = await getRegistros();

  const ultimoPeso = registros[0]?.peso.valor ?? null;
  const racha = calcularRachaActual(registros);
  const cambioSemanal = calcularCambio(registros, 7);
  const porcentajeMes = porcentajeDiasDelMes(registros);

  // El anillo grande sitúa tu peso actual dentro de tu rango de los últimos 30
  // días: vacío = tu mínimo del mes, lleno = tu máximo.
  const progresoPeso = posicionEnRango(registros, 30);

  return (
    <main className="flex w-full flex-col gap-8 px-5 pt-8 pb-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            {DIAS_SEMANA[new Date().getDay()]}
          </p>
          <h1 className="mt-1 text-[1.75rem] font-semibold leading-tight tracking-tight">
            Tu peso
          </h1>
        </div>
        <BotonTema />
      </header>

      <div className="flex flex-col items-center gap-6">
        <AnilloProgreso
          valor={ultimoPeso}
          unidad="kg"
          etiqueta="Último peso"
          progreso={progresoPeso}
        />

        <div className="flex w-full gap-2.5">
          <MiniAnillo
            porcentaje={(racha / OBJETIVO_RACHA) * 100}
            valorTexto={`${racha}`}
            etiqueta={racha === 1 ? "Día de racha" : "Días de racha"}
            color="verde"
          />
          <MiniAnillo
            porcentaje={porcentajeMes}
            valorTexto={`${porcentajeMes}%`}
            etiqueta="Días este mes"
            color="ambar"
          />
          <MiniAnillo
            porcentaje={cambioSemanal.diferencia === null ? 0 : 100}
            valorTexto={
              cambioSemanal.diferencia === null
                ? "—"
                : `${cambioSemanal.diferencia > 0 ? "+" : ""}${cambioSemanal.diferencia}`
            }
            etiqueta="Cambio semanal"
            color="azul"
          />
        </div>
      </div>

      <ModalRegistrarPeso ultimoPeso={ultimoPeso} />
    </main>
  );
}
