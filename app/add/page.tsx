// Import necessary components for the add product page
import { AddProductForm } from '@/components/add-product-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Main page component for adding new products
export default function AddProductPage() {
  return (
    // Container with max width and centering
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>Fill in the details for the new product or service.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Form component for adding new products */}
          <AddProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
