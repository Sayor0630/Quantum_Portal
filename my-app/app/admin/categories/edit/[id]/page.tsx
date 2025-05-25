"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CategoryForm, { CategoryFormData } from '@/components/admin/CategoryForm'; // Adjust path
import apiClient from '@/utils/apiClient'; // Adjust path
import { ICategory } from '@/server/models/Category'; // For type

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialData, setInitialData] = useState<Partial<ICategory> | null>(null);
  const [isLoading, setIsLoading] = useState(false); // General loading for submit and initial fetch
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        setIsLoading(true); // Use general loading for initial fetch
        setFetchError(null);
        try {
          const response = await apiClient<ICategory>(`/api/admin/categories/${id}`);
          if (response.error) {
            throw new Error(response.data?.message || response.error || 'Failed to fetch category details.');
          }
          setInitialData(response.data);
        } catch (err: any) {
          setFetchError(err.message || 'An unexpected error occurred while fetching data.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id]);

  const handleSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const response = await apiClient(`/api/admin/categories/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (response.error) {
        const errorMessage = response.data?.message || response.error;
        throw new Error(errorMessage || 'Failed to update category.');
      }
      
      router.push('/admin/categories');
      // Optionally, show a success toast/notification here

    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred during update.');
      setIsLoading(false); 
    }
  };

  if (isLoading && !initialData && !fetchError) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading category details...</div>;
  }

  if (fetchError) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">Error: {fetchError}</div>;
  }

  if (!initialData && !isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Category not found or failed to load.</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Category</h1>
      </div>
      {initialData && (
        <CategoryForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isEditing={true}
          submitButtonText="Update Category"
          isLoading={isLoading} // This will be true during submit and initial fetch if not careful
          error={submitError}
          currentCategoryId={id} // Pass current category ID to exclude from parent options
        />
      )}
    </div>
  );
}
