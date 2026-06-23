import { NextResponse } from "next/server";
import { ORCH_URL } from "@/lib/api";

// Junta salud, bitácora y métricas del orquestador en una sola llamada para el
// panel de monitoreo en vivo.
export async function GET() {
  try {
    const [health, activity, stats] = await Promise.all([
      fetch(`${ORCH_URL}/health/agents`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${ORCH_URL}/activity`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`${ORCH_URL}/stats`, { cache: "no-store" }).then((r) => r.json()),
    ]);
    return NextResponse.json({ health, activity, stats });
  } catch (err) {
    return NextResponse.json(
      { health: [], activity: [], stats: { por_agente: {}, total: 0 }, error: String(err) },
      { status: 200 },
    );
  }
}
