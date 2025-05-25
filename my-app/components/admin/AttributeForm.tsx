"use client";
import { ICustomAttributeDefinition } from '@/server/models/CustomAttributeDefinition'; // Adjust path if necessary
import { useRouter } from 'next/navigation'; // Not used in this component directly, but often in parent
import { useState, useEffect } from 'react';

export interface AttributeFormData { // Exporting for use in parent components
  name: string;
  possibleValues: string; // Comma-separated string
}

interface AttributeFormProps {
  initialData?: Partial<ICustomAttributeDefinition>; // Making it Partial for flexibility
  onSubmit: (data: AttributeFormData) => Promise<any>; // Return type can be more specific
  isEditing: boolean;
  submitButtonText?: string;
  isLoading?: boolean; // Allow parent to control loading state if preferred
  error?: string | null; // Allow parent to pass down error messages
}

export default function AttributeForm({ 
  initialData, 
  onSubmit, 
  isEditing, 
  submitButtonText = isEditing ? "Update Attribute" : "Create Attribute",
  isLoading: parentIsLoading, // Use parent's loading state if provided
  error: parentError // Use parent's error state if provided
}: AttributeFormProps) {
  const [name, setName] = useState('');
  const [possibleValues, setPossibleValues] = useState(''); // Comma-separated string
  const [internalError, setInternalError] = useState<string | null>(null);
  const [internalIsLoading, setInternalIsLoading] = useState(false);

  // Determine which error/loading state to use
  const error = parentError !== undefined ? parentError : internalError;
  const isLoading = parentIsLoading !== undefined ? parentIsLoading : internalIsLoading;


  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPossibleValues(Array.isArray(initialData.possibleValues) ? initialData.possibleValues.join(', ') : (initialData.possibleValues as string || ''));
    } else {
      // Reset form if initialData is not provided (e.g., for create form after an edit)
      setName('');
      setPossibleValues('');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parentError === undefined) setInternalError(null); // Reset internal error if parent isn't managing it
    if (parentIsLoading === undefined) setInternalIsLoading(true); // Set internal loading if parent isn't managing it
    
    try {
      await onSubmit({ name, possibleValues });
      // Success is typically handled by the parent page (e.g., redirect or state update)
      // If it's a create form and not redirecting, consider resetting fields:
      // if (!isEditing && !initialData) { // A bit simplistic, depends on desired UX
      //   setName('');
      //   setPossibleValues('');
      // }
    } catch (err: any) {
      if (parentError === undefined) {
        setInternalError(err.message || `Failed to ${isEditing ? 'update' : 'create'} attribute.`);
      }
      // If parent is managing error, it should catch and set it via onSubmit's promise rejection
    } finally {
      if (parentIsLoading === undefined) setInternalIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6 bg-white rounded-lg shadow-md">
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-300">{error}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Attribute Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., Color, Size"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="possibleValues" className="block text-sm font-medium text-gray-700 mb-1">Possible Values (comma-separated)</label>
        <textarea
          id="possibleValues"
          value={possibleValues}
          onChange={(e) => setPossibleValues(e.target.value)}
          rows={4}
          className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., Red, Blue, Green"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500 mt-1.5">Enter values separated by commas. Example: Small, Medium, Large. Leading/trailing spaces will be trimmed.</p>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : submitButtonText}
        </button>
      </div>
    </form>
  );
}
