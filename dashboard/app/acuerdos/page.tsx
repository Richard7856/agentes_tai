import AcuerdosRunner from "@/components/runners/AcuerdosRunner";
import AcuerdosTable from "@/components/sample/AcuerdosTable";

export default function AcuerdosPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Control de Acuerdos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Extrae los acuerdos de un acta: responsable, compromiso, plazo y
          semáforo de vencimiento.
        </p>
      </header>

      <AcuerdosRunner />

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Acuerdos en seguimiento · datos de muestra
        </h2>
        <AcuerdosTable />
      </section>
    </div>
  );
}
