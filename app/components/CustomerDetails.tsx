'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
  sales: {
    id: number;
    date: string;
    amount: number;
    status: string;
    items: {
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
}

export default function CustomerDetails() {
  const params = useParams();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch customer details');
        }
        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCustomer();
    }
  }, [params.id]);

  const handleStatusUpdate = async (saleId: number, newStatus: string) => {
    try {
      setIsUpdating(saleId);
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update the local state
      setCustomer(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sales: prev.sales.map(sale => 
            sale.id === saleId ? { ...sale, status: newStatus } : sale
          ),
        };
      });

      toast({
        title: "Success",
        description: "Sale status updated successfully",
      });
    } catch (error) {
      console.error('Error updating sale status:', error);
      toast({
        title: "Error",
        description: "Failed to update sale status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

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

  if (!customer) return null;

  const totalSpent = customer.sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalOrders = customer.sales.length;

  return (
    <div className="space-y-6">
      <div className="card-style">
        <div className="card-header">
          <h2 className="card-title">Customer Information</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {customer.name}</p>
                <p><span className="font-medium">Email:</span> {customer.email}</p>
                <p><span className="font-medium">Phone:</span> {customer.phone || 'N/A'}</p>
                <p><span className="font-medium">Category:</span> {customer.category}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Business Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Company:</span> {customer.company || 'N/A'}</p>
                <p><span className="font-medium">Address:</span> {customer.address || 'N/A'}</p>
                <p><span className="font-medium">Member Since:</span> {new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-style">
          <div className="card-header">
            <h2 className="card-title">Total Spent</h2>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          </div>
        </div>
        <div className="card-style">
          <div className="card-header">
            <h2 className="card-title">Total Orders</h2>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold">{totalOrders}</div>
          </div>
        </div>
      </div>

      <div className="card-style">
        <div className="card-header">
          <h2 className="card-title">Purchase History</h2>
        </div>
        <div className="card-content">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customer.sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>#{sale.id}</TableCell>
                  <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCurrency(sale.amount)}</TableCell>
                  <TableCell>
                    <Select
                      value={sale.status}
                      onValueChange={(value) => handleStatusUpdate(sale.id, value)}
                      disabled={isUpdating === sale.id}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            sale.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            sale.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sale.status}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {sale.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.quantity}x {item.name} ({formatCurrency(item.price)})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {customer.sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No purchase history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
} 