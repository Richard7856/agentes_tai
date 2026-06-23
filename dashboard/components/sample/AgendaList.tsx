import { REUNIONES } from "@/lib/sampleData";

// Próximas reuniones con su ficha preparada (datos de muestra).
export default function AgendaList() {
  return (
    <div className="space-y-3">
      {REUNIONES.map((r) => (
        <div
          key={r.titulo}
          className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{r.titulo}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {r.fecha} · {r.lugar}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              <span className="text-slate-400">Objetivo:</span> {r.objetivo}
            </p>
          </div>
          {r.fichaLista ? (
            <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              ✓ Ficha lista
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              Preparando…
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
