"""Agente Peticiones Ciudadanas (Fase 1).

Recibe una solicitud en texto libre y, con ayuda del LLM, la clasifica
(categoría, urgencia), detecta municipio, sugiere dependencia y folía. Demo del
slice: aquí se "ve cómo trabaja el modelo" con datos sintéticos.
"""

from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone

from nucleo_core import BaseAgent, GatewayClient, Result, Task, build_agent_app

# Prompt de sistema: define el trabajo del modelo y el formato de salida.
_SYSTEM = """Eres un analista del despacho de gobierno que clasifica peticiones
ciudadanas. Dada una petición en texto libre, responde ÚNICAMENTE con un objeto
JSON válido, sin texto adicional, con estas llaves:
- categoria: una de [agua, salud, seguridad, obras, educacion, tramites, otro]
- urgencia: una de [baja, media, alta]
- municipio: nombre del municipio si se menciona, o null
- dependencia_sugerida: dependencia estatal que debería atenderla
- resumen: una frase breve de la petición
"""


def _extraer_json(texto: str) -> dict:
    """Extrae el primer objeto JSON del texto del modelo (tolerante a ruido)."""
    match = re.search(r"\{.*\}", texto, re.DOTALL)
    if not match:
        raise ValueError("el modelo no devolvió JSON")
    return json.loads(match.group(0))


def _nuevo_folio() -> str:
    """Genera un folio consecutivo simple por timestamp (placeholder de BD)."""
    return "PC-" + datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


class PeticionesAgent(BaseAgent):
    slug = "peticiones-ciudadanas"
    nombre = "Peticiones Ciudadanas"
    descripcion = "Recibe, clasifica, folía y canaliza peticiones ciudadanas."
    fase = 1
    capabilities = ["clasificar", "foliar"]

    def __init__(self) -> None:
        self.llm = GatewayClient(os.environ.get("GATEWAY_URL"), agente=self.slug)

    async def handle(self, task: Task) -> Result:
        if task.tipo not in self.capabilities:
            return Result(ok=False, error=f"tipo no soportado: {task.tipo}")

        texto = (task.payload or {}).get("texto", "").strip()
        if not texto:
            return Result(ok=False, error="payload.texto vacío")

        # sensibilidad="sintetico": datos de prueba, sin redacción (ADR-002).
        resp = await self.llm.complete(
            system=_SYSTEM, user=texto, sensibilidad="sintetico", max_tokens=1024
        )
        try:
            clasificacion = _extraer_json(resp.text)
        except (ValueError, json.JSONDecodeError) as exc:
            return Result(ok=False, error=f"clasificación inválida: {exc}")

        return Result(
            data={
                "folio": _nuevo_folio(),
                "clasificacion": clasificacion,
                "modelo": resp.modelo,
                "proveedor": resp.proveedor,
                "razonamiento": resp.reasoning,
            }
        )


app = build_agent_app(PeticionesAgent())
