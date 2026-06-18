"""Eval de comportamiento: ¿acuerdos extrae responsable, compromiso y fecha?

Opt-in:  RUN_LIVE_EVAL=1 GATEWAY_URL=http://localhost:8000 pytest -m live
Verifica que NO solo repita el texto: deben aparecer los datos clave del acuerdo.
"""

from __future__ import annotations

import pytest
from helpers import live_o_skip, load_agent_module

from nucleo_core import Task

ACTA = (
    "Minuta de la reunión del 3 de marzo. La Secretaría de Salud, a través de "
    "Juan Pérez, se comprometió a entregar el informe de cobertura el 15 de "
    "agosto. La Secretaría de Obras dará seguimiento al avance del acueducto."
)

pytestmark = pytest.mark.live


async def test_extrae_datos_clave_en_vivo():
    live_o_skip()
    agente = load_agent_module("control-acuerdos").AcuerdosAgent()
    res = await agente.handle(Task(tipo="extraer_acuerdos", payload={"texto": ACTA}))

    assert res.ok, res.error
    salida = str(res.data["acuerdos"]).lower()

    # Responsable identificado (nombre o dependencia).
    assert "juan" in salida or "salud" in salida, salida
    # Compromiso capturado.
    assert "informe" in salida, salida
    # Fecha del compromiso.
    assert "agosto" in salida or "15" in salida, salida
