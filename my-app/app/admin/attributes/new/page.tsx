"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AttributeForm, { AttributeFormData } from '@/components/admin/AttributeForm'; // Adjust path
import apiClient from '@/utils/apiClient'; // Adjust path

export default function NewAttributePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AttributeFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient('/api/admin/attributes', {
        method: 'POST',
        body: data, // API expects name and possibleValues (string)
      });

      if (response.error) {
        // Prefer message from response.data if available (more specific)
        const errorMessage = response.data?.message || response.error;
        throw new Error(errorMessage || 'Failed to create attribute.');
      }

      // On successful creation, redirect to the attributes list page
      router.push('/admin/attributes');
      // Optionally, show a success toast/notification here
      
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsLoading(false); // Ensure loading is stopped on error
    } 
    // Do not set isLoading to false here if navigation occurs,
    // as the component will unmount. It's set to false only on error.
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Attribute</h1>
      </div>
      <AttributeForm
        onSubmit={handleSubmit}
        isEditing={false}
        submitButtonText="Create Attribute"
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
