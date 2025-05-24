'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import CustomerForm from './components/CustomerForm';
import SaleForm from './components/SaleForm';
import ExpenseForm from './components/ExpenseForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  sales: any[];
}

interface Sale {
  id: number;
  amount: number;
  paymentMethod: string;
  status: string;
  notes?: string;
  customerId: number;
  productId: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  product: Product;
}

interface Product {
  id: number;
  category: string;
  service: string;
  size: string;
  unitPrice: number;
  bulkPrice: number;
  turnaroundTime: string;
  notes?: string;
}

interface Expense {
  id: number;
  amount: number;
  category: string;
  type: string;
  description: string;
  isRecurring: boolean;
  recurringPeriod?: string;
  createdAt: string;
  updatedAt: string;
}

// Add this function before the Home component
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0, // TZS doesn't use cents
    maximumFractionDigits: 0
  }).format(amount);
};

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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [salesCurrentPage, setSalesCurrentPage] = useState(1);
  const [salesPageSize, setSalesPageSize] = useState(10);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesSearchTerm, setExpensesSearchTerm] = useState('');
  const [expensesCurrentPage, setExpensesCurrentPage] = useState(1);
  const [expensesPageSize, setExpensesPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard statistics and customers
    const fetchData = async () => {
      setIsLoading(true);
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

        setCustomers(Array.isArray(customers) ? customers : []);
        setSales(Array.isArray(sales) ? sales : []);
        setExpenses(Array.isArray(expenses) ? expenses : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set default values when there's an error
        setStats({
          totalSales: 0,
          totalCustomers: 0,
          totalExpenses: 0,
          netProfit: 0,
        });
        setCustomers([]);
        setSales([]);
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter sales based on search term
  const filteredSales = sales.filter(sale => 
    sale.customer.name.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
    sale.product.service.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
    sale.status.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
    sale.paymentMethod.toLowerCase().includes(salesSearchTerm.toLowerCase())
  );

  // Sales pagination calculations
  const salesTotalPages = Math.ceil(filteredSales.length / salesPageSize);
  const salesStartIndex = (salesCurrentPage - 1) * salesPageSize;
  const salesEndIndex = salesStartIndex + salesPageSize;
  const currentSales = filteredSales.slice(salesStartIndex, salesEndIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setSalesCurrentPage(1);
  }, [salesSearchTerm]);

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(expense => 
    expense.category.toLowerCase().includes(expensesSearchTerm.toLowerCase()) ||
    expense.type.toLowerCase().includes(expensesSearchTerm.toLowerCase()) ||
    expense.description.toLowerCase().includes(expensesSearchTerm.toLowerCase())
  );

  // Expenses pagination calculations
  const expensesTotalPages = Math.ceil(filteredExpenses.length / expensesPageSize);
  const expensesStartIndex = (expensesCurrentPage - 1) * expensesPageSize;
  const expensesEndIndex = expensesStartIndex + expensesPageSize;
  const currentExpenses = filteredExpenses.slice(expensesStartIndex, expensesEndIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setExpensesCurrentPage(1);
  }, [expensesSearchTerm]);

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
          {isLoading ? (
            <div className="card-style">
              <div className="card-header">
                <h2 className="card-title">Dashboard Overview</h2>
                <p className="card-description">Loading statistics...</p>
              </div>
              <div className="card-content">
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
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
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.netProfit)}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="customers">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Customers</h2>
            <div className="flex gap-4">
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button onClick={() => setShowCustomerForm(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            </div>
          </div>

          <div className="card-style">
            <div className="card-header">
              <h2 className="card-title">Customer List</h2>
              <p className="card-description">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
              </p>
            </div>
            <div className="card-content">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Total Sales</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone || '-'}</TableCell>
                        <TableCell>{customer.company || '-'}</TableCell>
                        <TableCell>{customer.category}</TableCell>
                        <TableCell>{customer.sales.length}</TableCell>
                        <TableCell className="max-w-xs truncate">{customer.address || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {currentCustomers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No customers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="card-footer">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border rounded px-2 py-1"
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Page</span>
                    <span className="w-16 text-center font-medium">{currentPage}</span>
                    <span className="text-sm">of {totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
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
            <div className="flex gap-4">
              <Input
                placeholder="Search sales..."
                value={salesSearchTerm}
                onChange={(e) => setSalesSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button onClick={() => setShowSaleForm(true)}>
                <Plus className="mr-2 h-4 w-4" /> New Sale
              </Button>
            </div>
          </div>

          <div className="card-style">
            <div className="card-header">
              <h2 className="card-title">Sales List</h2>
              <p className="card-description">
                Showing {salesStartIndex + 1} to {Math.min(salesEndIndex, filteredSales.length)} of {filteredSales.length} sales
              </p>
            </div>
            <div className="card-content">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.customer.name}</TableCell>
                        <TableCell>{sale.product.service} - {sale.product.size}</TableCell>
                        <TableCell>{formatCurrency(sale.amount)}</TableCell>
                        <TableCell>{sale.paymentMethod}</TableCell>
                        <TableCell>{sale.status}</TableCell>
                        <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-xs truncate">{sale.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {currentSales.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No sales found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="card-footer">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <select
                    value={salesPageSize}
                    onChange={(e) => {
                      setSalesPageSize(Number(e.target.value));
                      setSalesCurrentPage(1);
                    }}
                    className="border rounded px-2 py-1"
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSalesCurrentPage(1)}
                    disabled={salesCurrentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSalesCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={salesCurrentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Page</span>
                    <span className="w-16 text-center font-medium">{salesCurrentPage}</span>
                    <span className="text-sm">of {salesTotalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSalesCurrentPage(prev => Math.min(prev + 1, salesTotalPages))}
                    disabled={salesCurrentPage === salesTotalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSalesCurrentPage(salesTotalPages)}
                    disabled={salesCurrentPage === salesTotalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
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
            <div className="flex gap-4">
              <Input
                placeholder="Search expenses..."
                value={expensesSearchTerm}
                onChange={(e) => setExpensesSearchTerm(e.target.value)}
                className="w-64"
              />
              <Button onClick={() => setShowExpenseForm(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </div>
          </div>

          <div className="card-style">
            <div className="card-header">
              <h2 className="card-title">Expenses List</h2>
              <p className="card-description">
                Showing {expensesStartIndex + 1} to {Math.min(expensesEndIndex, filteredExpenses.length)} of {filteredExpenses.length} expenses
              </p>
            </div>
            <div className="card-content">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Recurring</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.category}</TableCell>
                        <TableCell>{expense.type}</TableCell>
                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                        <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                        <TableCell>
                          {expense.isRecurring ? (
                            <span className="text-green-600">
                              Yes {expense.recurringPeriod ? `(${expense.recurringPeriod})` : ''}
                            </span>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(expense.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {currentExpenses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No expenses found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="card-footer">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <select
                    value={expensesPageSize}
                    onChange={(e) => {
                      setExpensesPageSize(Number(e.target.value));
                      setExpensesCurrentPage(1);
                    }}
                    className="border rounded px-2 py-1"
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setExpensesCurrentPage(1)}
                    disabled={expensesCurrentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setExpensesCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={expensesCurrentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Page</span>
                    <span className="w-16 text-center font-medium">{expensesCurrentPage}</span>
                    <span className="text-sm">of {expensesTotalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setExpensesCurrentPage(prev => Math.min(prev + 1, expensesTotalPages))}
                    disabled={expensesCurrentPage === expensesTotalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setExpensesCurrentPage(expensesTotalPages)}
                    disabled={expensesCurrentPage === expensesTotalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
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