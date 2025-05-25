import Link from 'next/link';
import React from 'react';
import { useCartStore } from '@/store/cartStore'; // Added import

export default function Layout({ children }: { children: React.ReactNode }) {
  const totalItems = useCartStore((state) => state.getCartTotalItems());

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            E-Commerce Platform
          </Link>
          <ul className="flex space-x-4 items-center"> {/* Added items-center for alignment */}
            <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
            <li><Link href="/products" className="hover:text-gray-300">Products</Link></li>
            <li>
              <Link href="/cart" className="hover:text-gray-300 relative flex items-center">
                Cart
                {totalItems > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
            </li>
            <li><Link href="/login" className="hover:text-gray-300">Login</Link></li>
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
