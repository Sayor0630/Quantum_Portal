"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // For displaying product image
import apiClient from '@/utils/apiClient'; // Adjust path
import { IProduct } from '@/server/models/Product'; // Adjust path
import { ICategory } from '@/server/models/Category'; // For populated category type

interface PopulatedProduct extends Omit<IProduct, 'category' | 'tags'> {
  category?: ICategory; // Assuming category is populated with its full object or at least name
  tags: Array<{ _id: string; name: string; slug: string }>; // Assuming tags are populated
  // customAttributes are also populated by the API but might not be displayed directly in list
}

interface ApiResponse {
  products: PopulatedProduct[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

export default function ListProductsPage() {
  const [products, setProducts] = useState<PopulatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // Or get from API response if dynamic

  const fetchProducts = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient<ApiResponse>(`/api/admin/products?page=${page}&limit=${itemsPerPage}`);
      if (response.error) {
        throw new Error(response.data?.message || response.error || 'Failed to fetch products.');
      }
      setProducts(response.data.products);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setProducts([]); // Clear products on error
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await apiClient(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (response.error) {
        throw new Error(response.data?.message || response.error || 'Failed to delete product.');
      }
      // Refresh the list, preferably staying on the current page or going to prev if current page becomes empty
      fetchProducts(currentPage); 
      // TODO: Add logic to adjust currentPage if it becomes empty after deletion
    } catch (err: any) {
      setError(err.message || 'An error occurred during deletion.');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  if (isLoading && products.length === 0) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading products...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Products</h1>
        <Link href="/admin/products/new">
          <button className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300">
            Add New Product
          </button>
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-300 mb-6 text-center">
          Error: {error}
        </p>
      )}

      {products.length === 0 && !isLoading ? (
        <div className="text-center py-10 bg-white p-6 rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> {/* Example icon */}
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id.toString()}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {product.images && product.images.length > 0 ? (
                        <Image src={product.images[0]} alt={product.name} width={50} height={50} className="object-cover rounded" />
                      ) : (
                        <div className="w-[50px] h-[50px] bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name || <span className="italic text-gray-400">None</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stockQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link href={`/admin/products/edit/${product._id.toString()}`} className="text-indigo-600 hover:text-indigo-900 hover:underline">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id.toString())}
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
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="mt-8 flex justify-between items-center" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
