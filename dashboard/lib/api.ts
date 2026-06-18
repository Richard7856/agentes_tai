// Acceso al backend desde el lado servidor (BFF). El browser nunca conoce
// ORCH_URL: las URLs internas se quedan en el servidor.

export const ORCH_URL = process.env.ORCH_URL ?? "http://localhost:8001";

// Espejo del schema AgentInfo del orquestador (libs/core/schemas.py).
export interface AgentInfo {
  slug: string;
  nombre: string;
  descripcion: string;
  fase: number;
  capabilities: string[];
  endpoint_url: string;
  version: string;
}

export interface Result {
  ok: boolean;
  data: Record<string, unknown>;
  error: string | null;
}

// Lista de agentes vivos registrados en el orquestador (ADR-004).
export async function getAgents(): Promise<AgentInfo[]> {
  try {
    const res = await fetch(`${ORCH_URL}/agents`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as AgentInfo[];
  } catch {
    return [];
  }
}
