// src/components/zapallo/Dashboard.tsx
import React from 'react';
import DataCard from '../DataCard';
import HumidityChart from './HumidityChart'; // Gráfico de Humedad
import TemperatureChart from './TemperatureChart'; // Gráfico de Temperatura
import type { SensorData, LogEntry } from '../../types';

// --- Datos de Ejemplo (Manteniendo los mismos para consistencia) ---
const mockSensorData: SensorData[] = [
    { time: '18:00', humidity: 65.5, temperature: 23.0 },
    { time: '20:00', humidity: 71.0, temperature: 22.8 },
    { time: '22:00', humidity: 67.8, temperature: 21.9 },
    { time: '00:00', humidity: 64.0, temperature: 21.0 },
    { time: '02:00', humidity: 61.0, temperature: 20.0 },
    { time: '04:00', humidity: 60.0, temperature: 19.8 },
];

const mockLogData: LogEntry[] = [
    { timestamp: '18:00', humidity: 65.5 },
    { timestamp: '20:00', humidity: 71.0 },
    { timestamp: '22:00', humidity: 67.8 },
    { timestamp: '00:00', humidity: 64.0 },
    { timestamp: '02:00', humidity: 61.0 },
    { timestamp: '04:00', humidity: 60.0 },
];

// --- Layout usando Tailwind classes ---

const Dashboard: React.FC = () => {
  // Datos principales simulados para las cards
  const avgHumidity = (mockSensorData.reduce((acc, d) => acc + d.humidity, 0) / mockSensorData.length).toFixed(1);
  const avgTemperature = (mockSensorData.reduce((acc, d) => acc + d.temperature, 0) / mockSensorData.length).toFixed(1);

  return (
    <div /* Usar DashboardContainer de los estilos anteriores */>
      <header /* Usar Header de los estilos anteriores */>
        {/* ... Títulos ... */}
      </header>
      
      {/* 1. Tarjetas de Datos */}
      <div className="grid auto-fit-grid gap-5 mb-8" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'}}>
        <DataCard
          title="Humedad Promedio"
          value={avgHumidity}
          unit="%"
          range="57.9% - 71.7%"
          isOptimal={true}
        />
        <DataCard
          title="Temperatura Promedio"
          value={avgTemperature}
          unit="°C"
          range="21.8°C - 27.5°C"
          isOptimal={true}
        />
        <DataCard
          title="Frecuencia de Registro"
          value="Cada 60 min"
        />
      </div>

      {/* 2. Gráficos SEPARADOS (Humedad y Temperatura) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <HumidityChart data={mockSensorData} />
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm">
          <TemperatureChart data={mockSensorData} />
        </div>
      </div>

      {/* 3. Registro de Humedad (sustituido por una lista simple porque `HumidityLog` no existe) */}
      <div className="bg-white rounded-lg p-5 shadow-sm">
        <h4 className="text-sm font-semibold mb-2">Registro de Humedad</h4>
        <ul className="text-sm text-gray-700">
          {mockLogData.map((l, i) => (
            <li key={i}>{l.timestamp} — {l.humidity}%</li>
          ))}
        </ul>
      </div>
      
    </div>
  );
};

export default Dashboard;