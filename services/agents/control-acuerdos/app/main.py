"""Agente Control de Acuerdos (Fase 1) — STUB.

Vigila responsables, plazos, evidencias y retrasos; extrae acuerdos de
documentos (vía servicio OCR) y mantiene semáforos. Stub funcional: extrae
acuerdos de un texto. La integración con OCR y los semáforos automáticos
(alertas vía n8n) se implementan en módulos posteriores.
"""

from __future__ import annotations

import os

from nucleo_core import BaseAgent, GatewayClient, Result, Task, build_agent_app

_SYSTEM = """Extrae los acuerdos del texto. Para cada acuerdo identifica:
responsable, compromiso y fecha si aparece. Responde como lista breve."""


class AcuerdosAgent(BaseAgent):
    slug = "control-acuerdos"
    nombre = "Control de Acuerdos"
    descripcion = "Vigila acuerdos: responsables, plazos, evidencias y semáforos."
    fase = 1
    capabilities = ["extraer_acuerdos"]

    def __init__(self) -> None:
        self.llm = GatewayClient(os.environ.get("GATEWAY_URL"), agente=self.slug)

    async def handle(self, task: Task) -> Result:
        if task.tipo == "extraer_acuerdos":
            texto = (task.payload or {}).get("texto", "")
            r = await self.llm.complete(system=_SYSTEM, user=texto)
            return Result(data={"acuerdos": r.text, "modelo": r.modelo})
        return Result(ok=False, error=f"tipo no soportado: {task.tipo}")


app = build_agent_app(AcuerdosAgent())
