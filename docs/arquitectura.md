# Arquitectura — diagramas de la solución

Diagramas en Mermaid (se renderizan en GitHub). Pensados para explicar el
sistema a quien se integre al equipo: cómo se comunican los agentes, dónde entra
el RAG, qué está hecho y qué falta.

> Lectura rápida: el **orquestador** reparte trabajo a los **agentes**; los
> agentes piensan a través del **llm-gateway** (único punto de modelos) y
> consultan el **RAG** (pgvector). El **dashboard** presenta todo. **n8n** es la
> capa no-code que dispara flujos. La frontera de **soberanía** separa lo
> on-premise de la API externa de Claude (hoy) → Ollama local (mañana).

---

## 1. Solución completa (visión Fase 1)

```mermaid
flowchart TB
    U["Despacho / Gobernadora<br/>(usuarios)"] --> DASH["Dashboard<br/>Next.js + TS"]

    subgraph CORE["Entorno institucional · on-premise / nube privada"]
        DASH -->|"REST · patrón BFF"| ORCH["Orquestador<br/>FastAPI · registro dinámico"]
        ORCH -->|"despacha por slug"| A1["Agente<br/>Agenda"]
        ORCH --> A2["Agente<br/>Peticiones"]
        ORCH --> A3["Agente<br/>Pendientes"]
        ORCH --> A4["Agente<br/>Acuerdos"]

        A1 & A2 & A3 & A4 -->|"/v1/complete + /v1/embed"| GW["llm-gateway<br/>único punto de modelos"]
        A1 & A4 -->|"recupera contexto"| RAG["Recuperación RAG"]
        RAG --> PG[("PostgreSQL<br/>+ pgvector")]

        ORCH --> PG
        GW -->|"auditoría de llamadas"| PG

        N8N["n8n<br/>flujos no-code"] -->|"dispara tareas"| ORCH
        OCR["OCR on-prem<br/>Tesseract/PaddleOCR"] --> ING["Ingesta<br/>chunk + embed"]
        ING --> PG
        ING -->|"embeddings"| GW
    end

    F1["Carga manual<br/>formularios"] --> N8N
    F2["Google Workspace<br/>calendario / correo"] --> N8N
    F3["PDFs escaneados"] --> OCR

    GW -.->|"HOY · datos sintéticos"| CLAUDE["Claude API<br/>claude-opus-4-8"]
    GW -->|"MAÑANA · on-prem"| OLLAMA["Ollama local<br/>llama / qwen"]

    classDef ext fill:#fef9c3,stroke:#ca8a04,color:#713f12;
    class CLAUDE ext;
    classDef local fill:#e0e7ff,stroke:#6366f1,color:#312e81;
    class OLLAMA local;
```

**Lo clave para la nueva integrante:**
- Los agentes **nunca** se llaman entre sí ni llaman al modelo directo. Todo pasa
  por el **orquestador** (coordinación) y el **gateway** (modelos). Eso permite
  sumar agentes sin rediseñar (4 → 10).
- El **RAG no es una herramienta no-code**: es parte del núcleo IA. Vive sobre
  **pgvector** (la misma BD), y los embeddings se calculan **on-prem** en el
  gateway. Por eso el corpus documental no sale del entorno.
- **n8n es la capa no-code** y alimenta al sistema (intake de formularios,
  Google Workspace, disparadores por tiempo); **no reemplaza a los agentes**.

---

## 2. Estado actual — qué tenemos vs qué falta

