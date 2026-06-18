# Núcleo Operativo (ASISTENTES IA LCC)

Ecosistema de asistentes de IA para el despacho de una Gobernadora estatal.
Orquestador central + agentes especializados + tablero ejecutivo.

> **Diseñado para 10 agentes, implementado para 4** (Fase 1). Ver `CLAUDE.md`
> para el contexto completo y `DECISIONS.md` para las decisiones de arquitectura.

## Estado actual

Infraestructura base + *vertical slice* funcional: el agente de **peticiones
ciudadanas** clasifica una solicitud de prueba usando Claude a través del
`llm-gateway`. Sirve para "ver cómo trabajan los modelos" antes de tener el
servidor on-premise y los datos reales.

**LLM:** Claude (`claude-opus-4-8`) hoy, con datos sintéticos. Migración a
Ollama local = cambiar `LLM_PROVIDER` (ver ADR-001). **No conectar datos reales
sin cumplir ADR-002.**

## Correr

```bash
cp .env.example .env          # editar: ANTHROPIC_API_KEY, contraseñas
docker compose up --build
```

Servicios y puertos:

| Servicio          | Puerto | Qué es                                  |
|-------------------|--------|-----------------------------------------|
| postgres          | 5432   | BD + pgvector                           |
| llm-gateway       | 8000   | Único contacto con el LLM               |
| orchestrator      | 8001   | Registro y enrutado de agentes          |
| ocr               | 8002   | OCR on-prem (stub)                      |
| agent-peticiones  | 8101   | Clasifica/folía peticiones (demo Claude)|
| agent-agenda      | 8102   | Fichas de reunión (stub)                |
| agent-pendientes  | 8103   | Matriz urgencia/importancia (stub)      |
| agent-acuerdos    | 8104   | Control de acuerdos (stub)              |
| n8n               | 5678   | Flujos                                  |

## Probar el slice (Claude, datos sintéticos)

```bash
curl -s -X POST localhost:8101/handle -H 'content-type: application/json' -d '{
  "tipo": "clasificar",
  "payload": {"texto": "No hay agua en mi colonia hace 5 días, vivo en Tepic"}
}' | jq
```

Ver agentes registrados en el orquestador:

```bash
curl -s localhost:8001/agents | jq
```

## Estructura

Ver `CLAUDE.md` → "Estructura del repo".
