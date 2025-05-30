'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartOptions,
} from 'chart.js';

import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '@/lib/utils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartsProps {
  salesByMonth: { month: string; amount: number }[];
  salesByCategory: { category: string; amount: number }[];
  topCustomers: { name: string; totalSpent: number }[];
  topProducts: { name: string; totalSales: number }[];
}

interface RecentPurchase {
  customer: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

const mockRecentPurchases: RecentPurchase[] = [
  {
    customer: 'John Smith',
    date: '2025-05-30',
    amount: 129.99,
    status: 'paid'
  },
  {
    customer: 'Sarah Johnson',
    date: '2025-05-29',
    amount: 89.99,
    status: 'pending'
  },
  {
    customer: 'Michael Brown',
    date: '2025-05-28',
    amount: 199.99,
    status: 'paid'
  },
  {
    customer: 'Emily Wilson',
    date: '2025-05-27',
    amount: 49.99,
    status: 'failed'
  }
];

export function Charts({ salesByMonth, salesByCategory, topCustomers, topProducts }: ChartsProps) {
  // Sales Trend Chart
  const salesTrendData = {
    labels: salesByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Sales',
        data: salesByMonth.map(item => item.amount),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
    ],
  };

  // Sales by Category Chart
  const categoryData = {
    labels: salesByCategory.map(item => item.category),
    datasets: [
      {
        data: salesByCategory.map(item => item.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Top Customers Chart
  const customersData = {
    labels: topCustomers.map(item => item.name),
    datasets: [
      {
        label: 'Total Spent',
        data: topCustomers.map(item => item.totalSpent),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Top Products Chart
  const productsData = {
    labels: topProducts.map(item => item.name),
    datasets: [
      {
        label: 'Total Spent',
        data: topProducts.map(item => item.totalSales),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ], 
  };

  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== undefined) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value as number);
          }
        }
      }
    }
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${formatCurrency(value as number)}`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-style">
          <div className="card-header">
            <h3 className="text-base font-bold">Sales Trend</h3>
          </div>
          <div className="card-content p-4 h-[300px]">
            <Line data={salesTrendData} options={chartOptions} />
          </div>
        </div>

        <div className="card-style">
          <div className="card-header">
            <h3 className="text-base font-bold">Sales by Category</h3>
          </div>
          <div className="card-content p-4 h-[300px]">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-style">
          <div className="card-header">
            <h3 className="text-base font-bold">Recent Purchases</h3>
          </div>
          <div className="card-content p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Customer</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRecentPurchases.map((purchase: RecentPurchase, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2">{purchase.customer}</td>
                      <td className="py-2">{new Date(purchase.date).toLocaleDateString()}</td>
                      <td className="py-2">${purchase.amount.toFixed(2)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          purchase.status === 'paid' ? 'bg-green-100 text-green-800' :
                          purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {purchase.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card-style">
          <div className="card-header">
            <h3 className="text-base font-bold">Top Customers</h3>
          </div>
          <div className="card-content p-4 h-[300px]">
            <Bar data={customersData} options={chartOptions} />
          </div>
        </div>

        <div className="card-style">
          <div className="card-header">
            <h3 className="text-base font-bold">Top Products</h3>
          </div>
          <div className="card-content p-4 h-[300px]">
            <Bar data={productsData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
} 