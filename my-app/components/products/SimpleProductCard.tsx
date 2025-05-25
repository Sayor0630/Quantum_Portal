import Link from 'next/link';
import Image from 'next/image';

interface SimpleProductCardProps {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  link: string;
}

export default function SimpleProductCard({ name, price, imageUrl, link }: SimpleProductCardProps) {
  return (
    <Link href={link} className="block group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="aspect-square bg-gray-100 relative">
        <Image
          src={imageUrl}
          alt={name}
          fill
          style={{ objectFit: 'cover' }}
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {/* <div className="w-full h-full bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Product Image</span>
        </div> */}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-500 truncate">{name}</h3>
        <p className="text-gray-700 font-medium">{price}</p>
      </div>
    </Link>
  );
}
