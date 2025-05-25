"use client"; 
import Link from 'next/link';
import React, { useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation'; // Added useRouter
import { useCartStore } from '@/store/cartStore';
import useAuthStore from '@/store/authStore'; // Added authStore import

export default function Layout({ children }: { children: React.ReactNode }) {
  const totalItemsInCart = useCartStore((state) => state.getCartTotalItems()); // Renamed for clarity
  const { user, token, loadUserFromToken, logout } = useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    loadUserFromToken: state.loadUserFromToken,
    logout: state.logout,
  }));
  const router = useRouter();

  useEffect(() => {
    // loadUserFromToken is already called on authStore init,
    // but calling here ensures it's attempted if the store was somehow initialized
    // before localStorage was accessible or if we want to re-check on layout mount.
    // If the store's init call is reliable, this specific useEffect might be redundant.
    // For robustness, especially if a user logs in/out in another tab, this can be useful.
    if (!user && token === null) { // Check if token is explicitly null (not just initial undefined)
        loadUserFromToken();
    }
  }, [loadUserFromToken, user, token]); // Added user and token to dependency array

  const handleLogout = () => {
    logout();
    router.push('/'); // Redirect to homepage after logout
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            E-Commerce Platform
          </Link>
          <ul className="flex space-x-4 items-center">
            <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
            <li><Link href="/products" className="hover:text-gray-300">Products</Link></li>
            <li>
              <Link href="/cart" className="hover:text-gray-300 relative flex items-center">
                Cart
                {totalItemsInCart > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {totalItemsInCart}
                  </span>
                )}
              </Link>
            </li>
            {user ? (
              <>
                <li><Link href="/profile" className="hover:text-gray-300">Profile</Link></li>
                <li>
                  <button onClick={handleLogout} className="hover:text-gray-300">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link href="/login" className="hover:text-gray-300">Login</Link></li>
                <li><Link href="/register" className="hover:text-gray-300">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>© {new Date().getFullYear()} E-Commerce Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
