import { ACUERDOS } from "@/lib/sampleData";

const SEM: Record<string, string> = {
  verde: "bg-emerald-500",
  amarillo: "bg-amber-500",
  rojo: "bg-red-500",
};
const EST: Record<string, string> = {
  vigente: "bg-emerald-100 text-emerald-700",
  "por vencer": "bg-amber-100 text-amber-700",
  vencido: "bg-red-100 text-red-700",
  cumplido: "bg-slate-100 text-slate-600",
};

// Acuerdos en seguimiento con semáforo de vencimiento (datos de muestra).
export default function AcuerdosTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-2">Semáforo</th>
            <th className="px-4 py-2">Acuerdo</th>
            <th className="px-4 py-2">Responsable</th>
            <th className="px-4 py-2">Dependencia</th>
            <th className="px-4 py-2">Plazo</th>
            <th className="px-4 py-2">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {ACUERDOS.map((a) => (
            <tr key={a.descripcion} className="hover:bg-slate-50">
              <td className="px-4 py-2">
                <span className={`inline-block h-3 w-3 rounded-full ${SEM[a.semaforo]}`} title={a.semaforo} />
              </td>
              <td className="px-4 py-2 text-slate-900">{a.descripcion}</td>
              <td className="px-4 py-2 text-slate-600">{a.responsable}</td>
              <td className="px-4 py-2 text-slate-600">{a.dependencia}</td>
              <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-slate-500">{a.plazo}</td>
              <td className="px-4 py-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${EST[a.estado]}`}>{a.estado}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
