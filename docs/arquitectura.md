# Arquitectura — diagramas de la solución

Diagramas en Mermaid (se renderizan en GitHub). Pensados para explicar el
sistema a quien se integre al equipo: cómo se comunican los agentes, dónde entra
el RAG, cómo entran los roles, qué está hecho y qué falta.

> **TL;DR.** En **producción** todo corre en un **servidor privado con IA local
> (Ollama)** y el dato **no sale**. **Claude se usa solo en desarrollo** con datos
> sintéticos. Los usuarios entran por el **tablero**, filtrados por **roles
> (RBAC)**. El **orquestador** reparte trabajo a los **agentes**; los agentes
> piensan vía el **llm-gateway** (único punto de modelos) y consultan el **RAG**
> (recuperación sobre pgvector). **n8n** es la capa no-code que alimenta el
> sistema. **El RAG no entrena el modelo**: busca y entrega fragmentos en el
> momento de cada pregunta.

**Leyenda:** 🟦 IA local (Ollama) · 🟨 externo, solo desarrollo (Claude) ·
🟩 hecho · 🟥 pendiente · ⬛ datos (pgvector).

---

## 1. Solución completa (producción: IA local + roles)

```mermaid
flowchart TB
    U["Gobernadora · Secretaría Particular · Equipo del despacho"]
    RBAC["Identidad y Roles · RBAC<br/>quién entra y qué ve"]
    DASH["Dashboard único"]
    U --> RBAC --> DASH

    subgraph PRIV["Servidor privado · datacenter MX · el dato NO sale"]
        ORCH["Orquestador"]
        A1["Agenda"]
        A2["Peticiones"]
        A3["Pendientes"]
        A4["Acuerdos"]
        GW["llm-gateway<br/>único punto de modelos"]
        OLL["Ollama · IA local<br/>1 modelo compartido"]
        RAG["Recuperación RAG"]
        PG[("PostgreSQL<br/>+ pgvector")]
        N8N["n8n · no-code"]
        OCR["OCR local"]
        ING["Ingesta · chunk + embed"]

        DASH -->|"REST · BFF"| ORCH
        ORCH -->|"reparte por agente"| A1
        ORCH --> A2
        ORCH --> A3
        ORCH --> A4
        A1 --> GW
        A2 --> GW
        A3 --> GW
        A4 --> GW
        GW --> OLL
        A1 --> RAG
        A4 --> RAG
        RAG --> PG
        ORCH --> PG
        GW -->|"auditoría"| PG
        N8N --> ORCH
        OCR --> ING
        ING --> PG
    end

    F1["Formularios / WhatsApp"] --> N8N
    F2["Google / Outlook Calendar"] --> N8N
    F3["PDFs escaneados"] --> OCR

    GW -.->|"SOLO en desarrollo · datos sintéticos"| CLAUDE["Claude API · externo"]

    classDef dev fill:#fef9c3,stroke:#ca8a04,stroke-dasharray:5 5,color:#713f12;
    class CLAUDE dev;
    classDef brain fill:#e0e7ff,stroke:#6366f1,color:#312e81;
    class OLL brain;
```

**Claves:**
- El cerebro de producción es **Ollama local** (azul). **Claude** (amarillo
  punteado) es **solo desarrollo**: no forma parte de lo entregado.
- **Una sola** instalación de Ollama, **compartida** por los 4 agentes (y los 10
  después) a través del gateway. No es una por agente.
- Entre los usuarios y el tablero hay un **filtro de roles (RBAC)**.

---

## 2. Estado actual — qué tenemos vs qué falta

```mermaid
flowchart TB
    DASH["Dashboard: Resumen + Peticiones"]:::ok
    ORCH["Orquestador: registro + dispatch"]:::ok
    GW["llm-gateway: proveedor pluggable (Claude hoy)"]:::ok
    A2["Agente Peticiones (completo)"]:::ok
    A134["Agentes Agenda/Pendientes/Acuerdos (stubs)"]:::ok
    PG[("Postgres: esquema 10 agentes + seed")]:::ok
    TESTS["Pruebas + evals de los 4 agentes"]:::ok

    ROLES["Roles / RBAC activos (login + permisos)"]:::falta
    OLL["Ollama local + validación de los agentes"]:::falta
    EMBED["/v1/embed + RAG (recuperación)"]:::falta
    INGEST["Ingesta + chunking + OCR real"]:::falta
    N8NF["n8n: formularios, WhatsApp, Google/Outlook, semáforos"]:::falta
    AUDIT["Persistir auditoría llm_audit"]:::falta
    PROD["Despliegue en servidor privado"]:::falta

    classDef ok fill:#d1fae5,stroke:#10b981,color:#064e3b;
    classDef falta fill:#fee2e2,stroke:#ef4444,stroke-dasharray:4 4,color:#7f1d1d;
```

