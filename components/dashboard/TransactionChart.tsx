import React, { useState, useMemo } from 'react';
import type { Transaction } from '../../types';

interface TransactionChartProps {
  transactions: Transaction[];
}

const TransactionChart: React.FC<TransactionChartProps> = ({ transactions }) => {
  const [currency, setCurrency] = useState<'KES' | 'USD'>('KES');

  const data = useMemo(() => {
    const last30Days = new Map<string, number>();
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const formattedDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
      last30Days.set(formattedDate, 0);
    }

    transactions.forEach(t => {
      if (t.currency === currency) {
        const tDate = new Date(t.createdAt);
        const formattedDate = tDate.toLocaleDateString('en-CA');
        if (last30Days.has(formattedDate)) {
          last30Days.set(formattedDate, (last30Days.get(formattedDate) || 0) + t.totalAmountCharged);
        }
      }
    });

    return Array.from(last30Days.entries())
      .map(([date, volume]) => ({ date, volume }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, currency]);

  const maxVolume = useMemo(() => Math.max(...data.map(d => d.volume), 1), [data]); // Avoid division by zero
  const chartHeight = 200;
  const chartWidth = 500; // Assuming a fixed width for simplicity in SVG viewbox

  const points = useMemo(() => data.map((point, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = chartHeight - (point.volume / maxVolume) * chartHeight;
    return `${x},${y}`;
  }).join(' '), [data, maxVolume, chartHeight, chartWidth]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">Transaction Volume (Last 30 Days)</h3>
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setCurrency('KES')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
              currency === 'KES' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            KES
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
              currency === 'USD' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            USD
          </button>
        </div>
      </div>
      <div className="w-full h-[250px] flex items-end justify-center">
        <svg viewBox={`-50 0 ${chartWidth + 80} ${chartHeight + 40}`} className="w-full h-full">
          {/* Y-Axis Grid Lines and Labels */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = (i / 4) * chartHeight;
            const value = maxVolume * (1 - i / 4);
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke={i === 4 ? "#d1d5db" : "#e5e7eb"} // Darker line for the base
                  strokeWidth="1"
                />
                <text x="-10" y={y + 4} textAnchor="end" className="text-xs fill-current text-gray-500">
                  {value.toLocaleString(undefined, { notation: 'compact' })}
                </text>
              </g>
            );
          })}
          
          {/* Line path */}
          <polyline
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2.5"
            points={points}
            style={{ strokeLinejoin: 'round', strokeLinecap: 'round' }}
          />
          
          {/* Fill under the line */}
          <polygon
            fill="#4f46e5"
            fillOpacity="0.1"
            points={`0,${chartHeight} ${points} ${chartWidth},${chartHeight}`}
          />

          {/* X-Axis labels */}
          <text x="0" y={chartHeight + 25} textAnchor="start" className="text-xs fill-current text-gray-500">30 days ago</text>
          <text x={chartWidth} y={chartHeight + 25} textAnchor="end" className="text-xs fill-current text-gray-500">Today</text>
        </svg>
      </div>
    </div>
  );
};

export default TransactionChart;
