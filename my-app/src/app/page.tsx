// No "use client" needed here, this is a Server Component
import { getHomepageElements, PopulatedPageElement } from '@/server/utils/pageElementUtils'; // Adjust path
import RenderHeroBanner, { HeroConfig } from '@/components/homepage/RenderHeroBanner';
import RenderProductCarousel, { ProductCarouselConfig } from '@/components/homepage/RenderProductCarousel';
import RenderTextBlock, { TextBlockConfig } from '@/components/homepage/RenderTextBlock';
// Import other specific element rendering components as needed

// Helper to select and render the correct component for an element
function renderPageElement(element: PopulatedPageElement) {
  switch (element.elementType) {
    case 'HeroBanner':
      // Type assertion is safe here if config structure is guaranteed by admin forms/API
      return <RenderHeroBanner key={element._id.toString()} config={element.config as HeroConfig} />;
    case 'ProductCarousel':
      return <RenderProductCarousel key={element._id.toString()} config={element.config as ProductCarouselConfig} />;
    case 'TextBlock':
      return <RenderTextBlock key={element._id.toString()} config={element.config as TextBlockConfig} />;
    // Add cases for other element types
    default:
      console.warn(`Unsupported page element type: ${element.elementType} for element ID ${element._id}`);
      return (
        <div key={element._id.toString()} className="container mx-auto my-4 p-4 border border-dashed border-red-400 bg-red-50">
          <p className="text-red-700 text-center">
            Unsupported element type: &quot;{element.elementType}&quot;. Please check admin configuration or implement a rendering component.
          </p>
        </div>
      );
  }
}

export default async function HomePage() {
  let homepageElements: PopulatedPageElement[] = [];
  let error: string | null = null;

  try {
    homepageElements = await getHomepageElements();
  } catch (err: any) {
    console.error("Failed to fetch homepage elements for rendering:", err);
    error = err.message || "Could not load homepage content at this time. Please try again later.";
    // In a real app, you might want to log this error to a monitoring service
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">Oops! Something went wrong.</h1>
        <p className="text-gray-700">{error}</p>
        <p className="mt-4 text-sm text-gray-500">
          If the problem persists, please contact support.
        </p>
      </div>
    );
  }

  if (homepageElements.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-700 mb-4">Welcome to Our Store!</h1>
        <p className="text-lg text-gray-500 mb-8">
          Our homepage is currently under construction. Please check back soon for exciting updates!
        </p>
        <p className="text-gray-500">
          In the meantime, feel free to <a href="/products" className="text-blue-600 hover:underline">browse our products</a>.
        </p>
        {/* Optionally, include a default minimal hero or some featured content here */}
      </div>
    );
  }

  return (
    <div className="space-y-0"> {/* Remove default space-y if elements manage their own margins */}
      {homepageElements.map(element => renderPageElement(element))}
    </div>
  );
}
