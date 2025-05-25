import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore'; // Added import

interface ProductCardProps {
  _id: string; // MongoDB ID
  name: string;
  price: number; // Changed to number
  imageUrl: string;
  slug: string;
  // Rating and reviewCount are removed as they are not in IProduct model directly
}

export default function ProductCard({ _id, name, price, imageUrl, slug }: ProductCardProps) {
  const addItemToCart = useCartStore((state) => state.addItem);

  return (
    <Link href={`/products/${slug}`} className="block border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group bg-white">
      <div className="relative w-full aspect-[4/3]"> {/* Aspect ratio for image */}
        <Image src={imageUrl || 'https://placehold.co/400x300?text=No+Image'} alt={name} fill style={{ objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4 flex flex-col flex-grow"> {/* Added flex-grow and flex-col for button positioning */}
        <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-500 truncate" title={name}>{name}</h3>
        <p className="text-xl font-bold text-gray-800 mb-2">${price.toFixed(2)}</p> {/* Format price for display */}
        
        {/* Removed rating and reviewCount display */}

        <button 
          onClick={(e) => {
            e.preventDefault(); // Prevent navigation when clicking button
            addItemToCart({
              id: _id, // Use actual product ID
              name,
              price, // Price is already a number
              imageUrl,
              slug,
              // quantity is handled by the store's addItem logic (defaults to 1 or increments)
            });
            console.log(`Added ${name} to cart`);
            // Add more sophisticated user feedback here if needed (e.g., toast notification)
          }}
          className="w-full mt-auto bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors duration-300" // Added mt-auto to push button to bottom
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
