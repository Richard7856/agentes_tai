// Datos de MUESTRA (sintéticos) para que la demo se vea "ya en operación".
// No son reales; ilustran el ciclo de trabajo de cada agente de principio a fin.

export interface Folio {
  folio: string;
  ciudadano: string;
  municipio: string;
  categoria: string;
  urgencia: "alta" | "media" | "baja";
  dependencia: string;
  estado: "recibida" | "canalizada" | "en proceso" | "resuelta";
  fecha: string;
}

export const FOLIOS: Folio[] = [
  { folio: "PC-20260618-0912", ciudadano: "María López", municipio: "Tepic", categoria: "agua", urgencia: "alta", dependencia: "CEA / SIAPA", estado: "canalizada", fecha: "2026-06-18" },
  { folio: "PC-20260618-1043", ciudadano: "José Ramírez", municipio: "Xalisco", categoria: "seguridad", urgencia: "alta", dependencia: "Secretaría de Seguridad", estado: "en proceso", fecha: "2026-06-18" },
  { folio: "PC-20260619-0820", ciudadano: "Ana Torres", municipio: "Bahía de Banderas", categoria: "trámites", urgencia: "baja", dependencia: "Registro Civil", estado: "resuelta", fecha: "2026-06-19" },
  { folio: "PC-20260619-1130", ciudadano: "Pedro Gómez", municipio: "Compostela", categoria: "obras", urgencia: "media", dependencia: "Secretaría de Obras Públicas", estado: "canalizada", fecha: "2026-06-19" },
  { folio: "PC-20260620-0905", ciudadano: "Lucía Hernández", municipio: "Santiago Ixcuintla", categoria: "salud", urgencia: "media", dependencia: "Secretaría de Salud", estado: "recibida", fecha: "2026-06-20" },
  { folio: "PC-20260620-1402", ciudadano: "Carlos Méndez", municipio: "Tepic", categoria: "agua", urgencia: "alta", dependencia: "CEA / SIAPA", estado: "en proceso", fecha: "2026-06-20" },
];

export interface Acuerdo {
  descripcion: string;
  responsable: string;
  dependencia: string;
  plazo: string;
  semaforo: "verde" | "amarillo" | "rojo";
  estado: "vigente" | "por vencer" | "vencido" | "cumplido";
}

export const ACUERDOS: Acuerdo[] = [
  { descripcion: "Entregar informe de cobertura de salud", responsable: "Juan Pérez", dependencia: "Secretaría de Salud", plazo: "2026-08-15", semaforo: "verde", estado: "vigente" },
  { descripcion: "Avance del acueducto de Tepic", responsable: "Laura Díaz", dependencia: "Obras Públicas", plazo: "2026-06-30", semaforo: "amarillo", estado: "por vencer" },
  { descripcion: "Programa de seguridad escolar", responsable: "Miguel Ángel Ruiz", dependencia: "Seguridad", plazo: "2026-06-10", semaforo: "rojo", estado: "vencido" },
  { descripcion: "Entrega de apoyos a productores", responsable: "Sofía Vega", dependencia: "Desarrollo Rural", plazo: "2026-05-28", semaforo: "verde", estado: "cumplido" },
  { descripcion: "Rehabilitación de caminos rurales", responsable: "Roberto Cruz", dependencia: "Obras Públicas", plazo: "2026-07-05", semaforo: "amarillo", estado: "por vencer" },
];

export interface Reunion {
  titulo: string;
  fecha: string;
  lugar: string;
  objetivo: string;
  fichaLista: boolean;
}

export const REUNIONES: Reunion[] = [
  { titulo: "Secretario de Salud — Hospital Regional", fecha: "24 jun · 10:00", lugar: "Palacio de Gobierno", objetivo: "Revisar avance del nuevo hospital regional de Tepic", fichaLista: true },
  { titulo: "Alcaldes — Seguridad y obra hídrica", fecha: "25 jun · 12:30", lugar: "Sala de Juntas", objetivo: "Acordar acciones de seguridad y avance del acueducto", fichaLista: true },
  { titulo: "Consejo Estatal de Educación", fecha: "26 jun · 09:00", lugar: "Virtual", objetivo: "Presentar el plan de infraestructura escolar 2026", fichaLista: false },
];

export const MATRIZ: {
  hacer: string[];
  planear: string[];
  delegar: string[];
  eliminar: string[];
} = {
  hacer: [
    "Firmar convenio con la federación (vence hoy)",
    "Atender emergencia por desabasto de agua en Tepic",
  ],
  planear: [
    "Plan estatal de seguridad a 3 años",
    "Estrategia de infraestructura hospitalaria",
  ],
  delegar: [
    "Responder oficios administrativos de rutina",
    "Agendar visitas protocolarias",
  ],
  eliminar: [
    "Revisar correos promocionales",
    "Invitaciones sin relevancia institucional",
  ],
};
