# DECISIONS.md — Núcleo Operativo

Registro de decisiones de arquitectura (ADR). Formato: Contexto / Decisión /
Alternativas consideradas (con razón de rechazo) / Riesgos y limitaciones /
Oportunidades de mejora.

---

## ADR-001 — Abstracción de LLM: Claude hoy, Ollama después

**Contexto.** La soberanía de datos exige que, en producción con datos reales,
todo el cómputo LLM sea on-premise (Ollama). Pero aún no hay servidor ni
presupuesto, y se aprobó arrancar sobre Claude (API de Anthropic) para adelantar
desarrollo con datos sintéticos. Sin una abstracción, migrar de Claude a Ollama
sería un refactor transversal — justo lo que el principio "diseña para 10,
implementa para 4" prohíbe.

**Decisión.** Introducir un servicio `llm-gateway` como **único** punto de
contacto con cualquier LLM. Los agentes llaman al gateway con un contrato
estable (`/v1/complete`); el gateway despacha al proveedor activo según la
variable `LLM_PROVIDER`. Proveedores pluggable: `claude` (hoy, `claude-opus-4-8`)
y `ollama` (Fase 2). Migrar = cambiar una variable de entorno.

**Alternativas consideradas.**
- *Llamar a la API de Anthropic directamente desde cada agente.* Rechazada:
  acopla 4–10 agentes al proveedor; migrar a Ollama sería refactor masivo.
- *Usar LangChain como capa de abstracción.* Rechazada por ahora: dependencia
  pesada y cambiante para lo que es una interfaz simple; se puede adoptar
  después sin romper el contrato del gateway.

**Riesgos y limitaciones.**
- Con `provider=claude`, los datos salen del entorno institucional. Aceptable
  SOLO con datos sintéticos. Para datos reales aplica ADR-002.
- Diferencias de capacidad entre Claude y el modelo Ollama elegido pueden exigir
  reajuste de prompts al migrar (no de arquitectura).

**Oportunidades de mejora.**
- Enrutado por nivel de tarea (clasificación → modelo barato; razonamiento →
  Opus) configurable en el gateway.
- Caché de prompts y métricas de tokens por agente.

---

## ADR-002 — Mitigaciones de soberanía antes de datos reales

**Contexto.** Mientras se desarrolla con datos sintéticos, usar Claude es
aceptable. Conectar datos reales de la Gobernadora cambia el perfil de riesgo.

**Decisión.** Antes de conectar CUALQUIER dato real se exige: (1) sign-off
escrito del dueño del riesgo, (2) Zero-Data-Retention con Anthropic, (3)
redacción de PII en el gateway, (4) auditoría completa en `llm_audit`. La tabla
`llm_audit` y el hook de redacción se construyen desde ya, apagados/no-op
mientras no haya datos reales.

**Alternativas consideradas.**
- *Esperar a Ollama para todo.* Rechazada: frena la entrega; el equipo quiere
  adelantar y ya hay aprobación para Claude con datos de prueba.

**Riesgos y limitaciones.** Depende de un control de proceso (humano) además del
técnico. Por eso se audita cada llamada.

**Oportunidades de mejora.** Clasificador automático de sensibilidad que decida
proveedor por dato (sensible → Ollama; no sensible → Claude).

---

## ADR-003 — Monorepo

**Contexto.** Un solo equipo, contrato compartido entre agentes, necesidad de
versionado atómico (cambiar el contrato y sus 4 agentes en un commit) y un
`docker-compose` que levante todo.

**Decisión.** Monorepo. `libs/core` aloja el contrato; `services/` los servicios;
build context por servicio apunta a la raíz para compartir `libs/core`.

**Alternativas consideradas.**
- *Multi-repo (uno por agente).* Rechazada: fricción de sincronización de
  versiones del contrato, justo lo que el principio anti-refactor evita. Si un
  agente futuro necesita release propio, se extrae sin costo de diseño.

