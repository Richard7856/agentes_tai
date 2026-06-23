"use client";

import { useEffect, useState } from "react";

// Línea de pasos que se "ilumina" mientras el agente trabaja. Es una
// visualización del flujo (los tiempos son ilustrativos); el resultado y el
// razonamiento que se muestran después sí son reales.
export default function FlowTimeline({
  loading,
  done,
  usaRag = false,
}: {
  loading: boolean;
  done: boolean;
  usaRag?: boolean;
}) {
  const steps = [
    "Orquestador recibe la solicitud",
    "Enruta al agente correcto",
    ...(usaRag ? ["Consulta la base documental (RAG)"] : []),
    "El agente razona con el modelo",
    "Resultado consolidado",
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (loading) {
      setActive(0);
      const id = setInterval(
        () => setActive((a) => Math.min(a + 1, steps.length - 2)),
        700,
      );
      return () => clearInterval(id);
    }
    if (done) setActive(steps.length);
  }, [loading, done, steps.length]);

  function estado(i: number): "done" | "active" | "pending" {
    if (done || i < active) return "done";
    if (loading && i === active) return "active";
    return "pending";
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Flujo de trabajo
      </p>
      <ol className="space-y-2">
        {steps.map((s, i) => {
          const st = estado(i);
          return (
            <li key={s} className="flex items-center gap-3 text-sm">
              <span
                className={
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold " +
                  (st === "done"
                    ? "bg-emerald-500 text-white"
                    : st === "active"
                      ? "animate-pulse bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-500")
                }
              >
                {st === "done" ? "✓" : i + 1}
              </span>
              <span
                className={
                  st === "pending" ? "text-slate-400" : "text-slate-800"
                }
              >
                {s}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
