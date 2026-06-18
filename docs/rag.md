# RAG documental — Plan (PROPUESTA, pendiente de visto bueno)

> Estado: **propuesta**. No implementado aún. Ver discusión en el chat de diseño.

## Objetivo por agente (Fase 1)

- **agenda-reuniones** (principal): antecedentes para la ficha (minutas, acuerdos,
  perfiles de participantes).
- **control-acuerdos**: documento de origen de un acuerdo y acuerdos relacionados.
- **peticiones-ciudadanas** (opcional): precedentes por municipio/tema.
- **pendientes-prioridades**: poco uso (datos estructurados, no documentales).

## Decisión central: embeddings locales desde el día 1

Los embeddings corren on-premise aunque la generación siga en Claude. Así el
**corpus nunca sale**; solo el contexto recuperado viaja a Claude en la
generación (sujeto a ADR-002 cuando haya datos reales).

- **Modelo:** `intfloat/multilingual-e5-base` (768 dim, multilingüe, CPU).
  Coincide con `documento_chunks.embedding vector(768)`.
- **Ubicación:** endpoint `/v1/embed` en `llm-gateway` (único punto de cómputo de
  modelos). Separable a servicio propio si pesa.
- **Almacén:** pgvector + índice (`hnsw`/`ivfflat`) + metadatos de filtrado.

## Pipeline

1. **Ingesta:** fuente (carga manual → luego OCR) → normaliza → *chunking*
   (~500 tokens, solape ~50) → `/v1/embed` → guarda en `documento_chunks`.
2. **Recuperación:** query → `/v1/embed` (prefijo `query:`) → top-k por similitud
   → arma prompt con fragmentos → gateway genera.

## Qué se ocupa

- `sentence-transformers` + modelo e5 (descarga ~400 MB, una vez).
- `/v1/embed` en gateway + `embed()` en `libs/core`.
- Índice vectorial + filtros de metadatos (nueva migración).
- Módulo de recuperación compartido.

## Riesgos

- Datos reales: los fragmentos recuperados cruzan a Claude en la generación →
  aplica ADR-002. El corpus permanece on-prem.
- e5 requiere prefijos `query:`/`passage:` → encapsular en el gateway.

## Orden de implementación propuesto

1. `/v1/embed` + índice pgvector.
2. Ingesta manual + recuperación.
3. Cablear agenda-reuniones a RAG.
