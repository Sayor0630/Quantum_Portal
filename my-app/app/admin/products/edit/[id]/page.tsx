"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm'; // Adjust path
import apiClient from '@/utils/apiClient'; // Adjust path
import { IProduct } from '@/server/models/Product'; // For type

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialData, setInitialData] = useState<Partial<IProduct> | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For form submission loading state
  const [isFetching, setIsFetching] = useState(true); // For initial data fetching
  const [error, setError] = useState<string | null>(null); // Combined error for fetch and submit

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setIsFetching(true);
        setError(null);
        try {
          const response = await apiClient<IProduct>(`/api/admin/products/${id}`);
          if (response.error) {
            throw new Error(response.data?.message || response.error || 'Failed to fetch product details.');
          }
          setInitialData(response.data);
        } catch (err: any) {
          setError(err.message || 'An unexpected error occurred while fetching data.');
        } finally {
          setIsFetching(false);
        }
      };
      fetchProduct();
    } else {
        setError("Product ID is missing.");
        setIsFetching(false);
    }
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // The 'id' is already part of the URL, so not needed in FormData explicitly for the API endpoint itself
      // However, ProductForm might construct FormData in a generic way
      const response = await apiClient(`/api/admin/products/${id}`, {
        method: 'PUT',
        body: formData,
        isFormData: true,
      });

      if (response.error) {
        const errorMessage = response.data?.message || response.data?.errors?.message || response.error;
        throw new Error(errorMessage || 'Failed to update product.');
      }
      
      router.push('/admin/products');
      // Optionally, show a success toast/notification here

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during update.');
      setIsLoading(false); 
    }
    // Do not set isLoading to false on success if redirecting
  };

  if (isFetching) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading product details...</div>;
  }

  if (error && !initialData) { // If fetch error and no data to display form
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">Error: {error}</div>;
  }

  if (!initialData) { // If not fetching and still no initial data (and no fetch error already shown)
    return <div className="container mx-auto px-4 py-8 text-center">Product not found or failed to load.</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
      </div>
      <ProductForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isEditing={true}
        submitButtonText="Update Product"
        isLoading={isLoading} // For submit button state
        error={error} // Display submit or fetch errors
      />
    </div>
  );
}
