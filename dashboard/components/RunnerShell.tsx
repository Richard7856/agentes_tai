"use client";

import { ReactNode, useState } from "react";
import FlowTimeline from "@/components/FlowTimeline";

interface Result {
  ok: boolean;
  data: Record<string, unknown>;
  error: string | null;
}

// Shell común: formulario + flujo animado + razonamiento real + render del
// resultado estructurado (que cada agente provee con `renderResult`).
export default function RunnerShell({
  slug,
  tipo,
  payloadKey,
  inputLabel,
  placeholder,
  example,
  buttonLabel = "Procesar con el agente",
  usaRag = false,
  renderResult,
}: {
  slug: string;
  tipo: string;
  payloadKey: string;
  inputLabel: string;
  placeholder: string;
  example: string;
  buttonLabel?: string;
  usaRag?: boolean;
  renderResult: (data: Record<string, unknown>) => ReactNode;
}) {
  const [text, setText] = useState(example);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, tipo, payload: { [payloadKey]: text } }),
      });
      setResult(await res.json());
    } catch (err) {
      setResult({ ok: false, data: {}, error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  const data = result?.ok ? result.data : null;
  const razonamiento = data?.razonamiento ? String(data.razonamiento) : "";
  const modelo = data?.modelo ? String(data.modelo) : "";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <label className="block text-sm font-medium text-slate-700">{inputLabel}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder={placeholder}
            className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Procesando…" : buttonLabel}
          </button>
          <p className="mt-2 text-xs text-slate-400">
            Enrutado por el orquestador → agente <span className="font-mono">{slug}</span> · datos sintéticos
          </p>
        </form>
        {(loading || result) && (
          <FlowTimeline loading={loading} done={!!result?.ok} usaRag={usaRag} />
        )}
      </div>

      <div className="space-y-4">
        {!result && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-400 shadow-sm">
            Envía el texto para ver el resultado.
          </div>
        )}
        {result && !result.ok && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Error: {result.error}
          </div>
        )}
        {razonamiento && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              🧠 Cómo razonó el agente
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-indigo-900">{razonamiento}</p>
          </div>
        )}
        {data && renderResult(data)}
        {data && modelo && (
          <p className="text-xs text-slate-400">
            Ruta: Tablero → Orquestador → {slug} → <span className="font-mono">{modelo}</span>
          </p>
        )}
      </div>
    </div>
  );
}
