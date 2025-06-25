import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import autoTable plugin
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

// Extend jsPDF with autoTable - necessary for TypeScript
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format'); // 'pdf' or 'excel'

  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (format === 'pdf') {
      const doc = new jsPDF() as jsPDFWithAutoTable;
      doc.text('Product List', 14, 16);
      doc.autoTable({
        head: [['ID', 'Name', 'Price', 'Description', 'Created At']],
        body: products.map(p => [
          p.id,
          p.name,
          p.price,
          p.description || '',
          new Date(p.createdAt).toLocaleDateString(),
        ]),
        startY: 20,
      });
      const pdfBytes = doc.output('arraybuffer');
      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="products.pdf"',
        },
      });
    } else if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(products.map(p => ({
        ID: p.id,
        Name: p.name,
        Price: p.price,
        Description: p.description || '',
        Category: p.category,
        Stock: p.stock,
        Supplier: p.supplier,
        'Created At': new Date(p.createdAt).toLocaleDateString(),
        'Updated At': new Date(p.updatedAt).toLocaleDateString(),
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="products.xlsx"',
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid format specified' }, { status: 400 });
    }
  } catch (error) {
    console.error(`GET /api/products/export error (format: ${format}):`, error);
    return NextResponse.json(
      { error: 'Error exporting products' },
      { status: 500 }
    );
  }
}