```mermaid
flowchart TB
    DASH["Dashboard: Resumen + Peticiones"]:::ok
    ORCH["Orquestador: registro + dispatch"]:::ok
    GW["llm-gateway: proveedor Claude /v1/complete"]:::ok
    A2["Agente Peticiones (completo)"]:::ok
    A134["Agentes Agenda/Pendientes/Acuerdos (stubs)"]:::ok
    PG[("Postgres: esquema 10 agentes + seed")]:::ok
    TESTS["Pruebas unitarias + evals de los 4 agentes"]:::ok

    EMBED["/v1/embed + RAG (recuperación)"]:::falta
    INGEST["Ingesta + chunking"]:::falta
    OCRR["OCR real (Tesseract/PaddleOCR)"]:::falta
    N8NF["Flujos n8n (intake, Google, semáforos)"]:::falta
    GAUTH["Auth RBAC en el tablero"]:::falta
    AUDIT["Persistir llm_audit en BD"]:::falta
    PROD["Despliegue a producción (AWS)"]:::falta
    OLL["Migración a Ollama"]:::falta

    classDef ok fill:#d1fae5,stroke:#10b981,color:#064e3b;
    classDef falta fill:#fee2e2,stroke:#ef4444,stroke-dasharray:4 4,color:#7f1d1d;
```

🟩 verde = hecho y verificado · 🟥 rojo punteado = pendiente.

---

## 3. Flujo que YA funciona — clasificar una petición

```mermaid
sequenceDiagram
    actor Op as Operador
    participant D as Dashboard
    participant O as Orquestador
    participant Ag as Agente Peticiones
    participant G as llm-gateway
    participant C as Claude

    Op->>D: Escribe la petición ciudadana
    D->>O: POST /agents/peticiones-ciudadanas/dispatch
    O->>Ag: /handle {tipo: clasificar}
    Ag->>G: /v1/complete (prompt + texto)
    G->>C: messages.create (claude-opus-4-8)
    C-->>G: JSON {categoria, urgencia, ...}
    G-->>Ag: respuesta + tokens
    Ag-->>O: {folio, clasificación}
    O-->>D: resultado
    D-->>Op: Folio + urgencia + dependencia sugerida
```

---

## 4. Flujo que FALTA — ficha de reunión con RAG

```mermaid
sequenceDiagram
    participant ING as Ingesta
    participant G as llm-gateway (/v1/embed)
    participant PG as pgvector
    participant Ag as Agente Agenda
    participant C as Claude

    note over ING,PG: Ingesta (una vez por documento)
    ING->>G: embed(fragmentos del documento)
    G-->>ING: vectores
    ING->>PG: guarda chunks + embeddings

    note over Ag,C: Consulta (al preparar la ficha)
    Ag->>G: embed("antecedentes de la reunión X")
    G-->>Ag: vector de consulta
    Ag->>PG: búsqueda top-k por similitud
    PG-->>Ag: fragmentos relevantes
    Ag->>G: /v1/complete (prompt + fragmentos)
    G->>C: genera la ficha
    C-->>Ag: ficha con antecedentes citados
```

---

## 5. Despliegue en producción (AWS)

Ver `docs/produccion.md` para el detalle. Resumen visual:

```mermaid
flowchart TB
    subgraph AWS["Cuenta AWS (host de los contenedores)"]
        ALB["Application Load Balancer"] --> DASHc["Dashboard (ECS/Fargate)"]
        ALB --> ORCHc["Orquestador (ECS)"]
        ORCHc --> AGc["Agentes x4 (ECS)"]
        AGc --> GWc["llm-gateway (ECS)"]
        AGc --> RDS[("RDS PostgreSQL<br/>+ pgvector")]
        GWc --> RDS
        N8Nc["n8n (ECS)"] --> ORCHc
        SM["Secrets Manager<br/>ANTHROPIC_API_KEY, BD"] --> GWc
        ECR["ECR (imágenes)"] -.-> AGc
    end

    GWc -.->|"hoy"| CLAUDE["Claude API"]
    GWc -->|"mañana"| GPU["EC2/GPU o servidor on-prem<br/>Ollama"]

    classDef ext fill:#fef9c3,stroke:#ca8a04;
    class CLAUDE ext;
```

> **La arquitectura es cloud-agnóstica:** los mismos contenedores corren en un
> EC2 con `docker compose` (rápido) o en ECS/Fargate (escalable). AWS es el
> *dónde*, no cambia el *qué*. La frontera de soberanía (ADR-001/002) se respeta
> igual: con datos reales, el `llm-gateway` apunta a Ollama y el corpus RAG
> permanece en la BD.
