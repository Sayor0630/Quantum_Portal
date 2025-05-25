import ProductCard from '@/components/products/ProductCard'; // Ensure this path is correct
import { IProduct } from '@/server/models/Product'; // For type of resolvedProducts

export interface ProductCarouselConfig {
  title: string;
  productIds: string[]; // Original IDs from config
  resolvedProducts?: Partial<IProduct>[]; // Products populated by the API. Use Partial for flexibility in ProductCard props.
}

interface RenderProductCarouselProps {
  config: ProductCarouselConfig;
}

export default function RenderProductCarousel({ config }: RenderProductCarouselProps) {
  if (!config) return <div className="text-center text-red-500 p-4">ProductCarousel configuration is missing.</div>;

  const { title, resolvedProducts } = config;

  if (!resolvedProducts || resolvedProducts.length === 0) {
    // This case might occur if productIds were empty or couldn't be resolved.
    // Depending on desired behavior, you could hide the section or show a message.
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-10">{title || "Featured Products"}</h2>
          <p className="text-center text-gray-500">No products to display in this section currently.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50"> {/* Added a light background for visual separation */}
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center mb-10">{title || "Featured Products"}</h2>
        <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-thumb-rounded">
          {/* 
            Enable scrollbar styling via a plugin if not default:
            In tailwind.config.js: plugins: [require('tailwind-scrollbar'),],
            Then use classes like scrollbar-thin, scrollbar-thumb-blue-500 etc.
            For simplicity, assuming basic browser scrollbar or add plugin later.
          */}
          {resolvedProducts.map((product) => (
            <div key={product._id?.toString()} className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"> {/* Adjust width for card size */}
              <ProductCard
                _id={product._id!.toString()} // Assuming _id is always present on resolvedProducts
                name={product.name || 'Unnamed Product'}
                price={typeof product.price === 'number' ? product.price : 0} // API returns number
                imageUrl={(product.images && product.images.length > 0 ? product.images[0] : undefined) || 'https://placehold.co/400x300?text=No+Image'}
                slug={product.slug || 'no-slug'}
                // ProductCard no longer takes rating/reviewCount by default from previous updates
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
