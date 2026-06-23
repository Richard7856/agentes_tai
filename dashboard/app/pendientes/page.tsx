import PendientesRunner from "@/components/runners/PendientesRunner";
import PendientesMatrix from "@/components/sample/PendientesMatrix";

export default function PendientesPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pendientes y Prioridades</h1>
        <p className="mt-1 text-sm text-slate-500">
          Evalúa un pendiente en la matriz urgencia/importancia con calificación,
          justificación y acción recomendada.
        </p>
      </header>

      <PendientesRunner />

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Matriz del despacho · datos de muestra
        </h2>
        <PendientesMatrix />
      </section>
    </div>
  );
}
