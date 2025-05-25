"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TagForm, { TagFormData } from '@/components/admin/TagForm'; // Adjust path
import apiClient from '@/utils/apiClient'; // Adjust path
import { ITag } from '@/server/models/Tag'; // For type

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialData, setInitialData] = useState<Partial<ITag> | null>(null);
  const [isLoading, setIsLoading] = useState(false); // General loading for submit and initial fetch
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchTag = async () => {
        setIsLoading(true); 
        setFetchError(null);
        try {
          const response = await apiClient<ITag>(`/api/admin/tags/${id}`);
          if (response.error) {
            throw new Error(response.data?.message || response.error || 'Failed to fetch tag details.');
          }
          setInitialData(response.data);
        } catch (err: any) {
          setFetchError(err.message || 'An unexpected error occurred while fetching data.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchTag();
    }
  }, [id]);

  const handleSubmit = async (data: TagFormData) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const response = await apiClient(`/api/admin/tags/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (response.error) {
        const errorMessage = response.data?.message || response.error;
        throw new Error(errorMessage || 'Failed to update tag.');
      }
      
      router.push('/admin/tags');
      // Optionally, show a success toast/notification here

    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred during update.');
      setIsLoading(false); 
    }
  };

  if (isLoading && !initialData && !fetchError) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading tag details...</div>;
  }

  if (fetchError) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">Error: {fetchError}</div>;
  }

  if (!initialData && !isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Tag not found or failed to load.</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Tag</h1>
      </div>
      {initialData && (
        <TagForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isEditing={true}
          submitButtonText="Update Tag"
          isLoading={isLoading}
          error={submitError}
        />
      )}
    </div>
  );
}
