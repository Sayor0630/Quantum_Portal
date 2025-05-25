"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/utils/apiClient'; // Adjust path
import { IUser } from '@/server/models/User'; // Adjust path

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<IUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For initial data fetch and submit
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient<IUser>(`/api/admin/users/${id}`);
      if (response.error || !response.data) {
        throw new Error(response.data?.message as string || response.error || 'Failed to fetch user details.');
      }
      setUser(response.data);
      setSelectedRoles(response.data.roles || []);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching data.');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleRoleChange = (role: string) => {
    setSelectedRoles(prevRoles => 
      prevRoles.includes(role) 
        ? prevRoles.filter(r => r !== role) 
        : [...prevRoles, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (selectedRoles.length === 0) {
        setError("A user must have at least one role.");
        setIsLoading(false);
        return;
    }
    
    // Basic safeguard: prevent admin from removing their own 'admin' role if it's the only role they have and they are editing themselves.
    // The API has a more robust check for the last admin.
    const authUser = useAuthStore.getState().user; // Assuming authStore is set up for admin panel too.
                                                // If not, this check needs the admin's ID from token.
                                                // For now, this part is illustrative. The API check is more critical.
    // if (authUser && authUser._id === id && !selectedRoles.includes('admin') && user?.roles.includes('admin')) {
    //    const currentAdminIsRemovingOwnAdminRole = true; // Further logic would be needed here.
    // }


    try {
      const response = await apiClient(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: { roles: selectedRoles },
      });

      if (response.error || !response.data) {
        const errorMessage = response.data?.message as string || response.error;
        throw new Error(errorMessage || 'Failed to update user roles.');
      }
      
      router.push('/admin/users');
      // Optionally, show a success toast/notification here

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during update.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !user) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading user details...</div>;
  }

  if (error && !user) { // If fetch error and no user data to display form
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">Error: {error}</div>;
  }

  if (!user) { 
    return <div className="container mx-auto px-4 py-8 text-center">User not found or failed to load.</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit User Roles: <span className="font-normal">{user.name}</span></h1>
      
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-300">{error}</p>}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">User Name</label>
          <p className="mt-1 text-md text-gray-800 p-2.5 bg-gray-100 border border-gray-300 rounded-md">{user.name}</p>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <p className="mt-1 text-md text-gray-800 p-2.5 bg-gray-100 border border-gray-300 rounded-md">{user.email}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
          <div className="space-y-2">
            <div>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  value="customer"
                  checked={selectedRoles.includes('customer')}
                  onChange={() => handleRoleChange('customer')}
                  className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="ml-2 text-gray-700">Customer</span>
              </label>
            </div>
            <div>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  value="admin"
                  checked={selectedRoles.includes('admin')}
                  onChange={() => handleRoleChange('admin')}
                  className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="ml-2 text-gray-700">Admin</span>
              </label>
            </div>
          </div>
           <p className="text-xs text-gray-500 mt-1.5">Users must have at least one role. Be cautious when modifying admin roles.</p>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
          >
            {isLoading ? 'Saving...' : 'Save Roles'}
          </button>
        </div>
      </form>
    </div>
  );
}
