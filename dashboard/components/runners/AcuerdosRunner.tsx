"use client";

import RunnerShell from "@/components/RunnerShell";

interface Acuerdo {
  responsable?: string;
  compromiso?: string;
  fecha?: string | null;
  dependencia?: string | null;
  semaforo?: string;
}
interface Extraccion {
  acuerdos?: Acuerdo[];
}

const SEM: Record<string, string> = {
  verde: "bg-emerald-500",
  amarillo: "bg-amber-500",
  rojo: "bg-red-500",
};

export default function AcuerdosRunner() {
  return (
    <RunnerShell
      slug="control-acuerdos"
      tipo="extraer_acuerdos"
      payloadKey="texto"
      inputLabel="Texto del acta o minuta"
      placeholder="Pega aquí el acta…"
      example="Minuta del 3 de marzo. La Secretaría de Salud, a través de Juan Pérez, se comprometió a entregar el informe de cobertura el 15 de agosto. La Secretaría de Obras, con Laura Díaz, dará seguimiento al avance del acueducto antes del 30 de junio."
      buttonLabel="Extraer acuerdos"
      usaRag
      renderResult={(d) => {
        const ex = (d.extraccion ?? {}) as Extraccion;
        const acuerdos = ex.acuerdos ?? [];
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Acuerdos extraídos ({acuerdos.length})
            </h3>
            {acuerdos.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-400 shadow-sm">
                No se detectaron acuerdos.
              </p>
            ) : (
              acuerdos.map((a, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        "mt-1 inline-block h-3 w-3 shrink-0 rounded-full " +
                        (SEM[(a.semaforo ?? "").toLowerCase()] ?? "bg-slate-300")
                      }
                      title={a.semaforo}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{a.compromiso ?? "—"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Responsable: <b className="text-slate-700">{a.responsable ?? "—"}</b>
                        {a.dependencia ? ` · ${a.dependencia}` : ""}
                      </p>
                      {a.fecha ? (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Plazo: <span className="font-mono">{a.fecha}</span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      }}
    />
  );
}
