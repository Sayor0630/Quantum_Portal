import Link from 'next/link';
import Image from 'next/image'; // For background image

export interface HeroConfig {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
}

interface RenderHeroBannerProps {
  config: HeroConfig;
}

export default function RenderHeroBanner({ config }: RenderHeroBannerProps) {
  if (!config) return <div className="text-center text-red-500 p-4">HeroBanner configuration is missing.</div>;

  const { title, subtitle, imageUrl, buttonText, buttonLink } = config;

  return (
    <section className="relative bg-gray-700 text-white py-20 px-4 sm:px-6 lg:px-8 rounded-lg shadow-lg mb-12 overflow-hidden min-h-[300px] md:min-h-[400px] flex items-center justify-center">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={title || "Hero background"}
          fill
          style={{ objectFit: 'cover' }}
          priority // Good for LCP if it's the first large image
          className="opacity-40" // Adjust opacity as needed
        />
      )}
      <div className="relative container mx-auto text-center z-10">
        {title && (
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {buttonText && buttonLink && (
          <Link
            href={buttonLink}
            className="inline-block bg-white text-gray-800 px-8 py-3 rounded-md font-semibold text-lg hover:bg-gray-200 transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}
