"""Proveedor Ollama (on-premise). Destino de la migración en Fase 2 (ADR-001).

Implementado y listo, pero solo se instancia si LLM_PROVIDER=ollama. Cuando
exista el servidor con GPU, esto pasa a ser el proveedor por defecto sin tocar
ningún agente.
"""

from __future__ import annotations

import os

import httpx

from nucleo_core.schemas import LLMRequest, LLMResponse

from .base import LLMProvider


class OllamaProvider(LLMProvider):
    nombre = "ollama"

    def __init__(self) -> None:
        self.base_url = os.environ.get("OLLAMA_BASE_URL", "http://ollama:11434")
        self.model = os.environ.get("OLLAMA_MODEL", "llama3.1:8b")

    async def complete(self, req: LLMRequest) -> LLMResponse:
        # Ollama /api/chat acepta roles system/user/assistant.
        messages = []
        if req.system:
            messages.append({"role": "system", "content": req.system})
        messages.extend(m.model_dump() for m in req.messages)

        async with httpx.AsyncClient(timeout=300) as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json={"model": self.model, "messages": messages, "stream": False},
            )
            resp.raise_for_status()
            body = resp.json()

        return LLMResponse(
            text=body.get("message", {}).get("content", ""),
            proveedor=self.nombre,
            modelo=self.model,
            tokens_in=body.get("prompt_eval_count", 0),
            tokens_out=body.get("eval_count", 0),
        )
