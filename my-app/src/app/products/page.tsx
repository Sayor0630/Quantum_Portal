"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation'; // For reading and setting URL query params
import ProductCard from '@/components/products/ProductCard';
import apiClient from '@/utils/apiClient';
import { IProduct } from '@/server/models/Product';
import { ICategory } from '@/server/models/Category';
import { ITag } from '@/server/models/Tag';
import Link from 'next/link'; // Keep for links not part of filter re-fetch

interface ApiProductResponse {
  products: IProduct[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

// Placeholder for filter data - to be fetched
interface FilterData {
  categories: ICategory[];
  tags: ITag[];
  // Add other filter options like price ranges, etc. if needed
}

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [filterData, setFilterData] = useState<FilterData>({ categories: [], tags: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
  // Add more filter states: priceMin, priceMax, etc.

  // Fetch initial filter data (categories, tags)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // In a real app, these might be separate public API endpoints
        // For now, using admin routes assuming they are GET and don't strictly require admin for read-only
        const catRes = await apiClient<ICategory[]>('/api/admin/categories'); // Or a public /api/categories
        const tagRes = await apiClient<ITag[]>('/api/admin/tags');       // Or a public /api/tags
        
        setFilterData({
          categories: catRes.data || [],
          tags: tagRes.data || [],
        });
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
        // Handle error for filter options loading if necessary
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch products based on current filters and page
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('limit', '12'); // Or make dynamic
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedTag) params.append('tag', selectedTag);
    if (selectedSort) params.append('sort', selectedSort);
    // Append other filters like priceRange, searchTerm etc.

    // Update URL query string without page reload, for bookmarking/sharing
    // router.push(`${pathname}?${params.toString()}`, { scroll: false }); // Causes re-render loop with useEffect dependency on searchParams
                                                                      // Better to update URL only when filters actually change via user interaction

    try {
      const response = await apiClient<ApiProductResponse>(`/api/products?${params.toString()}`);
      if (response.error) {
        throw new Error(response.data?.message as string || response.error || 'Failed to fetch products.');
      }
      setProducts(response.data.products);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.totalProducts);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedCategory, selectedTag, selectedSort]); // Removed router, pathname from dependencies to avoid loop

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Handler to update filters and URL
  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTag) params.set('tag', selectedTag);
    if (selectedSort) params.set('sort', selectedSort);
    // Reset page to 1 when filters change
    params.set('page', '1'); 
    setCurrentPage(1); // Also reset state for current page
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    // fetchProducts will be called by the useEffect watching these state variables
  };

  useEffect(() => { // This effect will run when URL search params change due to router.push
    const newPage = Number(searchParams.get('page')) || 1;
    const newCategory = searchParams.get('category') || '';
    const newTag = searchParams.get('tag') || '';
    const newSort = searchParams.get('sort') || 'newest';

    if (newPage !== currentPage) setCurrentPage(newPage);
    if (newCategory !== selectedCategory) setSelectedCategory(newCategory);
    if (newTag !== selectedTag) setSelectedTag(newTag);
    if (newSort !== selectedSort) setSelectedSort(newSort);
  }, [searchParams, currentPage, selectedCategory, selectedTag, selectedSort]);


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      // setCurrentPage(newPage); // This will be handled by the useEffect watching searchParams
    }
  };


  // Placeholder for color/size filters - not implemented with API yet
  const colors = ["Red", "Blue", "Green", "Black", "White", "Silver"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center tracking-tight">Our Products</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 lg:w-1/5 p-6 bg-white border border-gray-200 rounded-lg shadow-sm h-fit">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Filters</h2>
          
          <div className="mb-4">
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              id="category-filter" 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            >
              <option value="">All Categories</option>
              {filterData.categories.map(cat => <option key={cat._id.toString()} value={cat.slug}>{cat.name}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <select 
              id="tag-filter" 
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            >
              <option value="">All Tags</option>
              {filterData.tags.map(tag => <option key={tag._id.toString()} value={tag.slug}>{tag.name}</option>)}
            </select>
          </div>
          
          {/* Other filter placeholders - not yet functional with API */}
          <div className="mb-4">
            <h3 className="text-md font-medium mb-2 text-gray-700">Price Range (Placeholder)</h3>
            <div className="flex space-x-2">
                <input type="number" placeholder="Min" className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                <input type="number" placeholder="Max" className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm" />
            </div>
          </div>
           {/* Color & Size placeholders - not implemented with API */}


          <button 
            onClick={handleFilterChange}
            className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            Apply Filters
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <p className="text-sm text-gray-700">
              Showing <span className="font-semibold">{products.length}</span> of <span className="font-semibold">{totalProducts}</span> products
            </p>
            <div className="flex items-center">
              <label htmlFor="sort-filter" className="mr-2 text-sm text-gray-700">Sort by:</label>
              <select 
                id="sort-filter" 
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
                <option value="name_desc">Name: Z-A</option>
              </select>
            </div>
          </div>

          {isLoading && <div className="text-center py-10">Loading products...</div>}
          {!isLoading && error && <p className="text-red-500 text-center py-10">Error: {error}</p>}
          {!isLoading && !error && products.length === 0 && (
            <p className="text-gray-500 text-center py-10">No products found matching your criteria.</p>
          )}

          {!isLoading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product._id.toString()} // Use _id from fetched data
                  // Pass necessary props to ProductCard, ensure ProductCardProps matches
                  name={product.name}
                  price={product.price.toString()} // ProductCard expects string price
                  imageUrl={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/400x300?text=No+Image'}
                  slug={product.slug}
                  // rating and reviewCount might not be directly on IProduct, adjust if needed
                  // rating={product.rating} 
                  // reviewCount={product.reviewCount}
                />
              ))}
            </div>
          )}
          
          {/* Pagination Controls */}
          {totalPages > 1 && !isLoading && !error && (
            <nav className="mt-8 flex justify-center items-center space-x-2" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={currentPage === pageNumber}
                  className={`px-4 py-2 text-sm font-medium border rounded-md ${
                    currentPage === pageNumber 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}
