"""Lógica de pendientes, acuerdos y agenda, con gateway falso."""

from __future__ import annotations

from helpers import fake_complete, load_agent_module

from nucleo_core import Task


async def test_pendientes_normaliza_cuadrante():
    mod = load_agent_module("pendientes-prioridades")
    agente = mod.PendientesAgent()
    # El modelo puede responder con mayúsculas/espacios; el agente normaliza.
    agente.llm.complete = fake_complete("  Hacer  ")
    res = await agente.handle(Task(tipo="priorizar", payload={"texto": "urge firmar"}))
    assert res.ok and res.data["cuadrante"] == "hacer"


async def test_pendientes_tipo_invalido():
    mod = load_agent_module("pendientes-prioridades")
    res = await mod.PendientesAgent().handle(Task(tipo="x", payload={}))
    assert not res.ok


async def test_acuerdos_extrae_texto():
    mod = load_agent_module("control-acuerdos")
    agente = mod.AcuerdosAgent()
    agente.llm.complete = fake_complete("- Juan entrega informe el 10 de julio")
    res = await agente.handle(
        Task(tipo="extraer_acuerdos", payload={"texto": "acta..."})
    )
    assert res.ok and "Juan" in res.data["acuerdos"]


async def test_agenda_genera_ficha():
    mod = load_agent_module("agenda-reuniones")
    agente = mod.AgendaAgent()
    agente.llm.complete = fake_complete("Objetivo: alinear obra hídrica")
    res = await agente.handle(
        Task(tipo="preparar_ficha", payload={"tema": "obra hídrica"})
    )
    assert res.ok and "Objetivo" in res.data["ficha_borrador"]
