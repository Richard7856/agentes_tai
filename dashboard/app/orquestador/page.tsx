import { getAgents } from "@/lib/api";

// Pantalla para presentar al Orquestador: explica su rol y muestra, en vivo,
// los agentes que coordina (descubiertos por registro dinámico).
export default async function OrquestadorPage() {
  const agents = await getAgents();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Orquestador Ejecutivo de IA</h1>
        <p className="mt-1 text-sm text-slate-500">
          El cerebro coordinador: recibe cada solicitud del tablero y la enruta
          al agente especializado correcto.
        </p>
      </header>

      {/* Flujo visual: Tablero → Orquestador → Agentes */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
          Tablero ejecutivo
        </div>
        <div className="text-slate-400">▼</div>
        <div className="rounded-xl bg-indigo-600 px-6 py-3 text-center text-white shadow">
          <p className="font-semibold">Orquestador</p>
          <p className="text-xs text-indigo-200">
            descubre {agents.length} agente(s) · reparte el trabajo · consolida
          </p>
        </div>
        <div className="text-slate-400">▼</div>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Agentes que coordina
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {agents
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
          .map((agent) => (
            <div
              key={agent.slug}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">{agent.nombre}</h3>
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="activo" />
              </div>
              <p className="mt-2 text-xs text-slate-500">Sabe hacer:</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {agent.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>

      <p className="mt-8 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        💡 Diseñado para 10 agentes. Sumar uno nuevo (5 → 10) no requiere
        reprogramar el orquestador: el agente se <b>registra solo</b> al
        arrancar y el orquestador lo descubre.
      </p>
    </div>
  );
}
