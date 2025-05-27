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
  const [reportType, setReportType] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateRange,
          reportType,
        }),
      });
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-style">
        <div className="card-header">
          <div>
            <h2 className="text-2xl font-bold">Business Reports</h2>
            <p className="text-sm text-muted-foreground">View and analyze your business performance.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DatePicker
                date={dateRange.from}
                onSelect={(date: Date) => setDateRange({ ...dateRange, from: date })}
              />
              <span className="text-muted-foreground">to</span>
              <DatePicker
                date={dateRange.to}
                onSelect={(date: Date) => setDateRange({ ...dateRange, to: date })}
              />
            </div>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="sales">Sales Analysis</SelectItem>
                <SelectItem value="customers">Customer Analysis</SelectItem>
                <SelectItem value="products">Product Analysis</SelectItem>
                <SelectItem value="expenses">Expense Analysis</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchReportData} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="card-content">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[300px]" />
              </div>
            </div>
          ) : reportData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-style">
                  <div className="card-header">
                    <h3 className="text-base font-bold">Total Sales</h3>
                  </div>
                  <div className="card-content">
                    <p className="text-2xl font-bold">{formatCurrency(reportData.totalSales)}</p>
                  </div>
                </div>
                <div className="card-style">
                  <div className="card-header">
                    <h3 className="text-base font-bold">Total Expenses</h3>
                  </div>
                  <div className="card-content">
                    <p className="text-2xl font-bold">{formatCurrency(reportData.totalExpenses)}</p>
                  </div>
                </div>
                <div className="card-style">
                  <div className="card-header">
                    <h3 className="text-base font-bold">Net Profit</h3>
                  </div>
                  <div className="card-content">
                    <p className="text-2xl font-bold">{formatCurrency(reportData.netProfit)}</p>
                  </div>
                </div>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-style">
                  <div className="card-header">
                    <h3 className="text-base font-bold">Sales by Category</h3>
                  </div>
                  <div className="card-content divide-y">
                    {reportData.salesByCategory.map((category, index) => (
                      <div key={index} className="py-3 flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <span className="font-medium">{formatCurrency(category.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-style">
                  <div className="card-header">
                    <h3 className="text-base font-bold">Sales by Month</h3>
                  </div>
                  <div className="card-content divide-y">
                    {reportData.salesByMonth.map((month, index) => (
                      <div key={index} className="py-3 flex justify-between items-center">
                        <span className="font-medium">{month.month}</span>
                        <span className="font-medium">{formatCurrency(month.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 