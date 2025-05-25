"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/utils/apiClient'; // Adjust path
import { ITag } from '@/server/models/Tag'; // Adjust path

export default function ListTagsPage() {
  const [tags, setTags] = useState<ITag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient<ITag[]>('/api/admin/tags');
      if (response.error) {
        throw new Error(response.data?.message || response.error || 'Failed to fetch tags.');
      }
      setTags(response.data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await apiClient(`/api/admin/tags/${id}`, { method: 'DELETE' });
      if (response.error) {
        throw new Error(response.data?.message || response.error || 'Failed to delete tag.');
      }
      fetchTags(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'An error occurred during deletion.');
    }
  };

  if (isLoading && tags.length === 0) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading tags...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Tags</h1>
        <Link href="/admin/tags/new">
          <button className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300">
            Add New Tag
          </button>
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-300 mb-6 text-center">
          Error: {error}
        </p>
      )}

      {tags.length === 0 && !isLoading ? (
        <div className="text-center py-10 bg-white p-6 rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7A2 2 0 0112 21H5a2 2 0 01-2-2V5a2 2 0 012-2h2zm0 0v.01" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tags found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new tag.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag._id.toString()}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tag.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tag.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link href={`/admin/tags/edit/${tag._id.toString()}`} className="text-indigo-600 hover:text-indigo-900 hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(tag._id.toString())}
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
