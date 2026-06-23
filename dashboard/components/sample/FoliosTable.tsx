import { FOLIOS } from "@/lib/sampleData";

const URG: Record<string, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-amber-100 text-amber-700",
  baja: "bg-emerald-100 text-emerald-700",
};
const EST: Record<string, string> = {
  recibida: "bg-slate-100 text-slate-600",
  canalizada: "bg-indigo-100 text-indigo-700",
  "en proceso": "bg-amber-100 text-amber-700",
  resuelta: "bg-emerald-100 text-emerald-700",
};

// Tabla de folios ya clasificados (datos de muestra).
export default function FoliosTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2">Folio</th>
            <th className="px-4 py-2">Ciudadano</th>
            <th className="px-4 py-2">Municipio</th>
            <th className="px-4 py-2">Categoría</th>
            <th className="px-4 py-2">Urgencia</th>
            <th className="px-4 py-2">Dependencia</th>
            <th className="px-4 py-2">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {FOLIOS.map((f) => (
            <tr key={f.folio} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-slate-500">{f.folio}</td>
              <td className="px-4 py-2 text-slate-900">{f.ciudadano}</td>
              <td className="px-4 py-2 text-slate-600">{f.municipio}</td>
              <td className="px-4 py-2 text-slate-600">{f.categoria}</td>
              <td className="px-4 py-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${URG[f.urgencia]}`}>{f.urgencia}</span>
              </td>
              <td className="px-4 py-2 text-slate-600">{f.dependencia}</td>
              <td className="px-4 py-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${EST[f.estado]}`}>{f.estado}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
