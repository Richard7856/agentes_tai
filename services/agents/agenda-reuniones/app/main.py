"""Agente Agenda y Reuniones (Fase 1) — STUB.

Prepara fichas previas a reuniones. Stub funcional: registra el contrato y
genera un borrador de ficha con el LLM. La ingesta de calendario (Google) y el
RAG de antecedentes se implementan en módulos posteriores (ver ADR-002).
"""

from __future__ import annotations

import os

from nucleo_core import BaseAgent, GatewayClient, Result, Task, build_agent_app

_SYSTEM = """Eres asistente del despacho. Genera una ficha breve para una reunión
con: objetivo, participantes, antecedentes, temas sensibles y posibles acuerdos.
Responde en texto claro y conciso."""


class AgendaAgent(BaseAgent):
    slug = "agenda-reuniones"
    nombre = "Agenda y Reuniones"
    descripcion = "Prepara fichas previas y da seguimiento a reuniones."
    fase = 1
    capabilities = ["preparar_ficha", "seguimiento"]

    def __init__(self) -> None:
        self.llm = GatewayClient(os.environ.get("GATEWAY_URL"), agente=self.slug)

    async def handle(self, task: Task) -> Result:
        if task.tipo == "preparar_ficha":
            tema = (task.payload or {}).get("tema", "reunión de trabajo")
            r = await self.llm.complete(system=_SYSTEM, user=f"Reunión sobre: {tema}")
            return Result(data={"ficha_borrador": r.text, "modelo": r.modelo})
        return Result(ok=False, error=f"tipo no soportado: {task.tipo}")


app = build_agent_app(AgendaAgent())
