import PeticionForm from "@/components/PeticionForm";

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
    </div>
  );
}