🟩 hecho y verificado · 🟥 pendiente.

---

## 3. Roles — quién ve qué (RBAC)

```mermaid
flowchart LR
    G["Gobernadora"] --> T["Tablero completo<br/>los 4 módulos · todo"]
    SP["Secretaría Particular"] --> T
    OA["Operador · Agenda"] --> MA["Solo módulo Agenda"]
    OP["Operador · Peticiones"] --> MP["Solo módulo Peticiones"]

    NOTA["El RBAC filtra en 3 niveles:<br/>1) qué módulos ve · 2) qué registros ve · 3) qué documentos recupera el RAG"]

    classDef nota fill:#f1f5f9,stroke:#94a3b8,color:#334155;
    class NOTA nota;
```

> **No todo va para todos.** La Gobernadora y Secretaría Particular ven todo;
> los operadores ven solo su módulo. El RBAC también **filtra el RAG**: cada rol
> recupera únicamente documentos permitidos. Las tablas ya existen en la BD
> (`usuarios`, `roles`, `permisos`); falta activarlas (no es rediseño).

---

## 4. Flujo que YA funciona — clasificar una petición

```mermaid
sequenceDiagram
    actor Op as Operador
    participant D as Dashboard
    participant O as Orquestador
    participant Ag as Agente Peticiones
    participant G as llm-gateway
    participant M as Modelo (Ollama en prod · Claude en dev)

    Op->>D: Escribe la petición ciudadana
    D->>O: POST /agents/peticiones-ciudadanas/dispatch
    O->>Ag: /handle {tipo: clasificar}
    Ag->>G: /v1/complete (prompt + texto)
    G->>M: genera
    M-->>G: JSON {categoria, urgencia, ...}
    G-->>Ag: respuesta + tokens
    Ag-->>O: {folio, clasificación}
    O-->>D: resultado
    D-->>Op: Folio + urgencia + dependencia sugerida
```

> El flujo es idéntico en desarrollo y producción; **solo cambia el cerebro**
> detrás del gateway (Claude → Ollama).

---

## 5. Flujo del RAG — ficha de reunión (no entrena, recupera)

```mermaid
sequenceDiagram
    participant ING as Ingesta
    participant G as llm-gateway (/v1/embed)
    participant PG as pgvector
    participant Ag as Agente Agenda
    participant M as Modelo local (Ollama)

    note over ING,PG: Ingesta (una vez por documento · NO es entrenamiento)
    ING->>G: embed(fragmentos del documento)
    G-->>ING: vectores
    ING->>PG: guarda chunks + embeddings

    note over Ag,M: Consulta (al preparar la ficha)
    Ag->>G: embed("antecedentes de la reunión X")
    G-->>Ag: vector de consulta
    Ag->>PG: búsqueda top-k (filtrada por rol)
    PG-->>Ag: solo los fragmentos relevantes y permitidos
    Ag->>G: /v1/complete (prompt + fragmentos)
    G->>M: genera la ficha
    M-->>Ag: ficha con antecedentes citados
```

---

## 6. Despliegue en producción — nube privada + IA local

```mermaid
flowchart TB
    subgraph SRV["Servidor privado dedicado · 1 GPU · datacenter en México"]
        APPS["Orquestador + 4 agentes + gateway<br/>tablero + n8n + OCR"]
        OLL["Ollama · IA local<br/>1 modelo compartido"]
        PGC[("PostgreSQL + pgvector<br/>BD + archivero RAG")]
        APPS --> OLL
        APPS --> PGC
    end

    USERS["Despacho<br/>(con roles)"] -->|"Tailscale · red privada"| SRV

    NOTA["Nada sale del servidor · sin costo por tokens.<br/>AWS solo como PILOTO con datos sintéticos (Camino B en docs/produccion.md)."]

    classDef nota fill:#f1f5f9,stroke:#94a3b8,color:#334155;
    class NOTA nota;
```

> **Un** servidor, **un** Ollama, **una** BD. Los 4 agentes comparten todo eso;
> crecer a 10 = más capacidad en el mismo servidor, no más cerebros.
> La frontera de soberanía se cumple: en producción el cómputo de IA es **local**.
