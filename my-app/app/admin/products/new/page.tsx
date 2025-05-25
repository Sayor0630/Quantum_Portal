"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm'; // Adjust path
import apiClient from '@/utils/apiClient'; // Adjust path

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => { // ProductForm now passes FormData directly
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient('/api/admin/products', {
        method: 'POST',
        body: formData,
        isFormData: true, // Indicate that the body is FormData
      });

      if (response.error) {
        const errorMessage = response.data?.message || response.data?.errors?.message || response.error;
        throw new Error(errorMessage || 'Failed to create product.');
      }

      router.push('/admin/products');
      // Optionally, show a success toast/notification here
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false); 
    }
    // Do not set isLoading to false on success if redirecting, component will unmount.
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Product</h1>
      </div>
      <ProductForm
        onSubmit={handleSubmit}
        isEditing={false}
        submitButtonText="Create Product"
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
