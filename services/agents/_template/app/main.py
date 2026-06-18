"""Plantilla de agente. Clonar esta carpeta para crear un agente nuevo (4 → 10).

Pasos: renombrar slug/nombre, declarar capabilities, implementar `handle`,
añadir migración de dominio propia y servicio en docker-compose. El agente se
auto-registra; no se toca el orquestador (ADR-004).
"""

from __future__ import annotations

import os

from nucleo_core import BaseAgent, GatewayClient, Result, Task, build_agent_app


class TemplateAgent(BaseAgent):
    slug = "template"
    nombre = "Agente plantilla"
    descripcion = "Reemplazar por la descripción real del agente."
    fase = 2
    capabilities = ["ejemplo"]

    def __init__(self) -> None:
        self.llm = GatewayClient(os.environ.get("GATEWAY_URL"), agente=self.slug)

    async def handle(self, task: Task) -> Result:
        if task.tipo == "ejemplo":
            r = await self.llm.complete(user=task.payload.get("texto", "Hola"))
            return Result(data={"respuesta": r.text, "modelo": r.modelo})
        return Result(ok=False, error=f"tipo no soportado: {task.tipo}")


app = build_agent_app(TemplateAgent())
