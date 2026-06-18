"""llm-gateway — único punto de contacto con el LLM (ADR-001).

Selecciona el proveedor por LLM_PROVIDER, aplica redacción de PII (ADR-002) y
deja traza de auditoría. Los agentes solo conocen este contrato.
"""

from __future__ import annotations

import logging
import os

from fastapi import FastAPI

from nucleo_core.schemas import LLMRequest, LLMResponse

from .providers.claude import ClaudeProvider
from .providers.ollama import OllamaProvider
from .redaction import redact

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("llm-gateway")

_PROVIDERS = {"claude": ClaudeProvider, "ollama": OllamaProvider}


def _load_provider():
    """Instancia el proveedor activo (propósito: aislar el resto del proveedor)."""
    name = os.environ.get("LLM_PROVIDER", "claude").lower()
    if name not in _PROVIDERS:
        raise RuntimeError(f"LLM_PROVIDER desconocido: {name}")
    return _PROVIDERS[name]()


app = FastAPI(title="llm-gateway")
provider = _load_provider()


@app.get("/health")
async def health() -> dict:
    return {"ok": True, "proveedor": provider.nombre}


@app.post("/v1/complete", response_model=LLMResponse)
async def complete(req: LLMRequest) -> LLMResponse:
    # Redacción previa a la salida externa (no-op con datos sintéticos).
    hubo_redaccion = False
    for m in req.messages:
        m.content, changed = redact(m.content)
        hubo_redaccion = hubo_redaccion or changed
    if req.system:
        req.system, changed = redact(req.system)
        hubo_redaccion = hubo_redaccion or changed

    resp = await provider.complete(req)

    # Auditoría mínima (ADR-002). TODO: persistir en tabla llm_audit.
    log.info(
        "llm_call agente=%s proveedor=%s modelo=%s tokens=%d/%d redactado=%s sens=%s",
        req.agente,
        resp.proveedor,
        resp.modelo,
        resp.tokens_in,
        resp.tokens_out,
        hubo_redaccion,
        req.sensibilidad,
    )
    return resp
