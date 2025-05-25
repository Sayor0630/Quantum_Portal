"use client"; // If using Link or any client-side interactions like logout later
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // For logout

export default function AdminSidebar() {
  // const router = useRouter();
  // const handleLogout = () => { /* Clear auth token, router.push('/admin/login'); */ };

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 space-y-2 flex-shrink-0 h-screen sticky top-0">
      <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
      <nav>
        <ul>
          <li><Link href="/admin/dashboard" className="block hover:bg-gray-700 p-2 rounded">Dashboard</Link></li>
          <li><Link href="/admin/products" className="block hover:bg-gray-700 p-2 rounded">Products</Link></li>
          <li><Link href="/admin/categories" className="block hover:bg-gray-700 p-2 rounded">Categories</Link></li>
          <li><Link href="/admin/tags" className="block hover:bg-gray-700 p-2 rounded">Tags</Link></li>
          <li><Link href="/admin/attributes" className="block hover:bg-gray-700 p-2 rounded">Attributes</Link></li>
          <li><Link href="/admin/users" className="block hover:bg-gray-700 p-2 rounded">Users</Link></li>
          <li><Link href="/admin/homepage-editor" className="block hover:bg-gray-700 p-2 rounded">Homepage Editor</Link></li>
          {/* <li><button onClick={handleLogout} className="w-full text-left block hover:bg-gray-700 p-2 rounded mt-4">Logout</button></li> */}
        </ul>
      </nav>
    </aside>
  );
}
