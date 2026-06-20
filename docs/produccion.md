# Cómo subir a producción

La solución es **cloud-agnóstica**: contenedores Docker orquestados por
`docker compose`. Esto da dos caminos de producción que comparten el mismo
código; se empieza por el simple y se evoluciona al escalable **sin refactor**.

## Camino A — un servidor (rápido, para arrancar)

Un EC2 (o cualquier VM) con Docker:

```bash
git clone <repo> && cd nucleo-operativo
cp .env.example .env          # secretos reales (ver "Secretos" abajo)
docker compose up -d --build
```

- Más simple, ideal para la **primera demo en producción** y datos sintéticos.
- Postgres corre como contenedor con volumen persistente.
- Limitación: una sola máquina (sin alta disponibilidad ni autoescalado).

## Camino B — AWS administrado (escalable, preferencia del equipo de infra)

Misma imagen por servicio, desplegada en servicios administrados de AWS:

| Pieza del sistema | Servicio AWS |
|---|---|
| Dashboard, orquestador, gateway, 4 agentes, OCR, n8n | **ECS/Fargate** (un servicio por contenedor) |
| Entrada HTTP | **ALB** (Application Load Balancer) + Route 53 |
| Base de datos + **RAG** | **RDS PostgreSQL** con extensión **pgvector** |
| Imágenes de contenedor | **ECR** |
| Secretos (`ANTHROPIC_API_KEY`, credenciales BD) | **Secrets Manager** / SSM |
| Logs/métricas | **CloudWatch** |

**Punto importante para alinear con infra:** RDS PostgreSQL **soporta pgvector**,
así que la BD relacional que ella quiere y el almacén vectorial del RAG son **la
misma base** — no son dos sistemas. El RAG no añade una pieza nueva de infra:
añade una extensión y unas tablas (que ya están en `db/migrations`).

### Pasos (Camino B)
1. Crear RDS PostgreSQL; `CREATE EXTENSION vector;` y aplicar `db/migrations` + `db/seed`.
2. Construir y subir imágenes a ECR (una por servicio).
3. Definir task definitions + services en ECS; variables de entorno desde
   Secrets Manager (mismas llaves que `.env.example`).
4. ALB → dashboard (público) y orquestador (interno); agentes/gateway en red
   privada (no expuestos a internet).
5. n8n con su base en la misma RDS.

## CI/CD (recomendado)

GitHub Actions: en cada push a `main` → `pytest` → build de imágenes → push a
ECR → actualizar servicios ECS. El tablero corre `npm run build` en su pipeline.
Esto encaja con que infra opere el despliegue mientras el núcleo IA se mantiene
en el repo.

## Secretos

Nunca en el repo. En producción:
- `ANTHROPIC_API_KEY`, `PG_PASSWORD`, `N8N_ENCRYPTION_KEY` → Secrets Manager.
- El `llm-gateway` es el único que necesita la llave de Claude (ADR-001).

## Migración a Ollama (cuando haya servidor/GPU)

- Levantar Ollama en EC2 con GPU o en el servidor on-prem.
- `LLM_PROVIDER=ollama` (+ `docker-compose.ollama.yml` en Camino A).
- Cero cambios en agentes, orquestador o tablero.

## Puerta de soberanía (antes de datos reales) — ADR-002

AWS + Claude es aceptable **solo con datos sintéticos**. Antes de conectar datos
reales de la Gobernadora, decisión de liderazgo + requisitos:
1. Sign-off escrito del dueño del riesgo.
2. Zero-Data-Retention con Anthropic (mientras siga Claude) **o** ya estar en Ollama.
3. Redacción de PII activa en el gateway.
4. Auditoría `llm_audit` persistida.
5. Evaluar región/cuenta AWS con controles de gobierno, o mover el cómputo
   sensible on-premise.

Esta puerta es **independiente** de la elección AWS: es sobre qué datos cruzan a
un tercero, no sobre dónde corren los contenedores.
