"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // useParams to get [id]
import AttributeForm, { AttributeFormData } from '@/components/admin/AttributeForm'; // Adjust path
import apiClient from '@/utils/apiClient'; // Adjust path
import { ICustomAttributeDefinition } from '@/server/models/CustomAttributeDefinition'; // For type

export default function EditAttributePage() {
  const router = useRouter();
  const params = useParams(); // Get route params
  const id = params.id as string; // Extract 'id'

  const [initialData, setInitialData] = useState<Partial<ICustomAttributeDefinition> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null); // Error for initial data fetching
  const [submitError, setSubmitError] = useState<string | null>(null); // Error for form submission

  useEffect(() => {
    if (id) {
      const fetchAttribute = async () => {
        setIsLoading(true);
        setFetchError(null);
        try {
          const response = await apiClient<ICustomAttributeDefinition>(`/api/admin/attributes/${id}`);
          if (response.error) {
            throw new Error(response.data?.message || response.error || 'Failed to fetch attribute details.');
          }
          setInitialData(response.data);
        } catch (err: any) {
          setFetchError(err.message || 'An unexpected error occurred while fetching data.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAttribute();
    }
  }, [id]);

  const handleSubmit = async (data: AttributeFormData) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      const response = await apiClient(`/api/admin/attributes/${id}`, {
        method: 'PUT',
        body: data, // API expects name and possibleValues (string)
      });

      if (response.error) {
         const errorMessage = response.data?.message || response.error;
        throw new Error(errorMessage || 'Failed to update attribute.');
      }
      
      router.push('/admin/attributes');
      // Optionally, show a success toast/notification here

    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred during update.');
      setIsLoading(false); // Stop loading on error
    }
    // Do not set isLoading to false here if navigation occurs.
  };

  if (isLoading && !initialData && !fetchError) { // Show loading only if initialData is not yet fetched
    return <div className="container mx-auto px-4 py-8 text-center">Loading attribute details...</div>;
  }

  if (fetchError) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">Error: {fetchError}</div>;
  }

  if (!initialData && !isLoading) { // If done loading and still no initial data (and no fetch error already shown)
    return <div className="container mx-auto px-4 py-8 text-center">Attribute not found or failed to load.</div>;
  }
  
  // Only render form if initialData is available
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Attribute</h1>
      </div>
      {initialData && (
        <AttributeForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isEditing={true}
          submitButtonText="Update Attribute"
          isLoading={isLoading} // This will be true during submit
          error={submitError}
        />
      )}
    </div>
  );
}
