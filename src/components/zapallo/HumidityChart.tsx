// src/components/HumidityChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import type { SensorData } from '../../types';

// Se asume que ChartJS ya está registrado (debería hacerse una sola vez en tu app)
// Si no lo tienes, asegúrate de importar y registrar los módulos aquí:
/*
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
*/

interface ChartProps {
  data: SensorData[];
}

const HumidityChart: React.FC<ChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label: 'Nivel de Humedad (%)',
        data: data.map(d => d.humidity),
        borderColor: '#63B3ED', // Color Azul
        backgroundColor: 'rgba(99, 179, 237, 0.2)',
        tension: 0.4,
        fill: true, // Relleno debajo de la línea
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Gráfico de Humedad',
      },
      legend: {
        display: false,
      },
    },
    scales: {
        y: {
            min: 50, // Límite inferior para la humedad (ajustable)
            max: 80, // Límite superior para la humedad (ajustable)
            title: {
                display: true,
                text: 'Humedad (%)'
            }
        }
    }
  };

  return <Line data={chartData} options={options} />;
};

export default HumidityChart;