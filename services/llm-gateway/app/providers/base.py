"""Interfaz común de proveedor LLM.

Cualquier proveedor (Claude, Ollama, …) implementa `complete`. El gateway elige
uno según LLM_PROVIDER; los agentes nunca lo saben (ADR-001).
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from nucleo_core.schemas import LLMRequest, LLMResponse


class LLMProvider(ABC):
    nombre: str

    @abstractmethod
    async def complete(self, req: LLMRequest) -> LLMResponse:
        """Genera una respuesta a partir del contrato estable LLMRequest."""
        raise NotImplementedError
