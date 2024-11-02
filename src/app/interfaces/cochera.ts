import { Estacionamiento } from "./estacionamiento";

export interface Cochera {
    id: number;
    descripcion: string;
    eliminada: number;
    deshabilitada: number; 
    activo: Estacionamiento | null; 
    horaDeshabilitacion: string | null; 
  }
  