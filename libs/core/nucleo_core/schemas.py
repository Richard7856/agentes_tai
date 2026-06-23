"""Tipos compartidos entre orquestador, gateway y agentes.

Un único lugar para los contratos evita que agregar agentes obligue a
redefinir estructuras (principio: diseñar para 10).
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class AgentInfo(BaseModel):
    """Identidad que un agente publica en el registro al arrancar (ADR-004)."""

    slug: str
    nombre: str
    descripcion: str = ""
    fase: int = 1
    capabilities: list[str] = Field(default_factory=list)
    endpoint_url: str = ""
    version: str = "0.1.0"


class Task(BaseModel):
    """Unidad de trabajo que el orquestador entrega a un agente."""

    tipo: str
    payload: dict[str, Any] = Field(default_factory=dict)


class Result(BaseModel):
    """Resultado uniforme que devuelve cualquier agente."""

    ok: bool = True
    data: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None


class LLMMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class LLMRequest(BaseModel):
    """Contrato estable hacia el gateway. Los agentes nunca conocen al proveedor."""

    system: str | None = None
    messages: list[LLMMessage]
    max_tokens: int = 4096
    # Pista de sensibilidad para que el gateway decida redacción/proveedor (ADR-002).
    sensibilidad: Literal["sintetico", "interno", "sensible"] = "sintetico"
    # Identificador del agente que origina la llamada (auditoría).
    agente: str | None = None


class LLMResponse(BaseModel):
    text: str
    proveedor: str
    modelo: str
    tokens_in: int = 0
    tokens_out: int = 0
    # Resumen del razonamiento del modelo (para mostrar "cómo piensa" el agente).
    reasoning: str | None = None
