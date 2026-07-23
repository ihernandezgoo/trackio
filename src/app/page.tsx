import { getRegistros } from "@/lib/actions";
import { calcularCambio, calcularRachaActual, porcentajeDiasDelMes } from "@/lib/stats";
import AnilloProgreso from "@/components/AnilloProgreso";
import MiniAnillo from "@/components/MiniAnillo";
import ModalRegistrarPeso from "@/components/ModalRegistrarPeso";
import CambiarUsuario from "@/components/CambiarUsuario";
import BotonTema from "@/components/BotonTema";
import { getUsername } from "@/lib/usuario";

function nombreDelDia() {
  const dias = [
    "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
  ];
  return dias[new Date().getDay()];
}

export default async function Home() {
  const [registros, nombreUsuario] = await Promise.all([getRegistros(), getUsername()]);
  const ultimoPeso = registros[0]?.peso.valor ?? null;

  const racha = calcularRachaActual(registros);
  const cambioSemanal = calcularCambio(registros, 7);
  const porcentajeMes = porcentajeDiasDelMes(registros);

  return (
    <main className="flex w-full flex-col gap-8 px-5 pt-8 pb-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            {nombreDelDia()}
          </p>
          <h1 className="mt-1 text-[1.75rem] font-semibold leading-tight tracking-tight">
            Tu peso
          </h1>
          <CambiarUsuario username={nombreUsuario} />
        </div>
        <BotonTema />
      </header>

      <div className="flex flex-col items-center gap-6">
        <AnilloProgreso valor={ultimoPeso} unidad="kg" etiqueta="Último peso" />

        <div className="flex w-full gap-2.5">
          <MiniAnillo
            porcentaje={Math.min(100, racha * 10)}
            valorTexto={`${racha}`}
            etiqueta="Racha"
            color="verde"
          />
          <MiniAnillo
            porcentaje={porcentajeMes}
            valorTexto={`${porcentajeMes}%`}
            etiqueta="Este mes"
            color="ambar"
          />
          <MiniAnillo
            porcentaje={cambioSemanal.diferencia === null ? 0 : Math.min(100, Math.abs(cambioSemanal.diferencia) * 20)}
            valorTexto={
              cambioSemanal.diferencia === null
                ? "—"
                : `${cambioSemanal.diferencia > 0 ? "+" : ""}${cambioSemanal.diferencia}`
            }
            etiqueta="Semana"
            color="azul"
          />
        </div>
      </div>

      <ModalRegistrarPeso ultimoPeso={ultimoPeso} />
    </main>
  );
}
