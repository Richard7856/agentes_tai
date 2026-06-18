import type { AgentInfo } from "@/lib/api";

// Tarjeta de un agente vivo en el resumen ejecutivo.
export default function AgentCard({ agent }: { agent: AgentInfo }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-slate-900">{agent.nombre}</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          activo
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">{agent.descripcion}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {agent.capabilities.map((cap) => (
          <span
            key={cap}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
          >
            {cap}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Fase {agent.fase} · {agent.slug}
      </p>
    </div>
  );
}
