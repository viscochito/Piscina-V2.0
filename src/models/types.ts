/**
 * Modelos de datos para el sistema de presupuestos
 */

export type TipoTrabajo = 
  | 'construccion' 
  | 'reparacion' 
  | 'revestimiento' 
  | 'limpieza' 
  | 'otro';

export type TipoPileta = 
  | 'rectangular' 
  | 'oval' 
  | 'circular' 
  | 'irregular' 
  | 'otra';

export type CalidadMaterial = 'economica' | 'estandar' | 'premium' | 'lujo';

export type RolUsuario = 'asesor' | 'admin';

export interface Cliente {
  id?: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  cuit?: string;
  localidad?: string;
  provincia?: string;
  condicionIva?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Dimensiones {
  largo: number;
  ancho: number;
  profundidadPromedio: number;
}

export interface MaterialItem {
  id: string;
  nombre: string;
  tipo: 'm2' | 'unidad';
  precioPorM2?: number;
  precioPorUnidad?: number;
  calidad?: CalidadMaterial;
  activo: boolean;
  cantidad?: number;
}

export interface ManoObra {
  horas?: number;
  calcularAutomatico: boolean;
  tarifaPorHora: number;
  dificultadAcceso: 'normal' | 'media' | 'alta';
  requierePermisos: boolean;
  m2PorHora?: number; // Productividad para cálculo automático
}

export interface Presupuesto {
  id?: string;
  numero?: number;
  cliente: Cliente;
  tipoTrabajo: TipoTrabajo;
  tipoPileta?: TipoPileta;
  dimensiones: Dimensiones;
  materiales: MaterialItem[];
  manoObra: ManoObra;
  factorDesperdicio: number; // Default 0.10 (10%)
  margen: number; // Default 0.20 (20%)
  iva: number; // Default 0.21 (21%)
  subtotal?: number;
  totalMargen?: number;
  totalIva?: number;
  total?: number;
  volumen?: number;
  superficiePiso?: number;
  superficieParedes?: number;
  superficieTotal?: number;
  superficieACotizar?: number;
  horasCalculadas?: number;
  pdfUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  estado?: 'borrador' | 'enviado' | 'aceptado' | 'rechazado';
}

export interface Plantilla {
  id?: string;
  nombre: string;
  descripcion?: string;
  tipoTrabajo: TipoTrabajo;
  dimensiones?: Dimensiones;
  materiales: MaterialItem[];
  manoObra: ManoObra;
  factorDesperdicio: number;
  margen: number;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombre?: string;
  rol: RolUsuario;
  createdAt?: string;
}

export interface CalculoResultado {
  volumen: number;
  superficiePiso: number;
  superficieParedes: number;
  superficieTotal: number;
  superficieACotizar: number;
  horasCalculadas: number;
  subtotalMateriales: number;
  subtotalManoObra: number;
  subtotalCostosAdicionales: number;
  subtotal: number;
  margen: number;
  totalMargen: number;
  totalIva: number;
  total: number;
}

