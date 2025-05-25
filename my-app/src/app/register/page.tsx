"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, user, clearError } = useAuthStore((state) => ({
    register: state.register,
    isLoading: state.isLoading,
    error: state.error,
    user: state.user,
    clearError: state.clearError,
  }));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // If user becomes authenticated (e.g. auto-login after register, though not default in store)
    // or if they navigate here while logged in.
    if (user) {
      router.push('/profile');
    }
    // Clear errors when component mounts or unmounts
    return () => {
      clearError();
    };
  }, [user, router, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError(); // Clear previous global errors

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    const success = await register(name, email, password);
    if (success) {
      // Registration successful, user can now login.
      // Optionally, display a success message before redirect or redirect immediately.
      // For simplicity, redirecting to login.
      router.push('/login?registrationSuccess=true'); 
    } else {
      // Error is already set in the authStore, it will be displayed.
      // If specific form error needed from API, it would be handled here.
      setFormError(error); // Display store error if any
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl">
        <div>
          <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Create an Account
          </h1>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || formError) && (
            <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
              {formError || error}
            </p>
          )}
          {/* Using -space-y-px for joined input fields look is optional */}
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Full Name"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password (min. 6 characters)"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm Password"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:opacity-60"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}
