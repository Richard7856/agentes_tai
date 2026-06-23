"""Lógica de pendientes, acuerdos y agenda (salida estructurada), gateway falso."""

from __future__ import annotations

from helpers import fake_complete, load_agent_module

from nucleo_core import Task


async def test_pendientes_evalua_y_normaliza_cuadrante():
    mod = load_agent_module("pendientes-prioridades")
    agente = mod.PendientesAgent()
    # El modelo devuelve JSON; el cuadrante puede venir capitalizado.
    agente.llm.complete = fake_complete(
        '{"cuadrante":"Hacer","urgencia":5,"importancia":5,"justificacion":"urge"}'
    )
    res = await agente.handle(Task(tipo="priorizar", payload={"texto": "urge firmar"}))
    assert res.ok
    assert res.data["evaluacion"]["cuadrante"] == "hacer"
    assert res.data["evaluacion"]["urgencia"] == 5


async def test_pendientes_tipo_invalido():
    mod = load_agent_module("pendientes-prioridades")
    res = await mod.PendientesAgent().handle(Task(tipo="x", payload={}))
    assert not res.ok


async def test_acuerdos_extrae_estructurado():
    mod = load_agent_module("control-acuerdos")
    agente = mod.AcuerdosAgent()
    agente.llm.complete = fake_complete(
        '{"acuerdos":[{"responsable":"Juan Pérez","compromiso":"entregar informe",'
        '"fecha":"2026-08-15","dependencia":"Salud","semaforo":"verde"}]}'
    )
    res = await agente.handle(Task(tipo="extraer_acuerdos", payload={"texto": "acta..."}))
    assert res.ok
    acuerdos = res.data["extraccion"]["acuerdos"]
    assert acuerdos[0]["responsable"] == "Juan Pérez"


async def test_agenda_genera_ficha_estructurada():
    mod = load_agent_module("agenda-reuniones")
    agente = mod.AgendaAgent()
    agente.llm.complete = fake_complete(
        '{"objetivo":"alinear la obra hídrica","participantes":[{"nombre":"X","rol":"Y"}],'
        '"antecedentes":["a"],"temas_sensibles":[],"riesgos":[],"puntos_agenda":[],'
        '"posibles_acuerdos":[]}'
    )
    res = await agente.handle(Task(tipo="preparar_ficha", payload={"tema": "obra hídrica"}))
    assert res.ok
    assert "hídrica" in res.data["ficha"]["objetivo"]
    assert res.data["ficha"]["participantes"][0]["rol"] == "Y"
