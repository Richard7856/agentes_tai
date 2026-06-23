"""Eval de comportamiento: ¿la ficha de reunión cubre las secciones esperadas?

Opt-in:  RUN_LIVE_EVAL=1 GATEWAY_URL=http://localhost:8000 pytest -m live
Exige que la ficha aborde varias secciones clave y que referencie el tema.
"""

from __future__ import annotations

import pytest
from helpers import live_o_skip, load_agent_module

from nucleo_core import Task

pytestmark = pytest.mark.live

TEMA = "reunión con alcaldes sobre seguridad y la obra hídrica del acueducto"

# Raíces de secciones que la ficha debería tocar (case-insensitive, por raíz).
SECCIONES = ["objetiv", "participant", "antecedent", "sensibl", "acuerdo"]
# El tema debe quedar reflejado: al menos una de estas raíces.
TEMA_REFS = ["segurid", "hídric", "hidric", "acueduct", "alcald"]


async def test_ficha_cubre_secciones_en_vivo():
    live_o_skip()
    agente = load_agent_module("agenda-reuniones").AgendaAgent()
    res = await agente.handle(Task(tipo="preparar_ficha", payload={"tema": TEMA}))

    assert res.ok, res.error
    # La ficha ahora es estructurada (JSON); la serializamos para validar contenido.
    ficha = str(res.data["ficha"]).lower()

    presentes = [s for s in SECCIONES if s in ficha]
    assert len(presentes) >= 3, f"faltan secciones, solo: {presentes}"
    assert any(t in ficha for t in TEMA_REFS), "la ficha no referencia el tema"
