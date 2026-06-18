import AgentCard from "@/components/AgentCard";
import { getAgents } from "@/lib/api";

// Server Component: descubre los agentes vivos en cada carga (data-driven).
export default async function ResumenPage() {
  const agents = await getAgents();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Resumen ejecutivo</h1>
        <p className="mt-1 text-sm text-slate-500">
          Agentes activos coordinados por el orquestador.
        </p>
      </header>

      {agents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No hay agentes registrados todavía. Verifica que el orquestador y los
          agentes estén levantados (<code>docker compose up</code>).
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
            .map((agent) => (
              <AgentCard key={agent.slug} agent={agent} />
            ))}
        </div>
      )}
    </div>
  );
}
