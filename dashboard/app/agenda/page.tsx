import AgentRunner from "@/components/AgentRunner";

export default function AgendaPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Agenda y Reuniones</h1>
        <p className="mt-1 text-sm text-slate-500">
          Genera una ficha previa con objetivo, participantes, antecedentes,
          temas sensibles y posibles acuerdos.
        </p>
      </header>
      <AgentRunner
        slug="agenda-reuniones"
        tipo="preparar_ficha"
        inputLabel="Tema de la reunión"
        payloadKey="tema"
        placeholder="Ej. reunión con alcaldes sobre seguridad"
        example="Reunión con alcaldes sobre seguridad y la obra hídrica del acueducto"
        buttonLabel="Preparar ficha"
      />
    </div>
  );
}
