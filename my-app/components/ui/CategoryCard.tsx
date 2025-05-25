import Link from 'next/link';
import Image from 'next/image'; // Using next/image for optimized images

interface CategoryCardProps {
  name: string;
  imageUrl: string;
  link: string;
}

export default function CategoryCard({ name, imageUrl, link }: CategoryCardProps) {
  return (
    <Link href={link} className="block group">
      <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-2 relative">
        <Image
          src={imageUrl}
          alt={name}
          fill // Replaces width and height, makes image responsive to parent
          style={{ objectFit: 'cover' }} // Equivalent to object-cover
          className="group-hover:scale-105 transition-transform duration-300"
        />
        {/* Fallback if image fails to load or for placeholder styling */}
        {/* <div className="w-full h-full bg-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <span className="text-gray-500 text-lg">{name}</span>
        </div> */}
      </div>
      <h3 className="text-xl font-semibold text-center group-hover:text-blue-500">{name}</h3>
    </Link>
  );
}
