import Link from 'next/link';
import Image from 'next/image';

// Placeholder order summary data
const placeholderOrderItems = [
  { id: 'item1', name: 'Stylish Smartwatch', quantity: 1, price: 299.99, imageUrl: 'https://placehold.co/50x50/E2E8F0/AAAAAA?text=Watch' },
  { id: 'item2', name: 'Wireless Headphones', quantity: 2, price: 149.50, imageUrl: 'https://placehold.co/50x50/D1D5DB/AAAAAA?text=Audio' },
];
const subtotal = placeholderOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const shipping = 5.00;
const total = subtotal + shipping;

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center tracking-tight">Checkout</h1>
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Forms */}
        <div className="w-full lg:w-2/3">
          {/* We can give the form an id if the submit button is outside, but here it's not strictly necessary as the button is in the Order Summary section */}
          <form className="space-y-10" id="checkoutForm">
            {/* Shipping Address */}
            <section>
              <h2 className="text-2xl font-semibold mb-5 border-b border-gray-300 pb-3 text-gray-800">1. Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" id="fullName" name="fullName" autoComplete="name" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number <span className="text-xs text-gray-500">(Optional)</span></label>
                  <input type="tel" id="phone" name="phone" autoComplete="tel" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                  <input type="text" id="address1" name="address1" autoComplete="address-line1" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address2" className="block text-sm font-medium text-gray-700">Address Line 2 <span className="text-xs text-gray-500">(Optional)</span></label>
                  <input type="text" id="address2" name="address2" autoComplete="address-line2" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5" />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <input type="text" id="city" name="city" autoComplete="address-level2" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5" />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                  <input type="text" id="state" name="state" autoComplete="address-level1" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5" />
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                  <input type="text" id="zip" name="zip" autoComplete="postal-code" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5" />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                  <select id="country" name="country" autoComplete="country-name" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 pr-8">
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Germany</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Payment Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-5 border-b border-gray-300 pb-3 text-gray-800">2. Payment Information</h2>
              <div className="space-y-4">
                <fieldset className="mb-4">
                  <legend className="text-sm font-medium text-gray-700 mb-2">Payment Method</legend>
                  <div className="flex items-center space-x-4">
                    <label htmlFor="creditCard" className="flex items-center text-sm text-gray-700">
                      <input type="radio" id="creditCard" name="paymentMethod" value="creditCard" defaultChecked className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      Credit Card
                    </label>
                    <label htmlFor="paypal" className="flex items-center text-sm text-gray-700">
                      <input type="radio" id="paypal" name="paymentMethod" value="paypal" className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                      PayPal
                    </label>
                  </div>
                </fieldset>
                
                {/* Basic Credit Card Fields (Placeholder) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="sm:col-span-2">
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
                        <input type="text" id="cardNumber" name="cardNumber" placeholder="•••• •••• •••• ••••" autoComplete="cc-number" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5" />
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700">Cardholder Name</label>
                        <input type="text" id="cardHolder" name="cardHolder" autoComplete="cc-name" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5" />
                    </div>
                    <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date (MM/YY)</label>
                        <input type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY" autoComplete="cc-exp" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5" />
                    </div>
                    <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
                        <input type="text" id="cvv" name="cvv" placeholder="•••" autoComplete="cc-csc" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5" />
                    </div>
                </div>
                 <p className="text-xs text-gray-500 mt-3">Actual payment processing (e.g., Stripe, PayPal) would be integrated here.</p>
              </div>
            </section>

            <div className="pt-8 border-t border-gray-200">
                <Link href="/cart" className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors duration-200">
                    &larr; Return to Cart
                </Link>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3 p-6 bg-gray-50 rounded-lg shadow-md lg:sticky lg:top-8 h-fit">
          <h2 className="text-xl font-semibold mb-6 border-b border-gray-200 pb-4 text-gray-800">Your Order</h2>
          <div className="space-y-4 mb-6">
            {placeholderOrderItems.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                    <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-md mr-3 border border-gray-200"/>
                    <div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                </div>
                <span className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span className="font-medium text-gray-800">${shipping.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold text-lg text-gray-800">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button type="submit" form="checkoutForm" 
                  className="w-full mt-8 bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md hover:shadow-lg disabled:opacity-60">
            Place Order (Placeholder)
          </button>
          <p className="text-xs text-gray-500 mt-3 text-center">By placing your order, you agree to our <Link href="/terms" className="underline hover:text-blue-600">terms and conditions</Link>.</p>
        </div>
      </div>
    </div>
  );
}
