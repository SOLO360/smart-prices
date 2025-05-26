// Client-side component for editing products
'use client';

// Import necessary hooks and navigation utilities
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Main edit product component
export default function EditProduct() {
  // Get URL parameters and router
  const { id } = useParams();
  const router = useRouter();

  // State for product data
  const [product, setProduct] = useState({
    category: '',
    service: '',
    size: '',
    unitPrice: '',
    bulkPrice: '',
    turnaroundTime: '',
    notes: '',
  });

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      }
    };
    fetchProduct();
  }, [id]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (res.ok) {
      // Redirect to home page on success
      router.push('/');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(product).map(([key, value]) => (
          <div key={key}>
            <label className="block font-medium">{key}</label>
            <input
              name={key}
              value={value}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
