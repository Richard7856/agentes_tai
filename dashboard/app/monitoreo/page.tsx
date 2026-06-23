import MonitorView from "@/components/MonitorView";

export default function MonitoreoPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Monitoreo del Orquestador</h1>
        <p className="mt-1 text-sm text-slate-500">
          El orquestador vigila la salud de cada agente, reparte las tareas y
          deja bitácora de cada delegación. Esta vista se actualiza en vivo.
        </p>
      </header>
      <MonitorView />
    </div>
  );
}
