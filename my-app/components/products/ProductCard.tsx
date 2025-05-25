import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore'; // Added import

interface ProductCardProps {
  name: string;
  price: string;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  slug: string;
}

export default function ProductCard({ name, price, imageUrl, rating, reviewCount, slug }: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`} className="block border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group bg-white">
      <div className="relative w-full aspect-[4/3]"> {/* Aspect ratio for image */}
        <Image src={imageUrl} alt={name} fill style={{ objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-500 truncate" title={name}>{name}</h3>
        <p className="text-xl font-bold text-gray-800 mb-2">${price}</p>
        {rating && reviewCount && (
          <div className="flex items-center mb-2">
            {/* Basic Star Rating Placeholder */}
            <span className="text-yellow-400">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
            <span className="ml-2 text-sm text-gray-500">({reviewCount} reviews)</span>
          </div>
        )}
        <button 
          onClick={(e) => {
            e.preventDefault(); // Prevent navigation when clicking button
            const itemToAdd = {
              id: slug, // Using slug as ID
              name,
              price: parseFloat(price), // Convert string price to number
              imageUrl,
              slug,
            };
            useCartStore.getState().addItem(itemToAdd);
            console.log(`Added ${name} to cart`, itemToAdd);
            // Add more sophisticated user feedback here if needed (e.g., toast notification)
          }}
          className="w-full mt-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors duration-300"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
