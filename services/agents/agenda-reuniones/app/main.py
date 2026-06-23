"""Agente Agenda y Reuniones (Fase 1).

Prepara una ficha ejecutiva ESTRUCTURADA para una reunión: objetivo,
participantes con su rol, antecedentes, temas sensibles, riesgos, puntos de la
agenda y posibles acuerdos. Devuelve JSON para renderizarlo como documento.
"""

from __future__ import annotations

import json
import os
import re

from nucleo_core import BaseAgent, GatewayClient, Result, Task, build_agent_app

_SYSTEM = """Eres el jefe de gabinete digital de una Gobernadora. Prepara una
ficha ejecutiva para la reunión indicada. Responde ÚNICAMENTE con un objeto JSON
válido (sin texto adicional) con estas llaves:
- objetivo: string, el propósito claro de la reunión
- participantes: arreglo de objetos {nombre, rol} (infiere perfiles plausibles)
- antecedentes: arreglo de strings (3-4 puntos de contexto)
- temas_sensibles: arreglo de strings (temas delicados a cuidar)
- riesgos: arreglo de strings (qué podría salir mal)
- puntos_agenda: arreglo de strings (orden del día sugerido)
- posibles_acuerdos: arreglo de strings (acuerdos a los que se podría llegar)
Sé concreto y útil para el contexto de gobierno del estado de Nayarit."""


def _extraer_json(texto: str) -> dict:
    """Rescata el primer objeto JSON del texto del modelo."""
    match = re.search(r"\{.*\}", texto, re.DOTALL)
    if not match:
        raise ValueError("el modelo no devolvió JSON")
    return json.loads(match.group(0))


class AgendaAgent(BaseAgent):
    slug = "agenda-reuniones"
    nombre = "Agenda y Reuniones"
    descripcion = "Prepara fichas previas y da seguimiento a reuniones."
    fase = 1
    capabilities = ["preparar_ficha", "seguimiento"]

    def __init__(self) -> None:
        self.llm = GatewayClient(os.environ.get("GATEWAY_URL"), agente=self.slug)

    async def handle(self, task: Task) -> Result:
        if task.tipo != "preparar_ficha":
            return Result(ok=False, error=f"tipo no soportado: {task.tipo}")
        tema = (task.payload or {}).get("tema", "").strip()
        if not tema:
            return Result(ok=False, error="payload.tema vacío")

        r = await self.llm.complete(
            system=_SYSTEM, user=f"Reunión sobre: {tema}", max_tokens=2048
        )
        try:
            ficha = _extraer_json(r.text)
        except (ValueError, json.JSONDecodeError):
            # Nunca rompemos la demo: si no vino JSON, mostramos el texto crudo.
            return Result(data={"ficha": {"objetivo": r.text}, "modelo": r.modelo, "razonamiento": r.reasoning})
        return Result(data={"ficha": ficha, "modelo": r.modelo, "razonamiento": r.reasoning})


app = build_agent_app(AgendaAgent())
