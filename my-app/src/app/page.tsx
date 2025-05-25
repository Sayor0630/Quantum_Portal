import Link from 'next/link';
import Image from 'next/image'; // Using next/image for optimized images
import CategoryCard from '@/components/ui/CategoryCard';
import SimpleProductCard from '@/components/products/SimpleProductCard';

export default function HomePage() {
  // Placeholder data
  const categories = [
    { name: 'Electronics', imageUrl: 'https://placehold.co/600x400/E2E8F0/AAAAAA?text=Electronics', link: '/products?category=electronics' },
    { name: 'Apparel', imageUrl: 'https://placehold.co/600x400/E2E8F0/AAAAAA?text=Apparel', link: '/products?category=apparel' },
    { name: 'Books', imageUrl: 'https://placehold.co/600x400/E2E8F0/AAAAAA?text=Books', link: '/products?category=books' },
    { name: 'Home Goods', imageUrl: 'https://placehold.co/600x400/E2E8F0/AAAAAA?text=Home+Goods', link: '/products?category=homegoods' },
  ];

  const newArrivals = [
    { id: '1', name: 'Latest Smartphone', price: '$699.99', imageUrl: 'https://placehold.co/400x400/E2E8F0/AAAAAA?text=Product+1', link: '/products/latest-smartphone' },
    { id: '2', name: 'Wireless Headphones', price: '$199.99', imageUrl: 'https://placehold.co/400x400/E2E8F0/AAAAAA?text=Product+2', link: '/products/wireless-headphones' },
    { id: '3', name: 'Smart Watch Series X', price: '$299.99', imageUrl: 'https://placehold.co/400x400/E2E8F0/AAAAAA?text=Product+3', link: '/products/smart-watch-x' },
    { id: '4', name: 'Bluetooth Speaker', price: '$99.99', imageUrl: 'https://placehold.co/400x400/E2E8F0/AAAAAA?text=Product+4', link: '/products/bluetooth-speaker' },
  ];

  const popularProducts = [
    { id: '5', name: 'Classic T-Shirt', price: '$29.99', imageUrl: 'https://placehold.co/400x400/D1D5DB/AAAAAA?text=Product+5', link: '/products/classic-tshirt' },
    { id: '6', name: 'Running Shoes', price: '$129.99', imageUrl: 'https://placehold.co/400x400/D1D5DB/AAAAAA?text=Product+6', link: '/products/running-shoes' },
    { id: '7', name: 'Coffee Maker', price: '$79.99', imageUrl: 'https://placehold.co/400x400/D1D5DB/AAAAAA?text=Product+7', link: '/products/coffee-maker' },
    { id: '8', name: 'Best Selling Novel', price: '$19.99', imageUrl: 'https://placehold.co/400x400/D1D5DB/AAAAAA?text=Product+8', link: '/products/best-novel' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20 px-4 sm:px-6 lg:px-8 rounded-lg shadow-lg mb-12 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://placehold.co/1920x1080/3B82F6/FFFFFF?text=Welcome!" // Placeholder background image
            alt="Hero background"
            fill
            style={{ objectFit: 'cover' }}
            priority // Preload this image as it's LCP
            className="opacity-30"
          />
        </div>
        <div className="relative container mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
            Welcome to Our E-Commerce Store!
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto">
            Discover the latest trends, top-quality products, and unbeatable deals.
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-md font-semibold text-lg hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-12">
        <h2 className="text-3xl font-semibold text-center mb-10">Shop by Category</h2>
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-12 bg-gray-50">
        <h2 className="text-3xl font-semibold text-center mb-10">New Arrivals</h2>
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {newArrivals.map((product) => (
            <SimpleProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-12">
        <h2 className="text-3xl font-semibold text-center mb-10">Popular Products</h2>
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {popularProducts.map((product) => (
            <SimpleProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
}
