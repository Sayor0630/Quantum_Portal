import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard'; // For related products
import { useCartStore } from '@/store/cartStore'; // Added import

// Example placeholder data - in a real app, this would be fetched based on slug
const getProductDetails = (slug: string) => {
  const productName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return {
  name: `Product ${productName}`,
  price: "99.99",
  rating: 4.5,
  reviewCount: 120,
  shortDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  fullDescription: `Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Features:
- Premium materials and construction
- User-friendly design and interface
- Long-lasting durability
- Available in multiple colors and sizes`,
  images: [
    `https://placehold.co/600x600/E2E8F0/AAAAAA?text=${encodeURIComponent(productName)}+Main`,
    `https://placehold.co/100x100/E2E8F0/AAAAAA?text=${encodeURIComponent(productName)}+Thumb1`,
    `https://placehold.co/100x100/E2E8F0/AAAAAA?text=${encodeURIComponent(productName)}+Thumb2`,
    `https://placehold.co/100x100/E2E8F0/AAAAAA?text=${encodeURIComponent(productName)}+Thumb3`,
    `https://placehold.co/100x100/E2E8F0/AAAAAA?text=${encodeURIComponent(productName)}+Thumb4`,
  ],
  availableColors: [
    { name: "Red", value: "red" }, 
    { name: "Blue", value: "blue" }, 
    { name: "Black", value: "black" },
    { name: "White", value: "white" },
  ],
  availableSizes: ["S", "M", "L", "XL", "XXL"],
  stockStatus: "In Stock",
  relatedProducts: Array.from({ length: 4 }).map((_, i) => ({
    id: `related-product-${slug}-${i + 1}`,
    name: `Related Product ${i + 1} for ${productName}`,
    price: `${(Math.random() * 80 + 20).toFixed(2)}`, // Price between $20 and $100
    imageUrl: `https://placehold.co/400x300/CBD5E0/9A9A9A?text=Related+${i+1}`,
    slug: `related-product-${i + 1 + Math.random().toString(16).slice(2)}`, // Ensure unique slugs for related items
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating between 3.0 and 5.0
    reviewCount: Math.floor(Math.random() * 100 + 10) // Reviews between 10 and 110
  }))
  };
};

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductDetails(params.slug);
  // For active thumbnail state management (optional for now, just UI)
  // const [activeImage, setActiveImage] = useState(product.images[0]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2">
          <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg mb-4 border border-gray-200">
            <Image 
              src={product.images[0]} // Replace with activeImage if implementing state
              alt={product.name} 
              fill 
              style={{objectFit: 'cover'}} 
              priority // Prioritize LCP image
            />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {product.images.slice(1).map((img, idx) => (
              <button 
                key={idx} 
                className="relative aspect-square rounded overflow-hidden border-2 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                // onClick={() => setActiveImage(img)} // Optional: for changing main image
              >
                <Image src={img} alt={`${product.name} thumbnail ${idx+1}`} fill style={{objectFit: 'cover'}} />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">Image zoom/carousel functionality placeholder.</p>
        </div>

        {/* Product Information & Actions */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-2 text-gray-800">{product.name}</h1>
          <div className="flex items-center mb-4">
            <span className="text-yellow-400">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
            <span className="ml-2 text-sm text-gray-600">({product.reviewCount} reviews)</span>
            <Link href="#reviews" className="ml-4 text-sm text-blue-600 hover:text-blue-800 hover:underline">Write a review</Link>
          </div>
          <p className="text-3xl font-semibold text-blue-600 mb-5">${product.price}</p>
          <p className="text-gray-700 mb-6 leading-relaxed">{product.shortDescription}</p>

          {/* Attribute Selection */}
          <div className="mb-5">
            <label className="block text-md font-medium text-gray-700 mb-2">Color:</label>
            <div className="flex flex-wrap gap-2">
              {product.availableColors.map(color => (
                <button 
                  key={color.name} 
                  title={color.name}
                  className={`w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all ${color.value === 'white' ? 'border-gray-400' : 'border-transparent'}`} 
                  style={{backgroundColor: color.value }}
                >
                   <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="size" className="block text-md font-medium text-gray-700 mb-2">Size:</label>
            <div className="flex flex-wrap gap-2">
              {product.availableSizes.map(size => (
                <button key={size} className="border px-4 py-2 rounded-md text-sm hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-500 focus:text-white transition-colors duration-200">{size}</button>
              ))}
            </div>
          </div>

          <p className={`text-md font-semibold mb-5 ${product.stockStatus === "In Stock" ? "text-green-600" : "text-red-600"}`}>{product.stockStatus}</p>

          {/* Quantity & Add to Cart */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <div className="flex-shrink-0">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity:</label>
              <div className="flex items-center border rounded-md overflow-hidden">
                <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none">-</button>
                <input type="number" id="quantity" defaultValue="1" min="1" className="border-none w-16 text-center focus:ring-0" />
                <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none">+</button>
              </div>
            </div>
            <button 
              onClick={() => {
                const quantityInput = document.getElementById('quantity') as HTMLInputElement | null;
                const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;
                const itemToAdd = {
                  id: params.slug, // Using slug as ID
                  name: product.name,
                  price: parseFloat(product.price), // Convert string price to number
                  imageUrl: product.images[0], // Use main image
                  slug: params.slug,
                  quantity: quantity > 0 ? quantity : 1,
                };
                useCartStore.getState().addItem(itemToAdd);
                console.log(`Added ${itemToAdd.quantity} of ${product.name} to cart`, itemToAdd);
                // Add more sophisticated user feedback here if needed
              }}
              className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-10 rounded-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
            >
              Add to Cart
            </button>
          </div>

          {/* Product Details */}
          <div className="prose prose-sm sm:prose lg:prose-lg max-w-none"> {/* Using Tailwind Typography for details */}
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Product Details</h2>
            <div className="text-gray-700 whitespace-pre-line">{product.fullDescription}</div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section (Placeholder) */}
      <section id="reviews" className="mt-12 py-8 border-t border-gray-200">
        <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-gray-800">Customer Reviews</h2>
        <div className="space-y-6">
          {[
            { user: "Alex K.", rating: 5, text: "This product is amazing! Exceeded all my expectations. Highly recommend to everyone." },
            { user: "Jamie L.", rating: 4, text: "Pretty good, does what it says. One minor issue with the packaging, but product itself is fine." },
            { user: "Casey P.", rating: 3, text: "It's okay. Not the best, not the worst. Gets the job done but I've seen better for the price." }
          ].map((review, idx) => (
            <div key={idx} className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white">
              <div className="flex items-center mb-1">
                <p className="font-semibold text-gray-800">{review.user}</p>
                <span className="ml-2 text-yellow-400">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </div>
              <p className="text-gray-600 text-sm">{review.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors duration-300">Write a Review</button>
        </div>
      </section>

      {/* Related Products Section (Placeholder) */}
      <section className="mt-12 py-8 border-t border-gray-200">
        <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-gray-800">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {product.relatedProducts.map(p => (
            <ProductCard key={p.id} name={p.name} price={p.price} imageUrl={p.imageUrl} slug={p.slug} rating={p.rating} reviewCount={p.reviewCount} />
          ))}
        </div>
      </section>
    </div>
  );
}
