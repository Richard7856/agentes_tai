"""Eval de comportamiento: ¿pendientes ubica bien el cuadrante con Claude real?

Opt-in:  RUN_LIVE_EVAL=1 GATEWAY_URL=http://localhost:8000 pytest -m live
Da latitud: acepta el cuadrante como subcadena (el modelo a veces explica).
"""

from __future__ import annotations

import pytest
from helpers import live_o_skip, load_agent_module

from nucleo_core import Task

pytestmark = pytest.mark.live

# texto del pendiente → cuadrantes aceptables (Eisenhower)
CASOS = [
    ("Atender ahora mismo una emergencia sanitaria que exige decisión inmediata de la Gobernadora", {"hacer"}),
    ("Diseñar la estrategia estatal de seguridad para los próximos tres años", {"planear"}),
    ("Contestar hoy una solicitud administrativa de rutina que puede resolver un asistente", {"delegar"}),
    ("Archivar correos promocionales irrelevantes recibidos esta semana", {"eliminar"}),
]


@pytest.mark.parametrize("texto,esperados", CASOS)
async def test_cuadrante_en_vivo(texto, esperados):
    live_o_skip()
    agente = load_agent_module("pendientes-prioridades").PendientesAgent()
    res = await agente.handle(Task(tipo="priorizar", payload={"texto": texto}))

    assert res.ok, res.error
    cuadrante = str(res.data["cuadrante"]).lower()
    assert any(e in cuadrante for e in esperados), f"cuadrante inesperado: {cuadrante}"
