"use client";

import { useEffect, useState } from "react";

interface Health {
  agente: string;
  nombre: string;
  ok: boolean;
  ms: number;
  capabilities: string[];
  fase: number;
}
interface Activity {
  agente: string;
  nombre: string;
  tipo: string;
  ok: boolean;
  ms: number;
  at: string;
}
interface Data {
  health: Health[];
  activity: Activity[];
  stats: { por_agente: Record<string, number>; total: number };
}

// Panel de monitoreo en vivo: refresca cada 4s la salud, las delegaciones y las
// métricas que reporta el orquestador.
export default function MonitorView() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/monitor", { cache: "no-store" });
        const d = await r.json();
        if (alive) setData(d);
      } catch {
        /* reintenta en el siguiente tick */
      }
    }
    load();
    const id = setInterval(load, 4000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const health = data?.health ?? [];
  const activity = data?.activity ?? [];
  const total = data?.stats?.total ?? 0;
  const sanos = health.filter((h) => h.ok).length;

  return (
    <div className="space-y-8">
      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Agentes" value={String(health.length)} />
        <Kpi label="Sanos" value={`${sanos}/${health.length}`} color="text-emerald-600" />
        <Kpi label="Delegaciones" value={String(total)} color="text-indigo-600" />
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            en vivo · cada 4s
          </span>
        </div>
      </div>

      {/* Salud de agentes */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Salud de los agentes
        </h2>
        {health.length === 0 ? (
          <p className="text-sm text-slate-400">Cargando o sin agentes registrados…</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {health.map((h) => (
              <div key={h.agente} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">{h.nombre}</h3>
                  <span
                    className={
                      "inline-block h-2.5 w-2.5 rounded-full " +
                      (h.ok ? "bg-emerald-500" : "bg-red-500")
                    }
                    title={h.ok ? "activo" : "sin respuesta"}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {h.ok ? "activo" : "sin respuesta"} · {h.ms} ms
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {h.capabilities.map((c) => (
                    <span key={c} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delegaciones recientes */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Delegaciones recientes
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {activity.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">
              Aún no hay delegaciones. Prueba un agente y regresa aquí.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        "inline-block h-2 w-2 rounded-full " +
                        (a.ok ? "bg-emerald-500" : "bg-red-500")
                      }
                    />
                    <span className="text-slate-500">Orquestador →</span>
                    <span className="font-medium text-slate-900">{a.nombre}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                      {a.tipo}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{a.ms} ms</span>
                    <span className="font-mono">{hora(a.at)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, color = "text-slate-700" }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function hora(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("es-MX", { hour12: false });
  } catch {
    return "";
  }
}
