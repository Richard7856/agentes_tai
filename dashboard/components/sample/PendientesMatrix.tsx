import { MATRIZ } from "@/lib/sampleData";

const CUADRANTES = [
  { key: "hacer", title: "HACER", sub: "urgente + importante", color: "border-red-200 bg-red-50", dot: "bg-red-500" },
  { key: "planear", title: "PLANEAR", sub: "importante, no urgente", color: "border-indigo-200 bg-indigo-50", dot: "bg-indigo-500" },
  { key: "delegar", title: "DELEGAR", sub: "urgente, no importante", color: "border-amber-200 bg-amber-50", dot: "bg-amber-500" },
  { key: "eliminar", title: "ELIMINAR", sub: "ni urgente ni importante", color: "border-slate-200 bg-slate-50", dot: "bg-slate-400" },
] as const;

// Matriz de Eisenhower con pendientes ya clasificados (datos de muestra).
export default function PendientesMatrix() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {CUADRANTES.map((q) => (
        <div key={q.key} className={`rounded-xl border p-4 ${q.color}`}>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${q.dot}`} />
            <h3 className="text-sm font-semibold text-slate-800">{q.title}</h3>
            <span className="text-xs text-slate-500">· {q.sub}</span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {MATRIZ[q.key].map((item) => (
              <li key={item} className="rounded-md bg-white/70 px-3 py-1.5 text-sm text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
