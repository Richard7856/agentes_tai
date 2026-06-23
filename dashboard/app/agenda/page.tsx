import AgendaRunner from "@/components/runners/AgendaRunner";
import AgendaList from "@/components/sample/AgendaList";

export default function AgendaPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Agenda y Reuniones</h1>
        <p className="mt-1 text-sm text-slate-500">
          Genera una ficha previa estructurada: objetivo, participantes,
          antecedentes, temas sensibles, riesgos, orden del día y posibles acuerdos.
        </p>
      </header>

      <AgendaRunner />

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Próximas reuniones · datos de muestra
        </h2>
        <AgendaList />
      </section>
    </div>
  );
}
