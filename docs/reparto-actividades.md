# Reparto de actividades (equipo de 2)

Objetivo: dividir el trabajo aprovechando las dos fortalezas —**núcleo IA-first**
y **infra/automatización no-code**— sin que se pisen, con liderazgo técnico
único.

## Roles

- **Líder técnico / IA-first (tú).** Autoridad de arquitectura y decisiones
  técnicas. Dueño del **núcleo IA**: agentes, `llm-gateway`, prompts, RAG,
  evaluaciones, el contrato `libs/core` y el dashboard. Define el esquema de BD
  y revisa los cambios (merge).
- **Infra + automatización no-code (ella).** Dueña del **hosting y la operación**:
  AWS (ECS/RDS/redes/secretos), despliegue/CI-CD, y los **flujos no-code en
  n8n** (intake, conectores, disparadores). Opera la BD que el núcleo define.

> No es 50/50: el liderazgo técnico y la dirección de arquitectura son tuyos.
> Ella tiene autonomía dentro de su capa (infra y n8n), bajo los contratos que
> define el núcleo.

## Cómo conviven AWS, no-code e IA-first (sin conflicto)

| Su preferencia | Cómo encaja en esta arquitectura |
|---|---|
| **AWS** | Es el *host*. Nuestros contenedores corren en ECS/EC2; la BD en RDS. No cambia el diseño (cloud-agnóstico). |
| **Usar BD** | RDS PostgreSQL **es** nuestra BD **y** el almacén RAG (pgvector). Una sola base, no dos. |
| **No-code** | **n8n es su capa.** Intake de formularios, Google Workspace, cron de semáforos/alertas — sin escribir Python. |
| **IA-first (tú)** | El núcleo (agentes + gateway + RAG) es código IA-first y es tuyo. n8n lo **alimenta**, no lo sustituye. |

**La frontera clara:** n8n mueve *eventos y datos* hacia el sistema; los
**agentes** son los que *razonan*. Si una tarea requiere criterio (clasificar,
priorizar, redactar una ficha), es un agente IA — no un flujo no-code.

## Matriz RACI (R=hace, A=aprueba/responsable, C=consultado, I=informado)

| Actividad | Tú (líder/IA) | Ella (infra/no-code) |
|---|---|---|
| Arquitectura y ADRs | R/A | C |
| `libs/core` (contrato) | R/A | I |
| Agentes, prompts, evals | R/A | I |
| `llm-gateway` y modelos | R/A | C |
| RAG (embeddings, recuperación) | R/A | C (RDS/pgvector) |
| Dashboard (Next.js) | R/A | I |
| Esquema de BD | R/A (define) | R (opera en RDS) |
| Infra AWS (ECS/RDS/redes/secretos) | C/A | R |
| CI/CD y despliegue | C/A | R |
| Flujos n8n (intake, Google, alertas) | C/A | R |
| Conector Google Workspace | A | R |
| Soberanía de datos / sign-off | R/A | C |

## Reparto inmediato (próximas semanas)

**Tú (núcleo IA):**
1. RAG: `/v1/embed` + recuperación + cablear agenda-reuniones (ver `docs/rag.md`).
2. Profundizar agentes (persistencia real en sus tablas).
3. Ampliar evals conforme se ajusten prompts.

**Ella (infra + no-code):**
1. Montar AWS Camino B: ECR + ECS + RDS (con pgvector) + Secrets Manager (ver `docs/produccion.md`).
2. CI/CD (GitHub Actions → ECR → ECS), corriendo `pytest` en el pipeline.
3. Flujos n8n: formulario de intake de peticiones → orquestador; cron de
   semáforos de acuerdos → alertas. (Validar nodos con `search_nodes`+`get_node`.)

**Juntos / contrato:**
- El esquema de BD lo defines tú en `db/migrations`; ella lo aplica en RDS.
- Los flujos n8n llaman a las **APIs del orquestador** ya definidas: ese es el
  límite donde su capa y la tuya se tocan.

## Qué demostrar en la reunión

1. `docs/arquitectura.md` — diagramas 1 y 2: la solución completa y qué está hecho.
2. Demo en vivo: `docker compose up` → tablero → clasificar una petición con Claude.
3. `pytest` (verde) — calidad ya cubierta.
4. `docs/produccion.md` — que su mundo AWS encaja sin fricción.
5. Este documento — el reparto y el liderazgo.
