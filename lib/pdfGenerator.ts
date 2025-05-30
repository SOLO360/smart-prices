'use client';

declare global {
  interface Window {
    pdfMake: any;
  }
}

interface ReportData {
  salesByMonth: { month: string; amount: number }[];
  salesByCategory: { category: string; amount: number }[];
  topCustomers: { name: string; totalSpent: number }[];
  topProducts: { name: string; totalSales: number }[];
}

export async function generateReport(reportData: ReportData): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('This function can only be used on the client side');
  }

  // Check if pdfMake is already loaded
  if (!window.pdfMake) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/pdfmake.min.js';
    script.onload = () => {
      // Configure fonts
      window.pdfMake.fonts = {
        Roboto: {
          normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/fonts/Roboto/Roboto-Regular.ttf',
          bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/fonts/Roboto/Roboto-Medium.ttf',
          italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/fonts/Roboto/Roboto-Italic.ttf',
          bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.68/fonts/Roboto/Roboto-MediumItalic.ttf'
        }
      };

      // Ensure fonts are loaded before generating PDF
      return new Promise<Blob>((resolve, reject) => {
        const fontPromises = Object.values(window.pdfMake.fonts.Roboto).map(fontUrl => {
          return new Promise((fontResolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', fontUrl, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
              if (xhr.status === 200) {
                fontResolve(xhr.response);
              }
            };
            xhr.onerror = () => {
              console.error(`Failed to load font: ${fontUrl}`);
              fontResolve(null); // Continue with default font if loading fails
            };
            xhr.send();
          });
        });

        Promise.all(fontPromises)
          .then(() => {
            const docDefinition = {
              content: [
                {
                  text: 'Sales Report',
                  style: 'header',
                  margin: [0, 0, 0, 20]
                },
                {
                  text: `Generated on: ${new Date().toLocaleDateString()}`,
                  alignment: 'right',
                  margin: [0, 0, 0, 20]
                },
                {
                  text: 'Monthly Sales',
                  style: 'subheader',
                  margin: [0, 20, 0, 10]
                },
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: [
                      ['Month', 'Amount'],
                      ...reportData.salesByMonth.map(item => [item.month, item.amount.toFixed(2)])
                    ]
                  }
                },
                {
                  text: 'Sales by Category',
                  style: 'subheader',
                  margin: [0, 20, 0, 10]
                },
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: [
                      ['Category', 'Amount'],
                      ...reportData.salesByCategory.map(item => [item.category, item.amount.toFixed(2)])
                    ]
                  }
                },
                {
                  text: 'Top Customers',
                  style: 'subheader',
                  margin: [0, 20, 0, 10]
                },
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: [
                      ['Customer', 'Total Spent'],
                      ...reportData.topCustomers.map(item => [item.name, item.totalSpent.toFixed(2)])
                    ]
                  }
                },
                {
                  text: 'Top Products',
                  style: 'subheader',
                  margin: [0, 20, 0, 10]
                },
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: [
                      ['Product', 'Total Sales'],
                      ...reportData.topProducts.map(item => [item.name, item.totalSales.toFixed(2)])
                    ]
                  }
                }
              ],
              styles: {
                header: {
                  fontSize: 24,
                  bold: true,
                  margin: [0, 0, 0, 20]
                },
                subheader: {
                  fontSize: 18,
                  bold: true,
                  margin: [0, 20, 0, 10]
                }
              },
              defaultStyle: {
                font: 'Roboto'
              }
            };

            // Generate PDF
            const pdfDoc = window.pdfMake.createPdf(docDefinition);
            
            // Download the PDF directly
            pdfDoc.download(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
            resolve();
          })
          .catch(error => {
            console.error('Error loading fonts:', error);
            reject(error);
          });
      });
    };
    document.body.appendChild(script);
    
    // Wait for script to load
    return new Promise<Blob>((resolve, reject) => {
      script.onload = () => resolve(window.pdfMake);
      script.onerror = () => reject(new Error('Failed to load pdfMake'));
    });
  } else {
    // If pdfMake is already loaded, generate PDF directly
    return new Promise<Blob>((resolve, reject) => {
      const docDefinition = {
        content: [
          {
            text: 'Sales Report',
            style: 'header',
            margin: [0, 0, 0, 20]
          },
          {
            text: `Generated on: ${new Date().toLocaleDateString()}`,
            alignment: 'right',
            margin: [0, 0, 0, 20]
          },
          {
            text: 'Monthly Sales',
            style: 'subheader',
            margin: [0, 20, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                ['Month', 'Amount'],
                ...reportData.salesByMonth.map(item => [item.month, item.amount.toFixed(2)])
              ]
            }
          },
          {
            text: 'Sales by Category',
            style: 'subheader',
            margin: [0, 20, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                ['Category', 'Amount'],
                ...reportData.salesByCategory.map(item => [item.category, item.amount.toFixed(2)])
              ]
            }
          },
          {
            text: 'Top Customers',
            style: 'subheader',
            margin: [0, 20, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                ['Customer', 'Total Spent'],
                ...reportData.topCustomers.map(item => [item.name, item.totalSpent.toFixed(2)])
              ]
            }
          },
          {
            text: 'Top Products',
            style: 'subheader',
            margin: [0, 20, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                ['Product', 'Total Sales'],
                ...reportData.topProducts.map(item => [item.name, item.totalSales.toFixed(2)])
              ]
            }
          }
        ],
        styles: {
          header: {
            fontSize: 24,
            bold: true,
            margin: [0, 0, 0, 20]
          },
          subheader: {
            fontSize: 18,
            bold: true,
            margin: [0, 20, 0, 10]
          }
        },
        defaultStyle: {
          font: 'Roboto'
        }
      };

      const pdfDoc = window.pdfMake.createPdf(docDefinition);
      pdfDoc.getBlob((blob: Blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate PDF blob'));
        }
      });
    });
  }
}
