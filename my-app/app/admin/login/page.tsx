"use client";
import { useState, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Redirect if already logged in as admin
  useEffect(() => {
    const token = localStorage.getItem('adminAuthToken');
    const rolesString = localStorage.getItem('userRoles');
    if (token && rolesString) {
      try {
        const userRoles = JSON.parse(rolesString);
        if (Array.isArray(userRoles) && userRoles.includes('admin')) {
          router.replace('/admin/dashboard'); // Use replace to avoid login page in history
        }
      } catch (e) {
        console.error("Error parsing userRoles during login page auth check:", e);
        // Clear potentially corrupted items
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('userRoles');
      }
    }
  }, [router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      if (data.token && data.user?.roles?.includes('admin')) {
        localStorage.setItem('adminAuthToken', data.token);
        localStorage.setItem('userRoles', JSON.stringify(data.user.roles));
        router.push('/admin/dashboard'); // Use push after successful login
      } else {
        throw new Error('Access denied. Administrator privileges required.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200"> {/* Changed bg to gray-200 for slight contrast from main layout */}
      <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md"> {/* Increased shadow, max-w-md */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">Admin Panel Login</h1> {/* Adjusted text size and color */}
        {error && (
            <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
