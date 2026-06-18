"""Contrato compartido del Núcleo Operativo (ver CLAUDE.md y ADR-004)."""

from .schemas import (
    AgentInfo,
    Task,
    Result,
    LLMMessage,
    LLMRequest,
    LLMResponse,
)
from .agent_base import BaseAgent, build_agent_app
from .llm_client import GatewayClient

__all__ = [
    "AgentInfo",
    "Task",
    "Result",
    "LLMMessage",
    "LLMRequest",
    "LLMResponse",
    "BaseAgent",
    "build_agent_app",
    "GatewayClient",
]
