"""Eval de comportamiento: ¿el agente clasifica como se espera con Claude real?

Se salta por defecto. Para correrla, con el stack arriba:
    RUN_LIVE_EVAL=1 GATEWAY_URL=http://localhost:8000 pytest -m live
Da cierta latitud al modelo (acepta un conjunto de categorías plausibles), no
exige una salida exacta — es una prueba de comportamiento, no un snapshot.
"""

from __future__ import annotations

import os

import pytest
from helpers import load_agent_module

from nucleo_core import Task

pytestmark = pytest.mark.live

# Casos sintéticos: texto → categorías aceptables y urgencia esperada.
CASOS = [
    ("No hay agua en mi colonia hace 5 días en Tepic", {"agua"}, "alta"),
    ("Quisiera información sobre cómo tramitar mi acta de nacimiento", {"tramites"}, "baja"),
    ("Hay una fuga peligrosa y un poste a punto de caer sobre la escuela", {"seguridad", "obras"}, "alta"),
]


def _activa() -> bool:
    return os.environ.get("RUN_LIVE_EVAL") == "1"


@pytest.mark.parametrize("texto,categorias_ok,urgencia_esp", CASOS)
async def test_clasificacion_en_vivo(texto, categorias_ok, urgencia_esp):
    if not _activa():
        pytest.skip("define RUN_LIVE_EVAL=1 y levanta el stack para correr la eval")

    agente = load_agent_module("peticiones-ciudadanas").PeticionesAgent()
    res = await agente.handle(Task(tipo="clasificar", payload={"texto": texto}))

    assert res.ok, res.error
    clas = res.data["clasificacion"]
    assert clas["categoria"] in categorias_ok, f"categoria inesperada: {clas['categoria']}"
    assert clas["urgencia"] == urgencia_esp, f"urgencia inesperada: {clas['urgencia']}"
    assert res.data["folio"].startswith("PC-")
