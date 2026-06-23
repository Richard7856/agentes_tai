import AgentRunner from "@/components/AgentRunner";

export default function PendientesPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pendientes y Prioridades</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ubica un pendiente en la matriz urgencia/importancia (Eisenhower):
          hacer, planear, delegar o eliminar.
        </p>
      </header>
      <AgentRunner
        slug="pendientes-prioridades"
        tipo="priorizar"
        inputLabel="Describe el pendiente"
        payloadKey="texto"
        placeholder="Ej. atender una emergencia que exige decisión inmediata"
        example="Atender ahora mismo una emergencia sanitaria que exige decisión inmediata de la Gobernadora"
        buttonLabel="Priorizar"
      />
    </div>
  );
}
