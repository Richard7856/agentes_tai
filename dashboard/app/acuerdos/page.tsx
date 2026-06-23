import AgentRunner from "@/components/AgentRunner";
import AcuerdosTable from "@/components/sample/AcuerdosTable";

export default function AcuerdosPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Control de Acuerdos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Extrae los acuerdos de un acta o minuta: responsable, compromiso y fecha.
        </p>
      </header>

      <AgentRunner
        slug="control-acuerdos"
        tipo="extraer_acuerdos"
        inputLabel="Texto del acta o minuta"
        payloadKey="texto"
        placeholder="Pega aquí el acta…"
        example="Minuta del 3 de marzo. La Secretaría de Salud, a través de Juan Pérez, se comprometió a entregar el informe de cobertura el 15 de agosto. La Secretaría de Obras dará seguimiento al avance del acueducto."
        buttonLabel="Extraer acuerdos"
      />

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Acuerdos en seguimiento · datos de muestra
        </h2>
        <AcuerdosTable />
      </section>
    </div>
  );
}
