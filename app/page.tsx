'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CustomerForm from './components/CustomerForm';
import SaleForm from './components/SaleForm';
import ExpenseForm from './components/ExpenseForm';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCustomers: 0,
    totalExpenses: 0,
    netProfit: 0,
  });

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        const [salesRes, customersRes, expensesRes] = await Promise.all([
          fetch('/api/sales'),
          fetch('/api/customers'),
          fetch('/api/expenses'),
        ]);

        if (!salesRes.ok || !customersRes.ok || !expensesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [sales, customers, expenses] = await Promise.all([
          salesRes.json(),
          customersRes.json(),
          expensesRes.json(),
        ]);

        // Ensure we have arrays before using reduce
        const totalSales = Array.isArray(sales) ? sales.reduce((sum: number, sale: any) => sum + sale.amount, 0) : 0;
        const totalExpenses = Array.isArray(expenses) ? expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0) : 0;

        setStats({
          totalSales,
          totalCustomers: Array.isArray(customers) ? customers.length : 0,
          totalExpenses,
          netProfit: totalSales - totalExpenses,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set default values when there's an error
        setStats({
          totalSales: 0,
          totalCustomers: 0,
          totalExpenses: 0,
          netProfit: 0,
        });
      }
    };

    fetchStats();
  }, []);

  const handleCustomerSubmit = async (data: any) => {
    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setShowCustomerForm(false);
      // Refresh stats
      window.location.reload();
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const handleSaleSubmit = async (data: any) => {
    try {
      await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setShowSaleForm(false);
      // Refresh stats
      window.location.reload();
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  const handleExpenseSubmit = async (data: any) => {
    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setShowExpenseForm(false);
      // Refresh stats
      window.location.reload();
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalExpenses.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.netProfit.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Customers</h2>
            <Button onClick={() => setShowCustomerForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </div>
          {showCustomerForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <CustomerForm onSubmit={handleCustomerSubmit} />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setShowCustomerForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sales">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Sales</h2>
            <Button onClick={() => setShowSaleForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Sale
            </Button>
          </div>
          {showSaleForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <SaleForm onSubmit={handleSaleSubmit} />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setShowSaleForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Expenses</h2>
            <Button onClick={() => setShowExpenseForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </div>
          {showExpenseForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <ExpenseForm onSubmit={handleExpenseSubmit} />
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setShowExpenseForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Reports</h2>
            <Button>Generate Report</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}