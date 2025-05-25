import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore'; // Added import

// Static shipping estimate, can be moved to store or config if needed
const SHIPPING_ESTIMATE = 5.00;

export default function CartPage() {
  // Get state and actions from the store
  const cartItems = useCartStore((state) => state.cartItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);

  const subtotal = getCartSubtotal();
  const total = subtotal + SHIPPING_ESTIMATE;
  
  // Note: For attributes like color/size, they would need to be part of CartItem in the store
  // and set when adding the item. For this example, we'll omit them from display if not in store data.

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center tracking-tight">Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white p-8 rounded-lg shadow-md">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mt-4 text-xl text-gray-600 mb-6">Your cart is currently empty.</p>
          <Link 
            href="/products" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items List */}
          <div className="w-full lg:w-2/3">
            <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
              {cartItems.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b border-gray-200 last:border-b-0">
                  <div className="relative w-24 h-24 sm:w-20 sm:h-20 rounded-md overflow-hidden flex-shrink-0">
                    <Image src={item.imageUrl} alt={item.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="flex-grow">
                    <Link href={`/products/${item.slug}`} className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200">{item.name}</Link>
                    {/* Example of how color/size might be displayed if they were in CartItem */}
                    {/* {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>} */}
                    {/* {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>} */}
                    <p className="text-sm text-gray-600 mt-1">Unit Price: ${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3 my-2 sm:my-0 flex-shrink-0">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 border rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    >-</button>
                    <input 
                      type="text" 
                      value={item.quantity} 
                      readOnly 
                      className="w-12 text-center border-gray-300 rounded-md shadow-sm p-1.5 focus:border-blue-500 focus:ring-blue-500 text-sm" 
                    />
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 border rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    >+</button>
                  </div>
                  <p className="font-semibold text-lg text-gray-800 w-24 text-right flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                  <button 
                    onClick={() => removeItem(item.id)}
                    title="Remove item" 
                    className="text-red-500 hover:text-red-700 font-semibold text-xl p-1 rounded-md hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors flex-shrink-0"
                  >×</button>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center sm:text-right">
                <Link href="/products" className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors duration-200">
                    ← Continue Shopping
                </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3 p-6 bg-white border border-gray-200 rounded-lg shadow-lg h-fit lg:sticky lg:top-8">
            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-200 pb-4 text-gray-800">Order Summary</h2>
            <div className="space-y-4 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Estimate</span>
                <span className="font-medium">${SHIPPING_ESTIMATE.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between font-bold text-lg text-gray-800">
                <span>Estimated Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block mt-8">
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md hover:shadow-lg">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
