// src/types.ts

export interface SensorData {
  time: string; // Ej: "10:00 AM"
  humidity: number; // Ej: 65.5
  temperature: number; // Ej: 23.4
}

export interface LogEntry {
  timestamp: string; // Ej: "2025-11-18 10:00"
  humidity: number;
}