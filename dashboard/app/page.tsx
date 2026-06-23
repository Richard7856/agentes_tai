import Link from "next/link";
import AgentCard from "@/components/AgentCard";
import { getAgents } from "@/lib/api";
import { FOLIOS, ACUERDOS, REUNIONES, MATRIZ } from "@/lib/sampleData";

// Indicadores de muestra para que el resumen se vea "en operación".
const KPIS = [
  { label: "Folios recientes", value: FOLIOS.length, color: "text-indigo-600" },
  { label: "Acuerdos en seguimiento", value: ACUERDOS.length, color: "text-emerald-600" },
  { label: "Acuerdos vencidos", value: ACUERDOS.filter((a) => a.semaforo === "rojo").length, color: "text-red-600" },
  { label: "Reuniones con ficha", value: REUNIONES.filter((r) => r.fichaLista).length, color: "text-slate-700" },
  { label: "Pendientes 'hacer ya'", value: MATRIZ.hacer.length, color: "text-amber-600" },
];

// slug del agente → ruta de su módulo en el tablero.
const RUTA: Record<string, string> = {
  "agenda-reuniones": "/agenda",
  "peticiones-ciudadanas": "/peticiones",
  "pendientes-prioridades": "/pendientes",
  "control-acuerdos": "/acuerdos",
};

// Server Component: descubre los agentes vivos en cada carga (vía orquestador).
export default async function ResumenPage() {
  const agents = await getAgents();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Resumen ejecutivo</h1>
        <p className="mt-1 text-sm text-slate-500">
          El Orquestador Ejecutivo descubrió y coordina estos agentes. Cada
          solicitud del tablero se enruta por él.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="mt-1 text-xs text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
        🧭 Orquestador activo · <b>{agents.length}</b> agente(s) registrado(s).
        Haz clic en un agente para probarlo.
      </div>

      {agents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No hay agentes registrados todavía. Verifica que el orquestador y los
          agentes estén levantados.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map((agent) => {
              const href = RUTA[agent.slug];
              const card = <AgentCard agent={agent} />;
              return href ? (
                <Link
                  key={agent.slug}
                  href={href}
                  className="block transition hover:-translate-y-0.5"
                >
                  {card}
                </Link>
              ) : (
                <div key={agent.slug}>{card}</div>
              );
            })}
        </div>
      )}
    </div>
  );
}
