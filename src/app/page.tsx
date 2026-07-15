import { getRegistros } from "@/lib/actions";
import { calcularCambio, calcularRachaActual, porcentajeDiasDelMes } from "@/lib/stats";
import { getUsuarioActual } from "@/lib/session";
import AnilloProgreso from "@/components/AnilloProgreso";
import MiniAnillo from "@/components/MiniAnillo";
import ModalRegistrarPeso from "@/components/ModalRegistrarPeso";

function nombreDelDia() {
  const dias = [
    "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
  ];
  return dias[new Date().getDay()];
}

export default async function Home() {
  const registros = await getRegistros();
  const usuario = await getUsuarioActual();
  const ultimoPeso = registros[0]?.peso.valor ?? null;
  const nombreUsuario = usuario?.email?.split("@")[0] ?? "usuario";

  const racha = calcularRachaActual(registros);
  const cambioSemanal = calcularCambio(registros, 7);
  const porcentajeMes = porcentajeDiasDelMes(registros);

  return (
    <main className="flex w-full flex-col gap-8 px-6 pt-8 pb-6">
      <header>
        <h1 className="text-2xl font-bold">{nombreDelDia()}</h1>
        <p className="text-sm text-[var(--text-secondary)]">Hola, {nombreUsuario}</p>
      </header>

      <div className="flex flex-col items-center gap-6">
        <AnilloProgreso valor={ultimoPeso} unidad="kg" etiqueta="Último peso" />

        <div className="flex gap-6">
          <MiniAnillo
            porcentaje={Math.min(100, racha * 10)}
            valorTexto={`${racha}`}
            etiqueta="Racha (días)"
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
