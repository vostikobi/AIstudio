import React from 'react';
import type { Transaction } from '../../types';
import { TransactionStatus } from '../../types';

interface SellerAnalyticsViewProps {
  transactions: Transaction[];
}

const SellerAnalyticsView: React.FC<SellerAnalyticsViewProps> = ({ transactions }) => {
  const completedSales = transactions.filter(t => 
    t.status === TransactionStatus.Completed || t.status === TransactionStatus.Released
  );

  const totalEarningsKES = completedSales
    .filter(t => t.currency === 'KES')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalEarningsUSD = completedSales
    .filter(t => t.currency === 'USD')
    .reduce((sum, t) => sum + t.amount, 0);

  const numberOfSales = completedSales.length;
  const kesSalesCount = completedSales.filter(t => t.currency === 'KES').length;
  const averageSaleKES = kesSalesCount > 0 ? totalEarningsKES / kesSalesCount : 0;

  // Monthly sales data for chart
  const monthlySales: { [key: string]: number } = {};
  completedSales.forEach(t => {
    if (t.currency === 'KES') {
        const month = new Date(t.createdAt).toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlySales[month] = (monthlySales[month] || 0) + t.amount;
    }
  });

  const chartData = Object.entries(monthlySales).map(([label, value]) => ({ label, value })).slice(-12); // Last 12 months
  const maxSale = Math.max(...chartData.map(d => d.value), 0);

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Sales Analytics</h3>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Earnings (KES)</p>
          <p className="text-2xl font-bold text-gray-800">KES {totalEarningsKES.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
         <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Earnings (USD)</p>
          <p className="text-2xl font-bold text-gray-800">USD {totalEarningsUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Number of Sales</p>
          <p className="text-2xl font-bold text-gray-800">{numberOfSales}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Average Sale (KES)</p>
          <p className="text-2xl font-bold text-gray-800">KES {averageSaleKES.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
      
      {/* Sales Chart */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-4">Monthly Sales (KES)</h4>
        {chartData.length > 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg h-64 flex items-end space-x-2">
            {chartData.map(({ label, value }) => (
              <div key={label} className="flex-1 flex flex-col items-center justify-end h-full text-center">
                <div 
                  className="w-3/4 bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors" 
                  style={{ height: `${maxSale > 0 ? (value / maxSale) * 90 : 0}%` }}
                  title={`KES ${value.toLocaleString()}`}
                ></div>
                <p className="text-xs text-gray-600 mt-1 whitespace-nowrap">{label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No completed sales to analyze yet.</p>
        )}
      </div>
    </div>
  );
};

export default SellerAnalyticsView;