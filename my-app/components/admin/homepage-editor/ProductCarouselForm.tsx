"use client";
import { useState, useEffect } from 'react';
import ProductSelector from '@/components/admin/ProductSelector'; // Adjust path

export interface ProductCarouselConfig {
  title: string;
  productIds: string[]; // Array of MongoDB ObjectIds as strings
}

interface ProductCarouselFormProps {
  initialConfig: Partial<ProductCarouselConfig>;
  onSubmit: (config: ProductCarouselConfig) => void;
  isLoading?: boolean;
}

export default function ProductCarouselForm({ 
  initialConfig, 
  onSubmit, 
  isLoading 
}: ProductCarouselFormProps) {
  const [title, setTitle] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    setTitle(initialConfig.title || '');
    setSelectedProductIds(initialConfig.productIds || []);
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, productIds: selectedProductIds });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1"> {/* Reduced padding for modal use */}
      <div>
        <label htmlFor="carouselTitle" className="block text-sm font-medium text-gray-700">Carousel Title</label>
        <input
          type="text"
          id="carouselTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Products for Carousel</label>
        <ProductSelector
          selectedProductIds={selectedProductIds}
          onChange={setSelectedProductIds}
          multiSelect={true}
        />
        <p className="text-xs text-gray-500 mt-1">Selected {selectedProductIds.length} product(s).</p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
        >
          {isLoading ? 'Saving...' : 'Save Product Carousel'}
        </button>
      </div>
    </form>
  );
}
