'use client';

import React from 'react';
import { PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

export interface ColorPolarChartProps {
  data: {
    labels: string[];
    values: number[];
    colors: string[];
  };
  size?: number;
  title?: string;
}

export const ColorPolarChart: React.FC<ColorPolarChartProps> = ({
  data,
  size = 50,
  title,
}) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: data.colors.map(color => `${color}`), // Add transparency
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: { label?: string; raw?: number }) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
        angleLines: {
          display: false,
        },
        pointLabels: {
          display: false,
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 1,
      },
    },
  };

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      {title && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            fontWeight: 500,
            color: '#666',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
      )}
      <PolarArea data={chartData} options={options} />
    </div>
  );
};