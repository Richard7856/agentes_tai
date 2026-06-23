import PeticionForm from "@/components/PeticionForm";
import FoliosTable from "@/components/sample/FoliosTable";

export default function PeticionesPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Peticiones Ciudadanas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Clasifica, folía y sugiere dependencia para una solicitud ciudadana.
        </p>
      </header>

      <PeticionForm />

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Folios recientes · datos de muestra
        </h2>
        <FoliosTable />
      </section>
    </div>
  );
}
