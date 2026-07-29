export type EstadoMateria =
  | 'bloqueada'
  | 'disponible'
  | 'cursando'
  | 'regularizada'
  | 'aprobada';

export type TipoMateria =
  | 'obligatoria'
  | 'optativa'
  | 'electiva_slot'
  | 'electiva_opcion'
  | 'transversal';

export interface Materia {
  id: string;
  codigo: string;
  nombre: string;
  anio: number;
  cuatrimestre: number;
  horasSemanales: number;
  correlativas: string[];
  tipo: TipoMateria;
  esAnual?: boolean;
  /** Solo en electiva_slot: ids de las materias (electiva_opcion) entre las que se puede elegir para este cupo. */
  opciones?: string[];
}

export interface MateriaProgreso {
  /** Ausente cuando la materia todavía no se trackeó (p. ej. un electiva_slot que solo tiene `electivaId` elegido). */
  estado?: 'cursando' | 'regularizada' | 'aprobada';
  notaParcial1: number | null;
  notaParcial2: number | null;
  notaFinal: number | null;
  /** Solo en electiva_slot: id de la materia concreta (electiva_opcion) elegida para este cupo. El estado/notas reales se guardan en el progreso de esa materia, no acá. */
  electivaId?: string;
}

/** Hito de título intermedio que se obtiene aprobando un subconjunto de materias. */
export interface TituloIntermedio {
  /** Nombre del título, ej. "Técnico Universitario en Desarrollo de Software" */
  nombre: string;
  /** Descripción del criterio de obtención */
  descripcion?: string;
  /** Ids de las materias que se requieren para obtenerlo */
  materiaIds: string[];
}

export interface Carrera {
  id: string;
  nombre: string;
  plan: string;
  materias: Materia[];
  /** Título intermedio de la carrera, si lo tiene */
  tituloIntermedio?: TituloIntermedio;
  /** true si el cuatrimestre de cada materia fue inferido (el plan oficial solo publica el año) */
  cuatrimestreEstimado?: boolean;
  /** true si el año de cada materia también fue inferido (el plan oficial no publica ni año ni cuatrimestre) */
  anioEstimado?: boolean;
}

export type ProgresoPerfil = Record<string, MateriaProgreso>;

export interface MateriaNodeData extends Record<string, unknown> {
  codigo: string;
  nombre: string;
  estado: EstadoMateria;
  tipo: TipoMateria;
  simApproved?: boolean;
  /** true si la materia cuenta para el título intermedio de la carrera */
  tituloIntermedio?: boolean;
}
