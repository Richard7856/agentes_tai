# Fases del proyecto

## Fase 1 — AHORA (lo construido)

- Infraestructura base: Postgres+pgvector, llm-gateway, orchestrator, OCR (stub), n8n.
- 4 agentes: agenda-reuniones, peticiones-ciudadanas, pendientes-prioridades, control-acuerdos.
- LLM: **Claude** (`claude-opus-4-8`) vía gateway, con **datos sintéticos**.
- Registro de los 10 agentes en BD (4 activos, 6 planeados).

### Pendiente dentro de Fase 1 (próximos módulos)
- Tablero Next.js + TS.
- Persistencia real de cada agente en sus tablas de dominio.
- OCR real (Tesseract/PaddleOCR) + RAG documental con pgvector.
- Conector Google Workspace aislado y auditado.
- Workflows n8n (validar nodos con `search_nodes`+`get_node`).
- Auth RBAC operativa (login en tablero).
- Persistir `llm_audit` desde el gateway.

## Fase 2 — Migración a Ollama (requiere servidor on-premise)

- Levantar `docker-compose.ollama.yml`, `LLM_PROVIDER=ollama`.
- Dimensionar GPU (ver más abajo).
- **Antes de datos reales:** cumplir ADR-002 (sign-off, ZDR mientras siga
  Claude para algo, redacción PII, auditoría).

## Fases 3+ — Agentes 5 a 10

- Cada uno: clonar `_template`, implementar, migración de dominio, contenedor.
- Sin tocar orquestador, tablero ni esquema base (ADR-004).

## Dimensionamiento (cuando haya presupuesto de servidor)

Borrador a afinar con el modelo Ollama elegido:
- **4 agentes, 7–14B cuantizado:** 1 GPU 16–24 GB (p. ej. RTX 4090 / A5000).
- **Margen a 10 agentes:** colas en el gateway o 2ª GPU; es ajuste de capacidad,
  no rediseño.
