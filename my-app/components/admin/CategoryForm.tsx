"use client";
import { ICategory } from '@/server/models/Category'; // Adjust path
import { useState, useEffect } from 'react';
import apiClient from '@/utils/apiClient'; // Adjust path

export interface CategoryFormData {
  name: string;
  parentCategory?: string | null; // ObjectId as string, or null/empty for no parent
}

interface CategoryFormProps {
  initialData?: Partial<ICategory>;
  onSubmit: (data: CategoryFormData) => Promise<any>;
  isEditing: boolean;
  submitButtonText?: string;
  isLoading?: boolean;
  error?: string | null;
  currentCategoryId?: string; // To exclude from parent category dropdown when editing
}

export default function CategoryForm({
  initialData,
  onSubmit,
  isEditing,
  submitButtonText = isEditing ? "Update Category" : "Create Category",
  isLoading: parentIsLoading,
  error: parentError,
  currentCategoryId, // Used to filter out the current category from parent options
}: CategoryFormProps) {
  const [name, setName] = useState('');
  const [parentCategory, setParentCategory] = useState<string | null>(null);
  const [allCategories, setAllCategories] = useState<ICategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true); // Loading for category dropdown

  const [internalError, setInternalError] = useState<string | null>(null);
  const [internalIsLoading, setInternalIsLoading] = useState(false);

  const error = parentError !== undefined ? parentError : internalError;
  const isLoading = parentIsLoading !== undefined ? parentIsLoading : internalIsLoading;

  useEffect(() => {
    // Fetch all categories for the parent dropdown
    const fetchCategoriesForDropdown = async () => {
      setCategoriesLoading(true);
      try {
        const response = await apiClient<ICategory[]>('/api/admin/categories');
        if (response.error) {
          console.error("Failed to fetch categories for dropdown:", response.error);
          setAllCategories([]); // Set to empty on error
        } else {
          // Filter out the current category if editing, to prevent self-parenting
          setAllCategories(
            currentCategoryId 
            ? response.data.filter(cat => cat._id.toString() !== currentCategoryId) 
            : response.data
          );
        }
      } catch (err) {
        console.error("Error fetching categories for dropdown:", err);
        setAllCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategoriesForDropdown();
  }, [currentCategoryId]); // Refetch if currentCategoryId changes (though unlikely for a single form instance)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      // initialData.parentCategory could be an object if populated, or just an ID string
      const parentId = initialData.parentCategory 
        ? (typeof initialData.parentCategory === 'string' ? initialData.parentCategory : (initialData.parentCategory as ICategory)._id.toString())
        : null;
      setParentCategory(parentId);
    } else {
      setName('');
      setParentCategory(null);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parentError === undefined) setInternalError(null);
    if (parentIsLoading === undefined) setInternalIsLoading(true);

    try {
      await onSubmit({ name, parentCategory: parentCategory || undefined }); // Send undefined if null/empty
    } catch (err: any) {
      if (parentError === undefined) {
        setInternalError(err.message || `Failed to ${isEditing ? 'update' : 'create'} category.`);
      }
    } finally {
      if (parentIsLoading === undefined) setInternalIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6 bg-white rounded-lg shadow-md">
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-300">{error}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., Electronics, Apparel"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">Parent Category (Optional)</label>
        <select
          id="parentCategory"
          value={parentCategory || ''} // Ensure value is string for select, empty for no selection
          onChange={(e) => setParentCategory(e.target.value || null)} // Set to null if empty string selected
          disabled={isLoading || categoriesLoading}
          className="mt-1 block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
        >
          <option value="">-- No Parent Category --</option>
          {categoriesLoading ? (
            <option disabled>Loading categories...</option>
          ) : allCategories.length > 0 ? (
            allCategories.map((cat) => (
              <option key={cat._id.toString()} value={cat._id.toString()}>
                {cat.name}
              </option>
            ))
          ) : (
            <option disabled>No categories available to select as parent.</option>
          )}
        </select>
         <p className="text-xs text-gray-500 mt-1.5">Select a parent if this is a sub-category.</p>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || categoriesLoading}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : submitButtonText}
        </button>
      </div>
    </form>
  );
}
