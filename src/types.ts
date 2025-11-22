// src/types.ts

export interface SensorData {
  time: string; // Ej: "10:00 AM"
  humidity: number; // Ej: 65.5
  temperature: number; // Ej: 23.4
}

export interface CardProps {
  title: string;
  value: string;
  range?: string; // Opcional para el rango de la medición
  unit?: string; // Opcional para la unidad
  isOptimal?: boolean; // Para el estilo de si es óptimo o no
}

export interface LogEntry {
  timestamp: string; // Ej: "2025-11-18 10:00"
  humidity: number;
}