"""Cliente que usan los agentes para hablar con el LLM.

Su única responsabilidad es llamar al `llm-gateway`. Así ningún agente importa
el SDK de Anthropic ni el de Ollama: migrar de proveedor no toca a los agentes
(ADR-001).
"""

from __future__ import annotations

import os

import httpx

from .schemas import LLMMessage, LLMRequest, LLMResponse


class GatewayClient:
    """Wrapper delgado sobre el endpoint /v1/complete del gateway."""

    def __init__(self, base_url: str | None = None, agente: str | None = None):
        self.base_url = (base_url or os.environ["GATEWAY_URL"]).rstrip("/")
        self.agente = agente

    async def complete(
        self,
        *,
        user: str,
        system: str | None = None,
        max_tokens: int = 4096,
        sensibilidad: str = "sintetico",
    ) -> LLMResponse:
        """Envía un prompt simple (un turno de usuario) y devuelve la respuesta."""
        req = LLMRequest(
            system=system,
            messages=[LLMMessage(role="user", content=user)],
            max_tokens=max_tokens,
            sensibilidad=sensibilidad,  # type: ignore[arg-type]
            agente=self.agente,
        )
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{self.base_url}/v1/complete", json=req.model_dump()
            )
            resp.raise_for_status()
            return LLMResponse(**resp.json())
