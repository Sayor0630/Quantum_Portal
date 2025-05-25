"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/utils/apiClient'; // Adjust path
import { ICustomAttributeDefinition } from '@/server/models/CustomAttributeDefinition'; // Adjust path

export default function ListAttributesPage() {
  const [attributes, setAttributes] = useState<ICustomAttributeDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttributes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient<ICustomAttributeDefinition[]>('/api/admin/attributes');
      if (response.error) {
        throw new Error(response.data?.message || response.error || 'Failed to fetch attributes.');
      }
      setAttributes(response.data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attribute? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await apiClient(`/api/admin/attributes/${id}`, { method: 'DELETE' });
      if (response.error) {
        throw new Error(response.data?.message || response.error || 'Failed to delete attribute.');
      }
      // Refresh the list after successful deletion
      fetchAttributes();
      // Optionally, show a success toast/notification
    } catch (err: any) {
      setError(err.message || 'An error occurred during deletion.');
      // Keep the error displayed until next successful fetch or action
    }
  };

  if (isLoading && attributes.length === 0) { // Show loading only on initial load
    return <div className="container mx-auto px-4 py-8 text-center">Loading attributes...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Custom Attributes</h1>
        <Link href="/admin/attributes/new">
          <button className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300">
            Add New Attribute
          </button>
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-300 mb-6 text-center">
          Error: {error}
        </p>
      )}

      {attributes.length === 0 && !isLoading ? (
        <div className="text-center py-10 bg-white p-6 rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No attributes found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new custom attribute.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Possible Values</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attributes.map((attr) => (
                <tr key={attr._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attr.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Array.isArray(attr.possibleValues) ? attr.possibleValues.join(', ') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(attr.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <Link href={`/admin/attributes/edit/${attr._id}`} className="text-indigo-600 hover:text-indigo-900 hover:underline">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(attr._id)}
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
