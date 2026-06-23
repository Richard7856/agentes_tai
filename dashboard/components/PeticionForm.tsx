"use client";

import { useState } from "react";
import type { Result } from "@/lib/api";
import FlowTimeline from "@/components/FlowTimeline";

const EJEMPLO = "No hay agua en mi colonia hace 5 días, vivo en Tepic";

// Clasificación devuelta por el agente (espejo del JSON del modelo).
interface Clasificacion {
  categoria?: string;
  urgencia?: string;
  justificacion_urgencia?: string;
  municipio?: string | null;
  dependencia_sugerida?: string;
  justificacion_dependencia?: string;
  resumen?: string;
  acuse_ciudadano?: string;
  accion_recomendada?: string;
}

export default function PeticionForm() {
  const [texto, setTexto] = useState(EJEMPLO);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/peticiones", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      setResult(await res.json());
    } catch (err) {
      setResult({ ok: false, data: {}, error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  const clasificacion = result?.data?.clasificacion as Clasificacion | undefined;
  const razonamiento = result?.data?.razonamiento
    ? String(result.data.razonamiento)
    : "";
  const urgencia = clasificacion?.urgencia;
  const urgColor =
    urgencia === "alta"
      ? "bg-red-100 text-red-700"
      : urgencia === "media"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <label className="block text-sm font-medium text-slate-700">
            Texto de la petición ciudadana
          </label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={6}
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Clasificando…" : "Clasificar con el agente"}
          </button>
          <p className="mt-2 text-xs text-slate-400">
            Enrutado por el orquestador → agente peticiones-ciudadanas · datos sintéticos
          </p>
        </form>
        {(loading || result) && (
          <FlowTimeline loading={loading} done={!!result?.ok} />
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">Resultado</h3>
        {!result && (
          <p className="mt-3 text-sm text-slate-400">
            Envía una petición para ver la clasificación.
          </p>
        )}
        {result && !result.ok && (
          <p className="mt-3 text-sm text-red-600">Error: {result.error}</p>
        )}
        {razonamiento && (
          <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              🧠 Cómo pensó el agente
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-indigo-900">
              {razonamiento}
            </p>
          </div>
        )}
        {result?.ok && clasificacion && (
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Folio" value={String(result.data.folio ?? "—")} mono />
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Urgencia</dt>
              <dd>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${urgColor}`}>
                  {urgencia ?? "—"}
                </span>
              </dd>
            </div>
            <Row label="Categoría" value={clasificacion.categoria ?? "—"} />
            <Row label="Municipio" value={clasificacion.municipio ?? "—"} />
            <Row label="Dependencia sugerida" value={clasificacion.dependencia_sugerida ?? "—"} />
            <Row label="Resumen" value={clasificacion.resumen ?? "—"} />
            <Row label="Modelo" value={String(result.data.modelo ?? "—")} mono />

            {clasificacion.justificacion_urgencia && (
              <Nota titulo="Por qué esa urgencia" texto={clasificacion.justificacion_urgencia} />
            )}
            {clasificacion.justificacion_dependencia && (
              <Nota titulo="Por qué esa dependencia" texto={clasificacion.justificacion_dependencia} />
            )}
            {clasificacion.accion_recomendada && (
              <Nota titulo="Acción recomendada" texto={clasificacion.accion_recomendada} />
            )}
            {clasificacion.acuse_ciudadano && (
              <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  ✉️ Acuse al ciudadano (borrador)
                </p>
                <p className="mt-1 text-sm text-emerald-900">{clasificacion.acuse_ciudadano}</p>
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}

function Nota({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="pt-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{titulo}</p>
      <p className="mt-0.5 text-sm text-slate-700">{texto}</p>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className={`text-right text-slate-900 ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
