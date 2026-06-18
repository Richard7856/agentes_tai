"""Redacción de PII antes de salir al proveedor externo (ADR-002).

No-op mientras LLM_REDACT_PII=off (solo datos sintéticos). Se activa antes de
conectar datos reales con Claude. Hoy cubre patrones obvios; se ampliará con un
clasificador de sensibilidad.
"""

from __future__ import annotations

import os
import re

# Patrones MX básicos: CURP, RFC, teléfonos de 10 dígitos, correos.
_PATTERNS = [
    (re.compile(r"\b[A-Z]{4}\d{6}[A-Z0-9]{8}\b"), "[CURP]"),
    (re.compile(r"\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b"), "[RFC]"),
    (re.compile(r"\b\d{10}\b"), "[TEL]"),
    (re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+"), "[EMAIL]"),
]


def redact(text: str) -> tuple[str, bool]:
    """Devuelve (texto_redactado, hubo_cambios)."""
    if os.environ.get("LLM_REDACT_PII", "off").lower() != "on":
        return text, False
    redacted = text
    for pattern, tag in _PATTERNS:
        redacted = pattern.sub(tag, redacted)
    return redacted, redacted != text