**Riesgos y limitaciones.** Build contexts más grandes. Mitigado con
`.dockerignore`.

---

## ADR-004 — Registro de agentes / patrón plug-in (diseño para 10)

**Contexto.** Pasar de 4 a 10 agentes no debe tocar orquestador, tablero ni
esquema base.

**Decisión.** Tabla `agents` como registro. Cada agente implementa `BaseAgent`
y se auto-registra al arrancar (slug, endpoint, capabilities, fase, estado). El
orquestador enruta solo a agentes `activo`. Agentes futuros se marcan `planeado`.

**Alternativas consideradas.**
- *Lista de agentes hardcodeada en el orquestador.* Rechazada: cada agente nuevo
  obligaría a editar y redeployar el orquestador.

**Riesgos y limitaciones.** El registro debe mantenerse consistente con los
contenedores vivos (health checks lo resuelven).

**Oportunidades de mejora.** Descubrimiento vía service mesh / DNS interno.

---

## ADR-005 — pgvector dentro de Postgres para RAG

**Contexto.** Las fichas y antecedentes necesitan RAG documental.

**Decisión.** Usar la extensión `pgvector` en el mismo PostgreSQL en lugar de una
base vectorial dedicada.

**Alternativas consideradas.**
- *Qdrant / Weaviate.* Rechazadas para Fase 1: una pieza más de infraestructura
  para un volumen aún pequeño. Se reevalúa si el volumen/latencia lo exige
  (no implica rediseño: el acceso vectorial está detrás del repositorio de
  documentos).

**Riesgos y limitaciones.** pgvector escala peor que motores dedicados a gran
volumen. Aceptable en Fase 1.

---

## ADR-006 — Autenticación: RBAC propio

**Contexto.** No existe directorio institucional (AD/LDAP).

**Decisión.** Gestión propia de usuarios/roles/permisos en Postgres (tablas
`usuarios`, `roles`, `permisos`, …), auth local. Capa de auth desacoplada en
`libs/core/auth` para poder enchufar SSO institucional después sin tocar agentes.

**Alternativas consideradas.**
- *Integrar AD/LDAP ahora.* Rechazada: no existe el directorio.
- *Supabase Auth self-hosted.* En evaluación; solo si aporta valor real sobre
  RBAC propio.

**Riesgos y limitaciones.** Construir auth propia conlleva responsabilidad de
seguridad (hashing, rotación). Mitigado usando librerías probadas.

---

## ADR-007 — Comunicación mediada por el orquestador

**Contexto.** Si los agentes se llaman entre sí directamente, crece el
acoplamiento y agregar agentes obliga a rediseñar integraciones.

**Decisión.** Los agentes no se comunican directamente: toda interacción
inter-agente pasa por el orquestador. n8n orquesta *eventos y tiempos* (cuándo);
el orquestador orquesta *agentes* (quién).

**Alternativas consideradas.**
- *Llamadas directas agente↔agente.* Rechazada por acoplamiento N×N.
- *Bus de eventos (Kafka/Rabbit).* Sobredimensionado para Fase 1; n8n +
  orquestador cubren el caso. Reevaluable.

**Riesgos y limitaciones.** El orquestador es punto central; se mantiene fino
(solo enruta y consolida, sin lógica de negocio de agentes).

---

## ADR-008 — OCR on-premise

**Contexto.** Control de Acuerdos extrae acuerdos de documentos escaneados; los
datos son sensibles.

**Decisión.** OCR on-prem con Tesseract/PaddleOCR en el servicio `ocr`. Ningún
documento sale a servicios de OCR en la nube.

**Alternativas consideradas.**
- *OCR en la nube (Google/AWS Textract).* Rechazada: viola soberanía de datos.

**Riesgos y limitaciones.** Calidad de OCR menor que servicios cloud en
documentos difíciles. Mitigable con preprocesamiento de imagen.
