'use client';

import React from 'react';
import { generateReport } from '@/lib/pdfGenerator';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ComponentProps } from 'react';

interface PDFReportButtonProps {
  salesByMonth: { month: string; amount: number }[];
  salesByCategory: { category: string; amount: number }[];
  topCustomers: { name: string; totalSpent: number }[];
  topProducts: { name: string; totalSales: number }[];
}

interface PDFReportButtonProps {
  salesByMonth: { month: string; amount: number }[];
  salesByCategory: { category: string; amount: number }[];
  topCustomers: { name: string; totalSpent: number }[];
  topProducts: { name: string; totalSales: number }[];
}

export function PDFReportButton({
  salesByMonth,
  salesByCategory,
  topCustomers,
  topProducts
}: PDFReportButtonProps): React.ReactElement {
  const generateAndDownloadPDF = async () => {
    try {
      await generateReport({
        salesByMonth,
        salesByCategory,
        topCustomers,
        topProducts
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Button onClick={generateAndDownloadPDF} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Download PDF Report
    </Button>
  );
}
