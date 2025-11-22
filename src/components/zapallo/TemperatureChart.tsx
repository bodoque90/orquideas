// src/components/TemperatureChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // registra automáticamente los componentes de Chart.js
import type { SensorData } from '../../types';

// Asegúrate de que ChartJS ya esté registrado en otro lugar (e.g., HumidityChart)
// Si no, regístralo aquí:
// import { Chart as ChartJS, ... } from 'chart.js';
// ChartJS.register(...); 

interface ChartProps {
  data: SensorData[];
}

const TemperatureChart: React.FC<ChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: data.map(d => d.temperature),
        borderColor: '#FC8181', // Rojo suave
        backgroundColor: 'rgba(252, 129, 129, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Gráfico de Temperatura',
      },
      legend: {
        display: false,
      },
    },
    scales: {
        y: {
            min: 18,
            max: 30,
            title: {
                display: true,
                text: 'Temperatura (°C)'
            }
        }
    }
  };

  return <Line data={chartData} options={options} />;
};

export default TemperatureChart;