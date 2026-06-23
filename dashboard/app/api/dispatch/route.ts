import { NextResponse } from "next/server";
import { ORCH_URL } from "@/lib/api";

// BFF genérico: enruta cualquier tarea al agente correcto VÍA el orquestador.
// Demuestra el trabajo del orquestador: un solo punto que reparte a los agentes.
export async function POST(req: Request) {
  const { slug, tipo, payload } = await req.json();
  if (!slug || !tipo) {
    return NextResponse.json(
      { ok: false, error: "slug y tipo son requeridos" },
      { status: 400 },
    );
  }
  try {
    const res = await fetch(`${ORCH_URL}/agents/${slug}/dispatch`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tipo, payload: payload ?? {} }),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `orquestador inalcanzable: ${String(err)}` },
      { status: 502 },
    );
  }
}
