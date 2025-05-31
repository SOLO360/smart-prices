'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface CustomerAnalytics {
  totalCustomers: number;
  customersByCategory: {
    category: string;
    count: number;
  }[];
  customersByMonth: {
    month: string;
    count: number;
  }[];
  topCustomers: {
    name: string;
    totalSales: number;
  }[];
  customerRetention: {
    month: string;
    retentionRate: number;
  }[];
}

export default function CustomerAnalytics() {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/customers/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error: {error}
      </div>
    );
  }

  if (!analytics) return null;

  const categoryData = {
    labels: analytics.customersByCategory.map(item => item.category),
    datasets: [
      {
        label: 'Customers by Category',
        data: analytics.customersByCategory.map(item => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
      },
    ],
  };

  const monthlyData = {
    labels: analytics.customersByMonth.map(item => item.month),
    datasets: [
      {
        label: 'New Customers',
        data: analytics.customersByMonth.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const retentionData = {
    labels: analytics.customerRetention.map(item => item.month),
    datasets: [
      {
        label: 'Customer Retention Rate',
        data: analytics.customerRetention.map(item => item.retentionRate),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-style">
          <div className="card-header">
            <h2 className="card-title">Total Customers</h2>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">{analytics.totalCustomers}</div>
          </div>
        </div>
        <div className="card-style">
          <div className="card-header">
            <h2 className="card-title">Top Customer</h2>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">{analytics.topCustomers[0]?.name || 'N/A'}</div>
            <p className="text-sm text-muted-foreground">
              Sales: {formatCurrency(analytics.topCustomers[0]?.totalSales || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="card-style">
        <div className="card-header">
          <h2 className="card-title">Customer Analytics</h2>
        </div>
        <div className="card-content">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="retention">Retention</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="card-style">
                <div className="card-header">
                  <h2 className="card-title">Customer Growth</h2>
                </div>
                <div className="card-content">
                  <Line data={monthlyData} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="retention" className="space-y-4">
              <div className="card-style">
                <div className="card-header">
                  <h2 className="card-title">Customer Retention</h2>
                </div>
                <div className="card-content">
                  <Line data={retentionData} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="card-style">
                <div className="card-header">
                  <h2 className="card-title">Customer Categories</h2>
                </div>
                <div className="card-content">
                  <div className="h-[300px]">
                    <Pie data={categoryData} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="card-style">
        <div className="card-header">
          <h2 className="card-title">Top Customers by Sales</h2>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {analytics.topCustomers.slice(0, 5).map((customer, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className="font-medium">{customer.name}</div>
                </div>
                <div className="font-medium">
                  {formatCurrency(customer.totalSales)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 