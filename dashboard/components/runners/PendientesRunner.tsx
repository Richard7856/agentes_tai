"use client";

import RunnerShell from "@/components/RunnerShell";

interface Evaluacion {
  cuadrante?: string;
  urgencia?: number;
  importancia?: number;
  justificacion?: string;
  accion_recomendada?: string;
  responsable_sugerido?: string;
}

const CUADRANTE: Record<string, { label: string; color: string }> = {
  hacer: { label: "HACER (urgente + importante)", color: "bg-red-100 text-red-700" },
  planear: { label: "PLANEAR (importante)", color: "bg-indigo-100 text-indigo-700" },
  delegar: { label: "DELEGAR (urgente)", color: "bg-amber-100 text-amber-700" },
  eliminar: { label: "ELIMINAR (ni urgente ni importante)", color: "bg-slate-100 text-slate-600" },
};

function Barra({ label, n }: { label: string; n?: number }) {
  const v = Math.max(0, Math.min(5, n ?? 0));
  return (
    <div>
      <p className="text-xs text-slate-500">
        {label}: <b>{v}/5</b>
      </p>
      <div className="mt-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={"h-2 w-full rounded " + (i <= v ? "bg-indigo-500" : "bg-slate-200")}
          />
        ))}
      </div>
    </div>
  );
}

export default function PendientesRunner() {
  return (
    <RunnerShell
      slug="pendientes-prioridades"
      tipo="priorizar"
      payloadKey="texto"
      inputLabel="Describe el pendiente"
      placeholder="Ej. atender una emergencia que exige decisión inmediata"
      example="Firmar hoy el convenio con la federación que vence en 2 horas y es prioridad de la Gobernadora"
      buttonLabel="Priorizar"
      renderResult={(d) => {
        const e = (d.evaluacion ?? {}) as Evaluacion;
        const c = CUADRANTE[(e.cuadrante ?? "").toLowerCase()] ?? {
          label: e.cuadrante ?? "—",
          color: "bg-slate-100 text-slate-600",
        };
        return (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cuadrante</p>
              <span className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${c.color}`}>
                {c.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Barra label="Urgencia" n={e.urgencia} />
              <Barra label="Importancia" n={e.importancia} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Justificación</p>
              <p className="mt-1 text-sm text-slate-700">{e.justificacion ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Acción recomendada</p>
              <p className="mt-1 text-sm text-slate-700">{e.accion_recomendada ?? "—"}</p>
            </div>
            {e.responsable_sugerido && (
              <p className="text-sm text-slate-500">
                Responsable sugerido: <b className="text-slate-800">{e.responsable_sugerido}</b>
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
