"""orchestrator — registro dinámico de agentes y enrutado (ADR-004, ADR-007).

No contiene lógica de negocio de agentes: solo descubre quién existe y le
entrega tareas. Por eso pasar de 4 a 10 agentes no lo modifica.
"""

from __future__ import annotations

import logging

import httpx
from fastapi import FastAPI, HTTPException

from nucleo_core.schemas import AgentInfo, Result, Task

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("orchestrator")

app = FastAPI(title="orchestrator")

# Registro en memoria (fuente de verdad para enrutar). El espejo en la tabla
# `agents` es para el tablero/auditoría; se persiste en una iteración posterior.
_REGISTRY: dict[str, AgentInfo] = {}


@app.get("/health")
async def health() -> dict:
    return {"ok": True, "agentes_activos": len(_REGISTRY)}


@app.post("/agents/register")
async def register(info: AgentInfo) -> dict:
    """Un agente se anuncia al arrancar. Idempotente por slug."""
    _REGISTRY[info.slug] = info
    log.info("registrado agente slug=%s caps=%s", info.slug, info.capabilities)
    return {"ok": True}


@app.get("/agents", response_model=list[AgentInfo])
async def list_agents() -> list[AgentInfo]:
    return list(_REGISTRY.values())


@app.post("/agents/{slug}/dispatch", response_model=Result)
async def dispatch(slug: str, task: Task) -> Result:
    """Entrega una tarea a un agente por slug."""
    info = _REGISTRY.get(slug)
    if info is None:
        raise HTTPException(404, f"agente no registrado: {slug}")
    try:
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.post(
                f"{info.endpoint_url.rstrip('/')}/handle", json=task.model_dump()
            )
            resp.raise_for_status()
            return Result(**resp.json())
    except Exception as exc:  # noqa: BLE001
        log.exception("fallo al despachar a %s", slug)
        return Result(ok=False, error=str(exc))
