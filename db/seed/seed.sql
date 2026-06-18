-- Datos semilla. Registra los 10 agentes desde el diseño: 4 activos (Fase 1) y
-- 6 planeados (fases futuras) — evidencia del patrón "diseñar para 10" (ADR-004).

INSERT INTO agents (slug, nombre, descripcion, fase, estado, capabilities) VALUES
  ('agenda-reuniones',       'Agenda y Reuniones',     'Fichas previas y seguimiento de reuniones.',        1, 'activo',   '["preparar_ficha","seguimiento"]'),
  ('peticiones-ciudadanas',  'Peticiones Ciudadanas',  'Recibe, clasifica, folía y canaliza peticiones.',   1, 'activo',   '["clasificar","foliar"]'),
  ('pendientes-prioridades', 'Pendientes y Prioridades','Matriz urgencia/importancia de pendientes.',        1, 'activo',   '["priorizar"]'),
  ('control-acuerdos',       'Control de Acuerdos',    'Vigila acuerdos, plazos, evidencias y semáforos.',  1, 'activo',   '["extraer_acuerdos"]'),
  -- Fases futuras (placeholders; se activan al desplegar su contenedor).
  ('agente-05', 'Agente 5 (por definir)', 'Reservado para fase posterior.', 2, 'planeado', '[]'),
  ('agente-06', 'Agente 6 (por definir)', 'Reservado para fase posterior.', 2, 'planeado', '[]'),
  ('agente-07', 'Agente 7 (por definir)', 'Reservado para fase posterior.', 3, 'planeado', '[]'),
  ('agente-08', 'Agente 8 (por definir)', 'Reservado para fase posterior.', 3, 'planeado', '[]'),
  ('agente-09', 'Agente 9 (por definir)', 'Reservado para fase posterior.', 3, 'planeado', '[]'),
  ('agente-10', 'Agente 10 (por definir)','Reservado para fase posterior.', 3, 'planeado', '[]')
ON CONFLICT (slug) DO NOTHING;

-- Roles base (RBAC propio, ADR-006).
INSERT INTO roles (slug, nombre) VALUES
  ('gobernadora',  'Gobernadora'),
  ('jefe_despacho','Jefe de Despacho'),
  ('operador',     'Operador')
ON CONFLICT (slug) DO NOTHING;

-- Catálogos de ejemplo (sintéticos).
INSERT INTO dependencias (nombre, siglas) VALUES
  ('Comisión Estatal de Agua', 'CEA'),
  ('Secretaría de Salud',      'SS'),
  ('Secretaría de Seguridad',  'SSP'),
  ('Secretaría de Obras Públicas','SOP')
ON CONFLICT DO NOTHING;
