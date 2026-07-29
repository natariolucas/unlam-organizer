import type { Theme } from '../context/ThemeContext';
import type { EstadoMateria, Materia, MateriaProgreso, ProgresoPerfil } from '../types';

// Un electiva_slot (Electiva I/II/III) no trackea su propio estado/notas: apunta a la
// materia concreta (electiva_opcion) elegida, y ese progreso vive en el id de esa
// materia. Si todavía no se eligió una a mano pero ya hay progreso cargado (p. ej. por
// el importador de historia académica) para alguna de las opciones, se toma esa como
// elegida automáticamente.
export function getProgresoEfectivo(materia: Materia, progreso: ProgresoPerfil): MateriaProgreso | undefined {
  const p = progreso[materia.id];
  if (!materia.opciones) return p;
  const elegidaId = p?.electivaId ?? materia.opciones.find(id => progreso[id]);
  return elegidaId ? progreso[elegidaId] : undefined;
}

export function getEstadoEfectivo(materia: Materia, progreso: ProgresoPerfil): EstadoMateria {
  const resuelto = getProgresoEfectivo(materia, progreso);
  if (resuelto?.estado) return resuelto.estado;
  if (materia.correlativas.length === 0) return 'disponible';
  const cumplidas = materia.correlativas.every(id => {
    const cp = progreso[id];
    return cp?.estado === 'regularizada' || cp?.estado === 'aprobada';
  });
  return cumplidas ? 'disponible' : 'bloqueada';
}

export const ESTADO_COLORS = {
  bloqueada:    { border: '#424242', bg: '#191919', text: '#5e5e5e', label: 'Bloqueada'    },
  disponible:   { border: '#3b82f6', bg: '#0e1e35', text: '#93c5fd', label: 'Disponible'   },
  cursando:     { border: '#f59e0b', bg: '#3d2706', text: '#fde68a', label: 'Cursando'     },
  regularizada: { border: '#f472b6', bg: '#3d0a2b', text: '#fbcfe8', label: 'Regularizada' },
  aprobada:     { border: '#4ade80', bg: '#14532d', text: '#bbf7d0', label: 'Aprobada'     },
} satisfies Record<EstadoMateria, { border: string; bg: string; text: string; label: string }>;

export const ESTADO_COLORS_LIGHT = {
  bloqueada:    { border: '#94a3b8', bg: '#f1f5f9', text: '#64748b', label: 'Bloqueada'    },
  disponible:   { border: '#2563eb', bg: '#dbeafe', text: '#1e40af', label: 'Disponible'   },
  cursando:     { border: '#d97706', bg: '#fef3c7', text: '#92400e', label: 'Cursando'     },
  regularizada: { border: '#db2777', bg: '#fce7f3', text: '#9d174d', label: 'Regularizada' },
  aprobada:     { border: '#15803d', bg: '#bbf7d0', text: '#14532d', label: 'Aprobada'     },
} satisfies Record<EstadoMateria, { border: string; bg: string; text: string; label: string }>;

export type EstadoColorsMap = typeof ESTADO_COLORS;

export function getEstadoColors(theme: Theme): EstadoColorsMap {
  return theme === 'light' ? ESTADO_COLORS_LIGHT : ESTADO_COLORS;
}

export function computeStats(
  materias: Materia[],
  estadosEfectivos: Record<string, EstadoMateria>,
) {
  const trackable = materias.filter(m => m.tipo !== 'electiva_opcion');
  let bloqueadas = 0, disponibles = 0, cursando = 0, regularizadas = 0, aprobadas = 0;
  for (const m of trackable) {
    switch (estadosEfectivos[m.id]) {
      case 'bloqueada':    bloqueadas++;    break;
      case 'disponible':   disponibles++;   break;
      case 'cursando':     cursando++;      break;
      case 'regularizada': regularizadas++; break;
      case 'aprobada':     aprobadas++;     break;
    }
  }
  return { total: trackable.length, bloqueadas, disponibles, cursando, regularizadas, aprobadas };
}

export function computeMilestone(
  materiaIds: string[],
  estadosEfectivos: Record<string, EstadoMateria>,
) {
  const total = materiaIds.length;
  const aprobadas = materiaIds.filter(id => estadosEfectivos[id] === 'aprobada').length;
  return { aprobadas, total, completo: total > 0 && aprobadas === total };
}
