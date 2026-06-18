"""Utilidades de prueba compartidas.

Permite cargar el módulo de cada agente de forma aislada (evita el choque de
nombres entre los varios `app/main.py`) y fabricar un gateway falso para
pruebas deterministas sin API key.
"""

from __future__ import annotations

import importlib.util
import os
import pathlib
from types import ModuleType

from nucleo_core import LLMResponse

ROOT = pathlib.Path(__file__).resolve().parents[1]


def load_agent_module(slug: str) -> ModuleType:
    """Carga services/agents/<slug>/app/main.py bajo un nombre único."""
    # El cliente del gateway exige GATEWAY_URL al construirse; en pruebas no se usa.
    os.environ.setdefault("GATEWAY_URL", "http://test-gateway")
    path = ROOT / "services" / "agents" / slug / "app" / "main.py"
    mod_name = "agent_" + slug.replace("-", "_")
    spec = importlib.util.spec_from_file_location(mod_name, path)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def fake_complete(text: str):
    """Devuelve un `complete` async que ignora la entrada y responde `text`.

    Sustituye a GatewayClient.complete para aislar la lógica del agente del LLM.
    """

    async def _complete(**_kwargs) -> LLMResponse:
        return LLMResponse(text=text, proveedor="fake", modelo="fake-test")

    return _complete
