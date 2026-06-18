"""Lógica del agente de peticiones, sin tocar el LLM real."""

from __future__ import annotations

import pytest
from helpers import fake_complete, load_agent_module

from nucleo_core import Task

mod = load_agent_module("peticiones-ciudadanas")

_CLASIFICACION_OK = (
    '{"categoria":"agua","urgencia":"alta","municipio":"Tepic",'
    '"dependencia_sugerida":"Comisión Estatal de Agua",'
    '"resumen":"Falta de agua en colonia"}'
)


def _agente():
    a = mod.PeticionesAgent()
    return a


async def test_clasifica_y_folía():
    agente = _agente()
    agente.llm.complete = fake_complete(_CLASIFICACION_OK)
    res = await agente.handle(
        Task(tipo="clasificar", payload={"texto": "No hay agua en mi colonia"})
    )
    assert res.ok
    assert res.data["clasificacion"]["categoria"] == "agua"
    assert res.data["clasificacion"]["urgencia"] == "alta"
    assert res.data["folio"].startswith("PC-")


async def test_json_con_ruido_se_tolera():
    # El modelo a veces antepone texto; _extraer_json debe rescatar el objeto.
    agente = _agente()
    agente.llm.complete = fake_complete("Claro, aquí tienes:\n" + _CLASIFICACION_OK)
    res = await agente.handle(Task(tipo="clasificar", payload={"texto": "x"}))
    assert res.ok and res.data["clasificacion"]["municipio"] == "Tepic"


async def test_json_invalido_devuelve_error():
    agente = _agente()
    agente.llm.complete = fake_complete("no soy json")
    res = await agente.handle(Task(tipo="clasificar", payload={"texto": "x"}))
    assert not res.ok and "inválida" in (res.error or "")


async def test_texto_vacio_rechazado():
    agente = _agente()
    res = await agente.handle(Task(tipo="clasificar", payload={"texto": "   "}))
    assert not res.ok


async def test_tipo_no_soportado():
    agente = _agente()
    res = await agente.handle(Task(tipo="inventado", payload={"texto": "x"}))
    assert not res.ok


def test_folio_tiene_formato():
    assert mod._nuevo_folio().startswith("PC-")


@pytest.mark.parametrize("ruido", ["```json\n{}\n```", "  {}  "])
def test_extraer_json_varios_envoltorios(ruido):
    assert mod._extraer_json(ruido) == {}
