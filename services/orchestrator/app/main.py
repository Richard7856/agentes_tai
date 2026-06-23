"""orchestrator — registro dinámico de agentes y enrutado (ADR-004, ADR-007).

No contiene lógica de negocio de agentes: solo descubre quién existe, le
entrega tareas, vigila su salud y deja bitácora de las delegaciones. Por eso
pasar de 4 a 10 agentes no lo modifica.
"""

from __future__ import annotations

import logging
import time
from collections import deque
from datetime import datetime, timezone

import httpx
from fastapi import FastAPI, HTTPException

from nucleo_core.schemas import AgentInfo, Result, Task

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("orchestrator")

app = FastAPI(title="orchestrator")

# Registro en memoria (fuente de verdad para enrutar).
_REGISTRY: dict[str, AgentInfo] = {}
# Bitácora de las últimas delegaciones (para el monitoreo).
_ACTIVITY: deque[dict] = deque(maxlen=50)


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
    """Entrega una tarea a un agente por slug y registra la delegación."""
    info = _REGISTRY.get(slug)
    if info is None:
        raise HTTPException(404, f"agente no registrado: {slug}")
    t0 = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.post(
                f"{info.endpoint_url.rstrip('/')}/handle", json=task.model_dump()
            )
            resp.raise_for_status()
            result = Result(**resp.json())
    except Exception as exc:  # noqa: BLE001
        log.exception("fallo al despachar a %s", slug)
        result = Result(ok=False, error=str(exc))

    _ACTIVITY.appendleft(
        {
            "agente": slug,
            "nombre": info.nombre,
            "tipo": task.tipo,
            "ok": result.ok,
            "ms": int((time.perf_counter() - t0) * 1000),
            "at": datetime.now(timezone.utc).isoformat(),
        }
    )
    return result


@app.get("/activity")
async def activity() -> list[dict]:
    """Últimas delegaciones que repartió el orquestador."""
    return list(_ACTIVITY)


@app.get("/stats")
async def stats() -> dict:
    """Conteo de delegaciones por agente (de la bitácora reciente)."""
    counts: dict[str, int] = {}
    for a in _ACTIVITY:
        counts[a["agente"]] = counts.get(a["agente"], 0) + 1
    return {"por_agente": counts, "total": len(_ACTIVITY)}


@app.get("/health/agents")
async def health_agents() -> list[dict]:
    """Hace ping a cada agente registrado y reporta su salud y latencia."""
    out: list[dict] = []
    for slug, info in _REGISTRY.items():
        t0 = time.perf_counter()
        ok = False
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                r = await client.get(f"{info.endpoint_url.rstrip('/')}/health")
                ok = r.status_code == 200
        except Exception:  # noqa: BLE001
            ok = False
        out.append(
            {
                "agente": slug,
                "nombre": info.nombre,
                "ok": ok,
                "ms": int((time.perf_counter() - t0) * 1000),
                "capabilities": info.capabilities,
                "fase": info.fase,
            }
        )
    return out
