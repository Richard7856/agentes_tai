"""Agente Control de Acuerdos (Fase 1).

Extrae los acuerdos de un acta/minuta en forma ESTRUCTURADA: responsable,
compromiso, fecha, dependencia y semáforo de vencimiento. Devuelve JSON.
"""

from __future__ import annotations

import json
import os
import re

from nucleo_core import BaseAgent, GatewayClient, Result, Task, build_agent_app

_SYSTEM = """Extrae los acuerdos del texto de un acta o minuta de gobierno.
Responde ÚNICAMENTE con un objeto JSON válido con la llave:
- acuerdos: arreglo de objetos {responsable, compromiso, fecha, dependencia, semaforo}
Donde:
- fecha: la fecha límite si aparece, o null
- dependencia: la dependencia responsable si se infiere, o null
- semaforo: uno de [verde, amarillo, rojo] según qué tan próximo/riesgoso es el plazo
Si no hay acuerdos, devuelve un arreglo vacío."""


def _extraer_json(texto: str) -> dict:
    match = re.search(r"\{.*\}", texto, re.DOTALL)
    if not match:
        raise ValueError("el modelo no devolvió JSON")
    return json.loads(match.group(0))


class AcuerdosAgent(BaseAgent):
    slug = "control-acuerdos"
    nombre = "Control de Acuerdos"
    descripcion = "Vigila acuerdos: responsables, plazos, evidencias y semáforos."
    fase = 1
    capabilities = ["extraer_acuerdos"]

    def __init__(self) -> None:
        self.llm = GatewayClient(os.environ.get("GATEWAY_URL"), agente=self.slug)

    async def handle(self, task: Task) -> Result:
        if task.tipo != "extraer_acuerdos":
            return Result(ok=False, error=f"tipo no soportado: {task.tipo}")
        texto = (task.payload or {}).get("texto", "").strip()
        if not texto:
            return Result(ok=False, error="payload.texto vacío")

        r = await self.llm.complete(system=_SYSTEM, user=texto, max_tokens=2048)
        try:
            extraccion = _extraer_json(r.text)
        except (ValueError, json.JSONDecodeError):
            extraccion = {"acuerdos": [], "texto_crudo": r.text}
        return Result(data={"extraccion": extraccion, "modelo": r.modelo, "razonamiento": r.reasoning})


app = build_agent_app(AcuerdosAgent())
