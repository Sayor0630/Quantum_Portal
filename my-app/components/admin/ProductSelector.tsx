"use client";
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/utils/apiClient';
import { IProduct } from '@/server/models/Product'; // For product type
import Image from 'next/image';

interface ProductSelectorProps {
  selectedProductIds: string[];
  onChange: (newSelectedProductIds: string[]) => void;
  multiSelect: boolean;
}

interface SimplifiedProduct extends Pick<IProduct, '_id' | 'name' | 'images'> {
  // Only fetch necessary fields if possible, or define a subset here
}

interface ApiProductResponse {
  products: SimplifiedProduct[];
  // Add pagination fields if API supports/requires it for product list
  // currentPage: number;
  // totalPages: number;
}


export default function ProductSelector({
  selectedProductIds,
  onChange,
  multiSelect,
}: ProductSelectorProps) {
  const [allProducts, setAllProducts] = useState<SimplifiedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Using admin endpoint for products, assuming it returns enough info.
      // Add query params for lighter payload if needed e.g. ?fields=name,images,_id
      const response = await apiClient<ApiProductResponse>('/api/admin/products?limit=200'); // Fetch more for client-side filter
      if (response.error || !response.data?.products) {
        throw new Error(response.data?.message as string || response.error || 'Failed to fetch products.');
      }
      setAllProducts(response.data.products);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSelectProduct = (productId: string) => {
    if (multiSelect) {
      const newSelectedIds = selectedProductIds.includes(productId)
        ? selectedProductIds.filter(id => id !== productId)
        : [...selectedProductIds, productId];
      onChange(newSelectedIds);
    } else {
      onChange([productId]); // For single select, replace current selection
    }
  };

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <p className="text-sm text-gray-500 py-2">Loading products...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500 py-2">Error loading products: {error}</p>;
  }

  return (
    <div className="space-y-3 p-3 border border-gray-300 rounded-md bg-gray-50 max-h-96 overflow-y-auto">
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      {filteredProducts.length === 0 ? (
        <p className="text-sm text-gray-500">No products found matching your search.</p>
      ) : (
        <ul className="space-y-2">
          {filteredProducts.map(product => (
            <li
              key={product._id.toString()}
              onClick={() => handleSelectProduct(product._id.toString())}
              className={`p-2.5 border rounded-md cursor-pointer flex items-center space-x-3 transition-colors
                ${selectedProductIds.includes(product._id.toString())
                  ? 'bg-blue-100 border-blue-400 hover:bg-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-100'
                }`}
            >
              <input
                type={multiSelect ? "checkbox" : "radio"}
                name={multiSelect ? `product-${product._id}` : "product-selector"}
                checked={selectedProductIds.includes(product._id.toString())}
                readOnly // Click handled by li for better UX
                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-none"
              />
               <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                    src={(product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/50x50?text=NoImg')}
                    alt={product.name}
                    fill
                    sizes="50px"
                    className="object-cover rounded"
                />
              </div>
              <span className="text-sm font-medium text-gray-800 truncate">{product.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
