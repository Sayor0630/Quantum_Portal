"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard'; // For related products
import { useCartStore } from '@/store/cartStore';
import apiClient from '@/utils/apiClient';
import { IProduct, IProductAttribute } from '@/server/models/Product'; // Assuming IProduct includes populated fields
import { ICustomAttributeDefinition } from '@/server/models/CustomAttributeDefinition';


// Define a more specific type for the product state, assuming population
interface PopulatedProduct extends Omit<IProduct, 'category' | 'tags' | 'customAttributes'> {
  category?: { _id: string; name: string; slug: string };
  tags: Array<{ _id: string; name: string; slug: string }>;
  customAttributes: Array<{
    definition: { _id: string; name: string; possibleValues?: string[] }; // Definition is populated
    value: string;
  }>;
  // Add rating and reviewCount if they are part of your IProduct and fetched from API
  // For now, we'll use placeholders or omit them if not in API response.
  rating?: number; 
  reviewCount?: number;
}


export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const addItemToCart = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<PopulatedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      const fetchProductDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await apiClient<PopulatedProduct>(`/api/products/${slug}`);
          if (response.error || !response.data) {
            throw new Error(response.data?.message as string || response.error || 'Failed to fetch product details.');
          }
          setProduct(response.data);
          if (response.data.images && response.data.images.length > 0) {
            setSelectedImage(response.data.images[0]);
          }
        } catch (err: any) {
          setError(err.message || 'An unexpected error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProductDetails();
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addItemToCart({
        id: product._id.toString(), // Assuming _id is the product's unique ID from DB
        name: product.name,
        price: product.price, // Price is already a number in IProduct
        imageUrl: product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/100x100?text=No+Image',
        slug: product.slug,
        quantity: quantity,
      });
      console.log(`Added ${quantity} of ${product.name} to cart`);
      // Add toast notification or other feedback here
    }
  };
  
  // Placeholder for related products - fetch if needed
  const relatedProductsPlaceholder = Array.from({ length: 4 }).map((_, i) => ({
    id: `related-placeholder-${i + 1}`,
    name: `Related Product ${i + 1}`,
    price: `${(Math.random() * 80 + 20).toFixed(2)}`,
    imageUrl: `https://placehold.co/400x300/CBD5E0/9A9A9A?text=Related+${i+1}`,
    slug: `related-product-placeholder-${i + 1}`,
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 100 + 10)
  }));


  if (isLoading) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading product details...</div>;
  }
  if (error) {
    return <div className="container mx-auto py-8 px-4 text-center text-red-600">Error: {error}</div>;
  }
  if (!product) {
    return <div className="container mx-auto py-8 px-4 text-center">Product not found.</div>;
  }

  // Use placeholders if rating/reviewCount are not on the fetched product
  const displayRating = product.rating || 4.5; 
  const displayReviewCount = product.reviewCount || 0;


  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2">
          <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg mb-4 border border-gray-200">
            {selectedImage ? (
              <Image src={selectedImage} alt={product.name} fill style={{objectFit: 'cover'}} priority />
            ) : product.images && product.images.length > 0 ? (
               <Image src={product.images[0]} alt={product.name} fill style={{objectFit: 'cover'}} priority />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative aspect-square rounded overflow-hidden border-2 hover:border-blue-500 focus:outline-none transition-colors ${selectedImage === img ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <Image src={img} alt={`${product.name} thumbnail ${idx+1}`} fill style={{objectFit: 'cover'}} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information & Actions */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-2 text-gray-800">{product.name}</h1>
          <div className="flex items-center mb-4">
            <span className="text-yellow-400">{'★'.repeat(Math.round(displayRating))}{'☆'.repeat(5 - Math.round(displayRating))}</span>
            <span className="ml-2 text-sm text-gray-600">({displayReviewCount} reviews)</span>
            {/* <Link href="#reviews" className="ml-4 text-sm text-blue-600 hover:text-blue-800 hover:underline">Write a review</Link> */}
          </div>
          <p className="text-3xl font-semibold text-blue-600 mb-5">${product.price.toFixed(2)}</p>
          <div className="text-gray-700 mb-6 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description || '' }} />

          {/* Custom Attributes Display */}
          {product.customAttributes && product.customAttributes.length > 0 && (
            <div className="mb-6 space-y-3">
              {product.customAttributes.map(attr => (
                <div key={attr.definition._id.toString()}>
                  <span className="font-semibold text-gray-700">{attr.definition.name}: </span>
                  <span>{attr.value}</span>
                  {/* If you want interactive selection based on possibleValues, that's a more complex UI */}
                </div>
              ))}
            </div>
          )}
          
          {/* Stock Status - Assuming stockQuantity is part of IProduct */}
          <p className={`text-md font-semibold mb-5 ${product.stockQuantity > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.stockQuantity > 0 ? `${product.stockQuantity} In Stock` : "Out of Stock"}
          </p>

          {/* Quantity & Add to Cart */}
          {product.stockQuantity > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <div className="flex-shrink-0">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity:</label>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none">-</button>
                  <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value,10) || 1))} min="1" max={product.stockQuantity} className="border-none w-16 text-center focus:ring-0" />
                  <button onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))} className="px-3 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none">+</button>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-10 rounded-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
              >
                Add to Cart
              </button>
            </div>
          )}

          {/* Product Details (Full Description in Model) */}
          {/* The description is already rendered above with prose, if it's HTML. If plain text, it's fine too. */}
          {/* <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Product Details</h2>
            <div className="text-gray-700 whitespace-pre-line">{product.description}</div>
          </div> */}
        </div>
      </div>

      {/* Customer Reviews Section (Placeholder - Keep as is) */}
      <section id="reviews" className="mt-12 py-8 border-t border-gray-200">
        {/* ... existing placeholder review code ... */}
        <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-gray-800">Customer Reviews</h2>
        <div className="space-y-6">
          {[
            { user: "Alex K.", rating: 5, text: "This product is amazing! Exceeded all my expectations. Highly recommend to everyone." },
            { user: "Jamie L.", rating: 4, text: "Pretty good, does what it says. One minor issue with the packaging, but product itself is fine." },
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

      {/* Related Products Section (Placeholder - Keep as is, or fetch real related products later) */}
      <section className="mt-12 py-8 border-t border-gray-200">
        <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-gray-800">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProductsPlaceholder.map(p => (
            <ProductCard key={p.id} name={p.name} price={p.price} imageUrl={p.imageUrl} slug={p.slug} rating={p.rating} reviewCount={p.reviewCount} />
          ))}
        </div>
      </section>
    </div>
  );
}
