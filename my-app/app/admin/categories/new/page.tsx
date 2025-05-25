"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoryForm, { CategoryFormData } from '@/components/admin/CategoryForm'; // Adjust path
import apiClient from '@/utils/apiClient'; // Adjust path

export default function NewCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient('/api/admin/categories', {
        method: 'POST',
        body: data, 
      });

      if (response.error) {
        const errorMessage = response.data?.message || response.error;
        throw new Error(errorMessage || 'Failed to create category.');
      }

      router.push('/admin/categories');
      // Optionally, show a success toast/notification here
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false); 
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Category</h1>
      </div>
      <CategoryForm
        onSubmit={handleSubmit}
        isEditing={false}
        submitButtonText="Create Category"
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
