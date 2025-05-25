"use client";
import { ITag } from '@/server/models/Tag'; // Adjust path
import { useState, useEffect } from 'react';

export interface TagFormData {
  name: string;
}

interface TagFormProps {
  initialData?: Partial<ITag>;
  onSubmit: (data: TagFormData) => Promise<any>;
  isEditing: boolean;
  submitButtonText?: string;
  isLoading?: boolean;
  error?: string | null;
}

export default function TagForm({
  initialData,
  onSubmit,
  isEditing,
  submitButtonText = isEditing ? "Update Tag" : "Create Tag",
  isLoading: parentIsLoading,
  error: parentError,
}: TagFormProps) {
  const [name, setName] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);
  const [internalIsLoading, setInternalIsLoading] = useState(false);

  const error = parentError !== undefined ? parentError : internalError;
  const isLoading = parentIsLoading !== undefined ? parentIsLoading : internalIsLoading;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
    } else {
      setName('');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parentError === undefined) setInternalError(null);
    if (parentIsLoading === undefined) setInternalIsLoading(true);

    try {
      await onSubmit({ name });
    } catch (err: any) {
      if (parentError === undefined) {
        setInternalError(err.message || `Failed to ${isEditing ? 'update' : 'create'} tag.`);
      }
    } finally {
      if (parentIsLoading === undefined) setInternalIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6 bg-white rounded-lg shadow-md">
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-300">{error}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., New Arrival, Best Seller"
          disabled={isLoading}
        />
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
