import { NextResponse } from "next/server";
import { ORCH_URL } from "@/lib/api";

// BFF: recibe el texto del browser y lo despacha al agente vía orquestador.
// Mantiene ORCH_URL del lado servidor y evita CORS (ADR-007).
export async function POST(req: Request) {
  const body = await req.json();
  const texto = (body?.texto ?? "").toString().trim();
  if (!texto) {
    return NextResponse.json(
      { ok: false, error: "texto vacío" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(
      `${ORCH_URL}/agents/peticiones-ciudadanas/dispatch`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tipo: "clasificar", payload: { texto } }),
        cache: "no-store",
      },
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `orquestador inalcanzable: ${String(err)}` },
      { status: 502 },
    );
  }
}
