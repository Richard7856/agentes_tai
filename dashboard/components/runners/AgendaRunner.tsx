"use client";

import RunnerShell from "@/components/RunnerShell";

interface Participante {
  nombre?: string;
  rol?: string;
}
interface Ficha {
  objetivo?: string;
  participantes?: Participante[];
  antecedentes?: string[];
  temas_sensibles?: string[];
  riesgos?: string[];
  puntos_agenda?: string[];
  posibles_acuerdos?: string[];
}

function Lista({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <p className="text-sm text-slate-400">—</p>;
  return (
    <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  );
}

function Bloque({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default function AgendaRunner() {
  return (
    <RunnerShell
      slug="agenda-reuniones"
      tipo="preparar_ficha"
      payloadKey="tema"
      inputLabel="Tema de la reunión"
      placeholder="Ej. reunión con alcaldes sobre seguridad"
      example="Reunión con el Secretario de Salud para revisar el avance del nuevo hospital regional de Tepic"
      buttonLabel="Preparar ficha"
      usaRag
      renderResult={(d) => {
        const f = (d.ficha ?? {}) as Ficha;
        return (
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Ficha de la reunión</h3>
            <Bloque title="Objetivo">
              <p className="text-sm text-slate-800">{f.objetivo ?? "—"}</p>
            </Bloque>
            <Bloque title="Participantes">
              {f.participantes && f.participantes.length > 0 ? (
                <ul className="space-y-1 text-sm text-slate-700">
                  {f.participantes.map((p, i) => (
                    <li key={i}>
                      <span className="font-medium text-slate-900">{p.nombre}</span>
                      {p.rol ? <span className="text-slate-500"> — {p.rol}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">—</p>
              )}
            </Bloque>
            <Bloque title="Antecedentes"><Lista items={f.antecedentes} /></Bloque>
            <Bloque title="Temas sensibles"><Lista items={f.temas_sensibles} /></Bloque>
            <Bloque title="Riesgos"><Lista items={f.riesgos} /></Bloque>
            <Bloque title="Orden del día"><Lista items={f.puntos_agenda} /></Bloque>
            <Bloque title="Posibles acuerdos"><Lista items={f.posibles_acuerdos} /></Bloque>
          </div>
        );
      }}
    />
  );
}
