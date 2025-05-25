"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, user, token, clearError } = useAuthStore((state) => ({
    login: state.login,
    isLoading: state.isLoading,
    error: state.error,
    user: state.user,
    token: state.token,
    clearError: state.clearError,
  }));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationSuccessMessage, setRegistrationSuccessMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('registrationSuccess') === 'true') {
      setRegistrationSuccessMessage('Registration successful! Please log in.');
      // Optionally, remove the query param from URL
      // router.replace('/login', undefined); // Next.js 13+ way to clear query params
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (user && token) { // Check both user and token from store
      router.push('/profile'); // Or last intended page
    }
     // Clear errors when component mounts or unmounts
     return () => {
      clearError();
    };
  }, [user, token, router, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear previous errors
    setRegistrationSuccessMessage(''); // Clear success message on new attempt

    const success = await login(email, password);
    if (success) {
      router.push('/profile'); // Or last intended page
    }
    // Error is automatically set in the store and will be displayed
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl">
        <div>
          <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Login to Your Account
          </h1>
        </div>
        {registrationSuccessMessage && (
          <p className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm" role="alert">
            {registrationSuccessMessage}
          </p>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
              {error}
            </p>
          )}
          <div className="space-y-4"> {/* Removed rounded-md and -space-y-px for individual field styling */}
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="#" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:opacity-60"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        {/* Social Login Buttons Placeholder - Kept as is */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3">
            <div>
              <button
                type="button"
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-60"
              >
                <svg className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 251.4 50 248 50c-45 0-84.3 20.1-109.3 49.7C113.7 126.3 100 160.8 100 201.6s13.7 75.3 38.7 103.3c25 29.7 57.2 48.3 90.7 48.3 31.5 0 59.7-12.5 79.3-32.5 21.2-21.2 28.9-51 28.9-74.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Login with Google
              </button>
            </div>
          </div>
        </div>

        <div className="text-sm text-center mt-8">
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
            Don&apos;t have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}
