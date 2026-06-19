'use client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ChartComponents({ type, data, options }) {
  const commonStyle = { width: '100%', height: '100%' };

  if (type === 'line') return <Line data={data} options={options} style={commonStyle} />;
  if (type === 'bar') return <Bar data={data} options={options} style={commonStyle} />;
  if (type === 'pie') return <Pie data={data} options={options} style={commonStyle} />;

  return null;
}
