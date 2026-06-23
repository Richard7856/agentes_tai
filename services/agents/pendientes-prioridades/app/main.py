"""Agente Pendientes y Prioridades (Fase 1).

Evalúa un pendiente y lo ubica en la matriz de Eisenhower con calificaciones,
justificación, acción recomendada y a quién delegar. Devuelve JSON estructurado.
"""

from __future__ import annotations

import json
import os
import re

from nucleo_core import BaseAgent, GatewayClient, Result, Task, build_agent_app

_SYSTEM = """Clasifica el pendiente en la matriz de Eisenhower para el despacho de
una Gobernadora. Responde ÚNICAMENTE con un objeto JSON válido con estas llaves:
- cuadrante: uno de [hacer, planear, delegar, eliminar]
- urgencia: entero 1-5
- importancia: entero 1-5
- justificacion: string, por qué cae en ese cuadrante
- accion_recomendada: string, el siguiente paso concreto
- responsable_sugerido: string, quién debería atenderlo
Reglas: hacer = urgente+importante; planear = importante no urgente;
delegar = urgente no importante; eliminar = ninguno."""


def _extraer_json(texto: str) -> dict:
    match = re.search(r"\{.*\}", texto, re.DOTALL)
    if not match:
        raise ValueError("el modelo no devolvió JSON")
    return json.loads(match.group(0))


class PendientesAgent(BaseAgent):
    slug = "pendientes-prioridades"
    nombre = "Pendientes y Prioridades"
    descripcion = "Consolida pendientes y los prioriza por urgencia/importancia."
    fase = 1
    capabilities = ["priorizar"]

    def __init__(self) -> None:
        self.llm = GatewayClient(os.environ.get("GATEWAY_URL"), agente=self.slug)

    async def handle(self, task: Task) -> Result:
        if task.tipo != "priorizar":
            return Result(ok=False, error=f"tipo no soportado: {task.tipo}")
        texto = (task.payload or {}).get("texto", "").strip()
        if not texto:
            return Result(ok=False, error="payload.texto vacío")

        r = await self.llm.complete(system=_SYSTEM, user=texto, max_tokens=1024)
        try:
            evaluacion = _extraer_json(r.text)
        except (ValueError, json.JSONDecodeError):
            evaluacion = {"cuadrante": r.text.strip().lower()}
        # Normaliza el cuadrante a minúsculas por si el modelo lo capitaliza.
        if isinstance(evaluacion.get("cuadrante"), str):
            evaluacion["cuadrante"] = evaluacion["cuadrante"].strip().lower()
        return Result(data={"evaluacion": evaluacion, "modelo": r.modelo, "razonamiento": r.reasoning})


app = build_agent_app(PendientesAgent())
