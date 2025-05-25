import Link from 'next/link';
import Image from 'next/image'; // For wishlist items or other images
import SimpleProductCard from '@/components/products/SimpleProductCard'; // Re-using for wishlist

export default function ProfilePage() {
  // Placeholder data
  const user = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
  };

  const orders = [
    { id: 'ORD12345', date: '2023-10-15', status: 'Delivered', total: '$125.50', items: 3 },
    { id: 'ORD67890', date: '2023-11-01', status: 'Shipped', total: '$75.00', items: 1 },
    { id: 'ORD24680', date: '2023-11-20', status: 'Processing', total: '$210.10', items: 5 },
  ];
  // const orders = []; // Test empty state

  const addresses = [
    {
      id: 'addr1',
      type: 'Home',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'Anytown',
      state: 'CA',
      zip: '90210',
      country: 'USA',
      isDefault: true,
    },
    {
      id: 'addr2',
      type: 'Work',
      addressLine1: '456 Business Rd',
      addressLine2: 'Suite 700',
      city: 'Metropolis',
      state: 'NY',
      zip: '10001',
      country: 'USA',
      isDefault: false,
    },
  ];
  // const addresses = []; // Test empty state

  const wishlistItems = [
    { id: 'wish1', name: 'Premium Smartwatch X200', price: '$299.00', imageUrl: 'https://placehold.co/300x300/E2E8F0/AAAAAA?text=Smartwatch+X200', link: '/products/smartwatch-x200' },
    { id: 'wish2', name: 'Ergonomic Office Chair Pro', price: '$180.00', imageUrl: 'https://placehold.co/300x300/D1D5DB/AAAAAA?text=Office+Chair', link: '/products/office-chair-pro' },
    { id: 'wish3', name: 'Noise-Cancelling Headphones Z', price: '$99.50', imageUrl: 'https://placehold.co/300x300/F3F4F6/AAAAAA?text=Headphones+Z', link: '/products/headphones-z' },
  ];
  // const wishlistItems = []; // Test empty state

  return (
    <div className="container mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-10 text-center tracking-tight text-gray-900">Your Account</h1>

      {/* Account Details Section */}
      <section id="account-details" className="mb-12 p-6 sm:p-8 bg-white shadow-xl rounded-lg">
        <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-gray-800 border-b pb-3">Account Details</h2>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="profileFullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" id="profileFullName" defaultValue={user.fullName} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="profileEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" id="profileEmail" defaultValue={user.email} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" id="currentPassword" placeholder="••••••••" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" id="newPassword" placeholder="••••••••" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" id="confirmNewPassword" placeholder="••••••••" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          <div className="text-right pt-4">
            <button type="submit" className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300">
              Update Details
            </button>
          </div>
        </form>
      </section>

      {/* Order History Section */}
      <section id="order-history" className="mb-12 p-6 sm:p-8 bg-white shadow-xl rounded-lg">
        <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-gray-800 border-b pb-3">Order History</h2>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                   <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Items</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {order.status}
                        </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{order.items}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{order.total}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <Link href={`/profile/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">View Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">You have no past orders.</p>
        )}
      </section>

      {/* Saved Addresses Section */}
      <section id="saved-addresses" className="mb-12 p-6 sm:p-8 bg-white shadow-xl rounded-lg">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800">Saved Addresses</h2>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300">
                Add New Address
            </button>
        </div>
        {addresses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(addr => (
                <div key={addr.id} className={`p-4 border rounded-lg ${addr.isDefault ? 'border-blue-500 shadow-md' : 'border-gray-300'}`}>
                <h3 className="text-lg font-semibold text-gray-800">{addr.type} {addr.isDefault && <span className="text-xs text-blue-600">(Default)</span>}</h3>
                <p className="text-sm text-gray-600">{addr.addressLine1}</p>
                {addr.addressLine2 && <p className="text-sm text-gray-600">{addr.addressLine2}</p>}
                <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                <p className="text-sm text-gray-600">{addr.country}</p>
                <div className="mt-4 space-x-3">
                    <button className="text-sm text-blue-600 hover:underline">Edit</button>
                    <button className="text-sm text-red-600 hover:underline">Delete</button>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-gray-600 text-center py-4">You have no saved addresses.</p>
        )}
      </section>

      {/* Wishlist Section */}
      <section id="wishlist" className="p-6 sm:p-8 bg-white shadow-xl rounded-lg">
        <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-gray-800 border-b pb-3">Your Wishlist</h2>
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map(item => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm relative group">
                <SimpleProductCard
                    id={item.id}
                    name={item.name}
                    price={item.price}
                    imageUrl={item.imageUrl}
                    link={item.link} // Link to product page
                />
                {/* Overlay or button to remove from wishlist */}
                <button 
                    title="Remove from Wishlist"
                    className="absolute top-2 right-2 z-10 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.preventDefault(); console.log(`Remove ${item.name} from wishlist`);}}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">Your wishlist is empty. <Link href="/products" className="text-blue-600 hover:underline">Explore products</Link></p>
        )}
      </section>
    </div>
  );
}
