"""Contrato base de un agente y fábrica de su app FastAPI.

Todo agente hereda `BaseAgent` y se expone con `build_agent_app`. La app se
auto-registra en el orquestador al arrancar, de modo que sumar agentes (4 → 10)
no requiere tocar el orquestador (ADR-004).
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI

from .schemas import AgentInfo, Result, Task


class BaseAgent:
    """Interfaz mínima que cumple cualquier agente del Núcleo."""

    slug: str = "base"
    nombre: str = "Agente base"
    descripcion: str = ""
    fase: int = 1
    capabilities: list[str] = []

    def info(self) -> AgentInfo:
        """Identidad que se publica en el registro (propósito: descubrimiento)."""
        return AgentInfo(
            slug=self.slug,
            nombre=self.nombre,
            descripcion=self.descripcion,
            fase=self.fase,
            capabilities=self.capabilities,
            endpoint_url=os.environ.get("SELF_URL", f"http://{self.slug}:8000"),
        )

    async def handle(self, task: Task) -> Result:
        """Resuelve una tarea. Cada agente lo sobreescribe."""
        return Result(ok=False, error="no implementado")


async def _register(agent: BaseAgent) -> None:
    """Anuncia el agente al orquestador (best-effort: no tumbar el arranque)."""
    orch = os.environ.get("ORCH_URL")
    if not orch:
        return
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                f"{orch.rstrip('/')}/agents/register",
                json=agent.info().model_dump(),
            )
    except Exception:  # noqa: BLE001 — el agente debe arrancar aunque el orquestador no esté listo
        pass


def build_agent_app(agent: BaseAgent) -> FastAPI:
    """Construye la app FastAPI estándar de un agente."""

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        await _register(agent)
        yield

    app = FastAPI(title=agent.nombre, lifespan=lifespan)

    @app.get("/health")
    async def health() -> dict:
        return {"ok": True, "slug": agent.slug, "capabilities": agent.capabilities}

    @app.get("/info")
    async def info() -> AgentInfo:
        return agent.info()

    @app.post("/handle")
    async def handle(task: Task) -> Result:
        return await agent.handle(task)

    return app
