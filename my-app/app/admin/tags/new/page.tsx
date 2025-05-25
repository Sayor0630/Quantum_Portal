"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TagForm, { TagFormData } from '@/components/admin/TagForm'; // Adjust path
import apiClient from '@/utils/apiClient'; // Adjust path

export default function NewTagPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: TagFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient('/api/admin/tags', {
        method: 'POST',
        body: data, 
      });

      if (response.error) {
        const errorMessage = response.data?.message || response.error;
        throw new Error(errorMessage || 'Failed to create tag.');
      }

      router.push('/admin/tags');
      // Optionally, show a success toast/notification here
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false); 
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Tag</h1>
      </div>
      <TagForm
        onSubmit={handleSubmit}
        isEditing={false}
        submitButtonText="Create Tag"
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
