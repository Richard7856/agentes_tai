-- Esquema inicial Núcleo Operativo. Preparado para 10 agentes (ADR-004, ADR-005).
-- Se ejecuta automáticamente al crear el contenedor de Postgres.

CREATE EXTENSION IF NOT EXISTS vector;        -- RAG documental (pgvector)
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- gen_random_uuid()

-- ╔═══ NÚCLEO: registro de agentes (corazón del patrón 4 → 10) ═══╗
CREATE TABLE agents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,
  nombre       text NOT NULL,
  descripcion  text,
  fase         int  NOT NULL DEFAULT 1,
  estado       text NOT NULL DEFAULT 'planeado',   -- planeado|activo|inactivo
  capabilities jsonb NOT NULL DEFAULT '[]',
  endpoint_url text,
  version      text,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE agent_jobs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    uuid REFERENCES agents(id),
  tipo        text NOT NULL,
  payload     jsonb,
  estado      text DEFAULT 'pendiente',             -- pendiente|en_proceso|ok|error
  resultado   jsonb,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Auditoría de toda llamada al LLM (clave de soberanía durante fase Claude, ADR-002)
CREATE TABLE llm_audit (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    uuid REFERENCES agents(id),
  user_id     uuid,
  proveedor   text NOT NULL,                        -- claude|ollama
  modelo      text,
  prompt_hash text,
  tokens_in   int, tokens_out int,
  redactado   boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE alertas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo         text, severidad text,                -- info|warn|critico
  entidad_tipo text, entidad_id uuid,               -- polimórfico
  mensaje      text, leida boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- ╔═══ RBAC propio (ADR-006) ═══╗
CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL, nombre text,
  password_hash text NOT NULL, activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE roles    (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE, nombre text);
CREATE TABLE permisos (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE, descripcion text);
CREATE TABLE usuario_roles (
  usuario_id uuid REFERENCES usuarios(id), rol_id uuid REFERENCES roles(id),
  PRIMARY KEY (usuario_id, rol_id)
);
CREATE TABLE rol_permisos (
  rol_id uuid REFERENCES roles(id), permiso_id uuid REFERENCES permisos(id),
  PRIMARY KEY (rol_id, permiso_id)
);

-- ╔═══ CATÁLOGOS compartidos ═══╗
CREATE TABLE municipios   (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), nombre text, clave text);
CREATE TABLE dependencias (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), nombre text, siglas text, responsable text);

-- ╔═══ RAG documental (compartido) ═══╗
CREATE TABLE documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text, origen text,                           -- google|carga_manual|ocr
  ruta text, ocr_text text, hash text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE documento_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id uuid REFERENCES documentos(id),
  chunk text, embedding vector(768)
);

-- ╔═══ DOMINIO POR AGENTE (cada agente trae lo suyo) ═══╗
-- Agente 1: Agenda y Reuniones
CREATE TABLE agenda_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text, inicio timestamptz, fin timestamptz, ubicacion text,
  origen text, external_id text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE fichas_reunion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid REFERENCES agenda_eventos(id),
  objetivo text, participantes jsonb, antecedentes text,
  temas_sensibles text, acuerdos_posibles text,
  generada_at timestamptz, seguimiento jsonb
);

-- Agente 2: Peticiones Ciudadanas
CREATE TABLE folios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio text UNIQUE NOT NULL,
  ciudadano text, contacto text,
  municipio_id uuid REFERENCES municipios(id),
  dependencia_id uuid REFERENCES dependencias(id),
  categoria text, urgencia text, canal text, descripcion text,
  estado text DEFAULT 'recibida',                   -- recibida|canalizada|resuelta
  created_at timestamptz DEFAULT now()
);

-- Agente 3: Pendientes y Prioridades
CREATE TABLE pendientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text, fuente text, descripcion text,
  urgencia int, importancia int,                    -- 1..5
  cuadrante text,                                   -- hacer|planear|delegar|eliminar
  estado text DEFAULT 'abierto', responsable text,
  created_at timestamptz DEFAULT now()
);

-- Agente 4: Control de Acuerdos
CREATE TABLE acuerdos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id uuid REFERENCES documentos(id),
  descripcion text, responsable text,
  dependencia_id uuid REFERENCES dependencias(id),
  fecha_compromiso date, estado text DEFAULT 'vigente',
  semaforo text,                                    -- verde|amarillo|rojo
  evidencia_url text, created_at timestamptz DEFAULT now()
);
