"""Proveedor Claude (Anthropic). Activo en Fase 1 con datos sintéticos.

Usa Opus 4.8 con adaptive thinking. Es el ÚNICO archivo del sistema que importa
el SDK de Anthropic — esa es la razón de ser del gateway (ADR-001).
"""

from __future__ import annotations

import os

from anthropic import AsyncAnthropic

from nucleo_core.schemas import LLMRequest, LLMResponse

from .base import LLMProvider


class ClaudeProvider(LLMProvider):
    nombre = "claude"

    def __init__(self) -> None:
        # Cliente asíncrono para no bloquear el event loop. Lee ANTHROPIC_API_KEY del entorno.
        self.client = AsyncAnthropic()
        self.model = os.environ.get("ANTHROPIC_MODEL", "claude-opus-4-8")

    async def complete(self, req: LLMRequest) -> LLMResponse:
        kwargs: dict = {
            "model": self.model,
            "max_tokens": req.max_tokens,
            "thinking": {"type": "adaptive"},
            "messages": [m.model_dump() for m in req.messages],
        }
        if req.system:
            kwargs["system"] = req.system

        resp = await self.client.messages.create(**kwargs)

        text = "".join(b.text for b in resp.content if b.type == "text")
        return LLMResponse(
            text=text,
            proveedor=self.nombre,
            modelo=self.model,
            tokens_in=resp.usage.input_tokens,
            tokens_out=resp.usage.output_tokens,
        )
