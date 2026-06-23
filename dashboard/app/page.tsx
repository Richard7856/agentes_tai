import Link from "next/link";
import AgentCard from "@/components/AgentCard";
import { getAgents } from "@/lib/api";

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
