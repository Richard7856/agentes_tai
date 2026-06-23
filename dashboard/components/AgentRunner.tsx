"use client";

import { useState } from "react";

interface Props {
  slug: string;
  tipo: string;
  inputLabel: string;
  placeholder: string;
  payloadKey: string; // llave del payload que espera el agente (ej. "texto", "tema")
  example: string;
  buttonLabel?: string;
}

interface Result {
  ok: boolean;
  data: Record<string, unknown>;
  error: string | null;
}

// Componente reutilizable: manda una tarea al orquestador y muestra el resultado.
// Lo usan los módulos de Agenda, Pendientes y Acuerdos (Peticiones tiene su vista propia).
export default function AgentRunner({
  slug,
  tipo,
  inputLabel,
  placeholder,
  payloadKey,
  example,
  buttonLabel = "Procesar con el agente",
}: Props) {
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
  const modelo = data?.modelo ? String(data.modelo) : "";
  const entries = data ? Object.entries(data).filter(([k]) => k !== "modelo") : [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
          Enrutado por el orquestador → agente{" "}
          <span className="font-mono">{slug}</span> · datos sintéticos
        </p>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">Resultado</h3>
        {!result && (
          <p className="mt-3 text-sm text-slate-400">Envía el texto para ver el resultado.</p>
        )}
        {result && !result.ok && (
          <p className="mt-3 text-sm text-red-600">Error: {result.error}</p>
        )}
        {data && (
          <div className="mt-3 space-y-3 text-sm">
            {entries.map(([k, v]) => {
              const val = typeof v === "string" ? v : JSON.stringify(v);
              const long = val.length > 60 || val.includes("\n");
              return (
                <div key={k}>
                  <p className="capitalize text-slate-500">{k.replace(/_/g, " ")}</p>
                  {long ? (
                    <pre className="mt-1 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-slate-800">
                      {val}
                    </pre>
                  ) : (
                    <p className="text-slate-900">{val}</p>
                  )}
                </div>
              );
            })}
            {modelo && (
              <p className="border-t border-slate-100 pt-2 text-xs text-slate-400">
                Ruta: Tablero → Orquestador → {slug} → <span className="font-mono">{modelo}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
