import ProductCard from '@/components/products/ProductCard'; // Adjust path if needed
import Link from 'next/link';

export default function ProductsPage() {
  // Placeholder product data
  const products = [
    { id: 'prod-1', name: 'High-Performance Laptop', price: '1299.99', imageUrl: 'https://placehold.co/400x300/E2E8F0/AAAAAA?text=Laptop', rating: 4.5, reviewCount: 120, slug: 'high-performance-laptop' },
    { id: 'prod-2', name: 'Comfortable Cotton T-Shirt', price: '25.00', imageUrl: 'https://placehold.co/400x300/D1D5DB/AAAAAA?text=T-Shirt', rating: 4.2, reviewCount: 85, slug: 'cotton-tshirt-blue' },
    { id: 'prod-3', name: 'Wireless Noise-Cancelling Headphones', price: '199.50', imageUrl: 'https://placehold.co/400x300/E2E8F0/AAAAAA?text=Headphones', rating: 4.8, reviewCount: 250, slug: 'noise-cancelling-headphones' },
    { id: 'prod-4', name: 'Modern Coffee Table', price: '150.00', imageUrl: 'https://placehold.co/400x300/D1D5DB/AAAAAA?text=Coffee+Table', rating: 4.0, reviewCount: 45, slug: 'modern-coffee-table' },
    { id: 'prod-5', name: 'Organic Green Tea (50 Bags)', price: '12.99', imageUrl: 'https://placehold.co/400x300/E2E8F0/AAAAAA?text=Green+Tea', rating: 4.9, reviewCount: 300, slug: 'organic-green-tea' },
    { id: 'prod-6', name: 'Professional DSLR Camera Kit', price: '899.00', imageUrl: 'https://placehold.co/400x300/D1D5DB/AAAAAA?text=DSLR+Camera', rating: 4.7, reviewCount: 150, slug: 'dslr-camera-kit' },
    { id: 'prod-7', name: 'Leather Wallet with RFID Blocking', price: '45.50', imageUrl: 'https://placehold.co/400x300/E2E8F0/AAAAAA?text=Wallet', rating: 4.3, reviewCount: 95, slug: 'leather-wallet-rfid' },
    { id: 'prod-8', name: 'Set of 3 Gardening Tools', price: '35.00', imageUrl: 'https://placehold.co/400x300/D1D5DB/AAAAAA?text=Gardening+Tools', rating: 4.1, reviewCount: 60, slug: 'gardening-tools-set' },
    { id: 'prod-9', name: 'Yoga Mat Extra Thick', price: '29.99', imageUrl: 'https://placehold.co/400x300/E2E8F0/AAAAAA?text=Yoga+Mat', rating: 4.6, reviewCount: 110, slug: 'yoga-mat-extra-thick' },
    { id: 'prod-10', name: 'Stainless Steel Water Bottle', price: '19.75', imageUrl: 'https://placehold.co/400x300/D1D5DB/AAAAAA?text=Water+Bottle', rating: 4.4, reviewCount: 70, slug: 'stainless-steel-water-bottle' },
  ];

  const categories = ["Electronics", "Apparel", "Books", "Home Goods", "Groceries", "Sports", "Automotive"];
  const colors = ["Red", "Blue", "Green", "Black", "White", "Silver"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center tracking-tight">Our Products</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 lg:w-1/5 p-6 bg-white border border-gray-200 rounded-lg shadow-sm h-fit">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Filters</h2>
          
          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Categories</h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category}>
                  <Link href={`/products?category=${category.toLowerCase()}`} className="text-gray-600 hover:text-blue-600 hover:underline transition-colors duration-200">
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range Filter Placeholder */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Price Range</h3>
            {/* Basic input placeholders */}
            <div className="flex space-x-2">
                <input type="number" placeholder="Min" className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
                <input type="number" placeholder="Max" className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            {/* <p className="text-sm text-gray-500 mt-2">Slider placeholder here</p> */}
          </div>

          {/* Color Filter Placeholder */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Color</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button key={color} title={color} className="w-6 h-6 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all" style={{ backgroundColor: color.toLowerCase() }}>
                   <span className="sr-only">{color}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter Placeholder */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button key={size} className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 focus:bg-blue-500 focus:text-white transition-colors duration-200">
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter Placeholder */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-700">Rating</h3>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map(star => (
                <Link key={star} href={`/products?rating=${star}`} className="flex items-center text-gray-600 hover:text-blue-600 group">
                  <span className="text-yellow-400">{'★'.repeat(star)}{'☆'.repeat(5-star)}</span>
                  <span className="ml-2 text-sm group-hover:underline">{star} star{star > 1 ? 's' : ''} & up</span>
                </Link>
              ))}
            </div>
          </div>
          
          <button className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Apply Filters
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <p className="text-sm text-gray-700">
              Showing <span className="font-semibold">{products.length}</span> products
            </p>
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-sm text-gray-700">Sort by:</label>
              <select id="sort" className="border-gray-300 rounded-md shadow-sm p-2 text-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Average Rating</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"> {/* Max 3 columns for better card visibility */}
            {products.map(product => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                rating={product.rating}
                reviewCount={product.reviewCount}
                slug={product.slug}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
