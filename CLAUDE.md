# CLAUDE.md — Núcleo Operativo (interno: ASISTENTES IA LCC)

Contexto permanente del proyecto para sesiones de Claude Code. Léelo antes de
tocar código.

## Qué es

Ecosistema de asistentes de IA para el despacho de una Gobernadora estatal.
Un **Orquestador Ejecutivo** central coordina agentes especializados y un
**tablero ejecutivo único** los presenta.

- **Visión:** 10 agentes coordinados.
- **Arranque (Fase 1, lo que existe AHORA):** 4 agentes + infraestructura base
  + orquestador. Los otros 6 entran en fases posteriores.

## Principio arquitectónico NO NEGOCIABLE

**Diseña para 10 agentes, implementa y dimensiona el cómputo para 4.**

Arquitectura ≠ capacidad. Agregar un agente debe ser *deployment + ajuste de
capacidad*, NUNCA un rediseño. Si una decisión obligaría a refactorizar para
pasar de 4 a 10, es la decisión equivocada — deténte y avisa.

## Los 4 agentes de la Fase 1

1. **agenda-reuniones** — prepara fichas previas a reuniones (objetivo,
   participantes, antecedentes, temas sensibles, posibles acuerdos) y da
   seguimiento.
2. **peticiones-ciudadanas** — recibe, clasifica, folia y canaliza solicitudes;
   registra municipio y urgencia; genera reportes.
3. **pendientes-prioridades** — consolida pendientes y los ordena en una matriz
   urgencia/importancia.
4. **control-acuerdos** — vigila responsables, plazos, evidencias y retrasos;
   extrae acuerdos de documentos (OCR); semáforos y alertas.

## Stack

- **Flujos:** n8n (validar nodos con `search_nodes` + `get_node` antes de
  proponerlos; nunca inventar nodos ni parámetros).
- **Backend de agentes:** Python + FastAPI.
- **LLM:** ver "Estado del LLM" abajo.
- **BD:** PostgreSQL + `pgvector` (RAG documental).
- **Contenedores:** Docker + docker-compose.
- **Red privada:** Tailscale.
- **Tablero:** React + Next.js + TypeScript.

## Estado del LLM (IMPORTANTE — leer antes de tocar `llm-gateway`)

- **Hoy corremos sobre Claude** (`claude-opus-4-8`), aprobado oficialmente, para
  **adelantar desarrollo con datos sintéticos/de prueba**. Aún NO hay servidor
  on-premise ni información real de la Gobernadora.
- **Mañana migramos a Ollama local.** Por eso TODO el cómputo LLM pasa por el
  servicio `llm-gateway`, que es el **único** punto que conoce el proveedor.
  Los agentes NUNCA llaman a Anthropic ni a Ollama directamente — llaman al
  gateway. Migrar = cambiar `LLM_PROVIDER` en `.env`. Cero refactor.

## Soberanía de datos (regla dura antes de conectar datos REALES)

Entorno de gobierno regulado. Antes de conectar CUALQUIER dato real de la
Gobernadora se requiere, sin excepción (ver DECISIONS.md ADR-001):

1. Sign-off escrito del dueño del riesgo (jurídico / despacho).
2. Zero-Data-Retention activado con Anthropic.
3. Redacción de PII en el gateway para datos sensibles.
4. Auditoría completa de llamadas LLM (tabla `llm_audit`).

Mientras solo haya datos sintéticos, estas mitigaciones se documentan pero no
bloquean el desarrollo. **No conectar Google Workspace ni cargar documentos
reales sin cumplir lo anterior.**

## Cómo agregar un agente (patrón plug-in, 4 → 10)

1. Clonar `services/agents/_template/` con el slug del agente nuevo.
2. Implementar la subclase de `BaseAgent` (capabilities + `handle`).
3. Añadir su tabla(s) de dominio en una migración propia (sin tocar el núcleo).
4. Levantar su contenedor en `docker-compose.yml`.
5. Se auto-registra en la tabla `agents` al arrancar; el orquestador lo
   descubre. No se toca orquestador, tablero ni esquema base.

## Convenciones

- **Los comentarios explican el PORQUÉ, nunca el QUÉ.** Cada función lleva una
  línea de propósito.
- **Decisiones de arquitectura → entrada en `DECISIONS.md`** (Contexto /
  Decisión / Alternativas rechazadas / Riesgos / Mejoras).
- **Antes de codear una feature nueva o decisión de arquitectura:** proponer
  enfoque, riesgos y alternativas, y esperar confirmación. Tareas simples (fix,
  config, <20 líneas): directas.
- Documentación clara, modular y evolutiva. Proyecto dividido por fases.

## Estructura del repo

```
libs/core/        Contrato compartido (BaseAgent, cliente del gateway, schemas)
services/
  llm-gateway/    Único punto de contacto con el LLM (proveedor pluggable)
  orchestrator/   Enrutado a agentes vía registro dinámico + consolidación
  ocr/            OCR on-prem (Tesseract/PaddleOCR)
  agents/
    _template/    Plantilla para agentes nuevos
    <4 agentes>/
connectors/       Conectores externos aislados y auditados (Google Workspace)
dashboard/        Next.js + TS (módulo posterior)
db/               Migraciones + seed (catálogos, registro de agentes)
n8n/              Workflows exportados (JSON)
infra/            Tailscale, Ollama (Fase 2)
```

## Cómo correr (vertical slice actual)

```
cp .env.example .env            # poner ANTHROPIC_API_KEY
docker compose up --build       # postgres, gateway, orchestrator, 4 agentes
# probar el agente de peticiones (clasifica con Claude, datos sintéticos):
curl -X POST localhost:8101/handle -H 'content-type: application/json' \
  -d '{"tipo":"clasificar","payload":{"texto":"No hay agua en mi colonia hace 5 días en Tepic"}}'
```
