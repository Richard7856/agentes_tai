"""Agente Pendientes y Prioridades (Fase 1) — STUB.

Consolida pendientes y los ubica en la matriz urgencia/importancia (Eisenhower).
Stub funcional: clasifica un pendiente en su cuadrante con el LLM.
"""

from __future__ import annotations

import os

from nucleo_core import BaseAgent, GatewayClient, Result, Task, build_agent_app

_SYSTEM = """Clasifica el pendiente en la matriz de Eisenhower. Responde solo con
una palabra del conjunto: hacer (urgente+importante), planear (importante),
delegar (urgente), eliminar (ninguno)."""


class PendientesAgent(BaseAgent):
    slug = "pendientes-prioridades"
    nombre = "Pendientes y Prioridades"
    descripcion = "Consolida pendientes y los prioriza por urgencia/importancia."
    fase = 1
    capabilities = ["priorizar"]

    def __init__(self) -> None:
        self.llm = GatewayClient(os.environ.get("GATEWAY_URL"), agente=self.slug)

    async def handle(self, task: Task) -> Result:
        if task.tipo == "priorizar":
            texto = (task.payload or {}).get("texto", "")
            r = await self.llm.complete(system=_SYSTEM, user=texto, max_tokens=512)
            return Result(
                data={
                    "cuadrante": r.text.strip().lower(),
                    "modelo": r.modelo,
                    "razonamiento": r.reasoning,
                }
            )
        return Result(ok=False, error=f"tipo no soportado: {task.tipo}")


app = build_agent_app(PendientesAgent())
