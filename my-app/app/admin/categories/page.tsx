"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/utils/apiClient'; // Adjust path
import { ICategory } from '@/server/models/Category'; // Adjust path
import mongoose from 'mongoose'; // For ObjectId type check if needed, though API handles it

interface PopulatedCategory extends Omit<ICategory, 'parentCategory'> {
  parentCategory?: { // Make parentCategory optional in the populated type
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
  } | null; // Explicitly allow null if that's how your API returns it for no parent
}


export default function ListCategoriesPage() {
  const [categories, setCategories] = useState<PopulatedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient<PopulatedCategory[]>('/api/admin/categories');
      if (response.error) {
        throw new Error(response.data?.message || response.error || 'Failed to fetch categories.');
      }
      setCategories(response.data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone. Child categories might also be affected.')) {
      return;
    }
    try {
      const response = await apiClient(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (response.error) {
        throw new Error(response.data?.message || response.error || 'Failed to delete category.');
      }
      fetchCategories(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'An error occurred during deletion.');
    }
  };

  if (isLoading && categories.length === 0) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading categories...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Categories</h1>
        <Link href="/admin/categories/new">
          <button className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300">
            Add New Category
          </button>
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-300 mb-6 text-center">
          Error: {error}
        </p>
      )}

      {categories.length === 0 && !isLoading ? (
        <div className="text-center py-10 bg-white p-6 rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat._id.toString()}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cat.parentCategory ? cat.parentCategory.name : <span className="text-gray-400 italic">None</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link href={`/admin/categories/edit/${cat._id.toString()}`} className="text-indigo-600 hover:text-indigo-900 hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(cat._id.toString())}
                      className="text-red-600 hover:text-red-900 hover:underline focus:outline-none"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
