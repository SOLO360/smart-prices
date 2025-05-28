'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { Charts } from './Charts';

interface ReportData {
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  salesByCategory: { category: string; amount: number }[];
  salesByMonth: { month: string; amount: number }[];
  topCustomers: { name: string; totalSpent: number }[];
  topProducts: { name: string; totalSales: number }[];
}

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRange,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch report data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-style">
        <div className="card-header">
          <h2 className="text-lg font-bold">Business Reports</h2>
          <p className="text-sm text-gray-500">View and analyze your business performance</p>
        </div>
        <div className="card-content p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <DatePicker
                  date={dateRange.from}
                  onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                />
                <span className="text-sm text-gray-500">to</span>
                <DatePicker
                  date={dateRange.to}
                  onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchReportData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card-style">
                    <div className="card-header">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="card-content p-4">
                      <Skeleton className="h-8 w-32" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card-style">
                    <div className="card-header">
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="card-content p-4">
                      <Skeleton className="h-48 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : reportData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card-style">
                  <div className="card-header">
                    <h3 className="text-base font-bold">Total Sales</h3>
                  </div>
                  <div className="card-content p-4">
                    <p className="text-2xl font-bold">{formatCurrency(reportData.totalSales)}</p>
                  </div>
                </div>
                <div className="card-style">
                  <div className="card-header">
                    <h3 className="text-base font-bold">Total Expenses</h3>
                  </div>
                  <div className="card-content p-4">
                    <p className="text-2xl font-bold">{formatCurrency(reportData.totalExpenses)}</p>
                  </div>
                </div>
                <div className="card-style">
                  <div className="card-header">
                    <h3 className="text-base font-bold">Net Profit</h3>
                  </div>
                  <div className="card-content p-4">
                    <p className="text-2xl font-bold">{formatCurrency(reportData.netProfit)}</p>
                  </div>
                </div>
              </div>

              <Charts
                salesByMonth={reportData.salesByMonth}
                salesByCategory={reportData.salesByCategory}
                topCustomers={reportData.topCustomers}
                topProducts={reportData.topProducts}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-style">
                  <div className="card-header">
                    <h3 className="text-base font-bold">Top Customers</h3>
                  </div>
                  <div className="card-content divide-y">
                    {reportData.topCustomers.map((customer, index) => (
                      <div key={index} className="py-3 flex justify-between items-center">
                        <span className="font-medium">{customer.name}</span>
                        <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-style">
                  <div className="card-header">
                    <h3 className="text-base font-bold">Top Products</h3>
                  </div>
                  <div className="card-content divide-y">
                    {reportData.topProducts.map((product, index) => (
                      <div key={index} className="py-3 flex justify-between items-center">
                        <span className="font-medium">{product.name}</span>
                        <span className="font-medium">{formatCurrency(product.totalSales)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 