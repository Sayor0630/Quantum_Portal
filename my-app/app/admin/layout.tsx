"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar'; // Adjust path

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminAuthToken'); // Or however admin token is stored
    let userRoles: string[] = [];
    const rolesString = localStorage.getItem('userRoles');
    if (rolesString) {
        try {
            userRoles = JSON.parse(rolesString);
        } catch (e) {
            console.error("Error parsing userRoles from localStorage:", e);
            // Optionally clear corrupted items
            localStorage.removeItem('adminAuthToken');
            localStorage.removeItem('userRoles');
        }
    }
    

    if (pathname !== '/admin/login') {
      if (!token || !Array.isArray(userRoles) || !userRoles.includes('admin')) {
        router.replace('/admin/login');
        // No need to set isAuthCheckComplete to true here, as redirection will occur
        // and the login page will handle its own rendering.
      } else {
        setIsAuthCheckComplete(true); // User is authenticated and is an admin
      }
    } else {
      setIsAuthCheckComplete(true); // Allow login page to render without auth checks
    }
  }, [router, pathname]);

  // If we are trying to access a page other than login AND auth check is not complete, show loading.
  if (pathname !== '/admin/login' && !isAuthCheckComplete) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-800">Loading Admin Panel...</div>;
  }
  
  // If we are on the login page, just render children (the login form).
  // Auth check is considered complete for the login page by this point.
  if (pathname === '/admin/login') {
    // Render children only if auth check is complete (to avoid flash of content if there was any initial logic)
    return <>{isAuthCheckComplete ? children : <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-800">Loading Login...</div>}</>;
  }

  // If we are on any other admin page, and auth check is complete (meaning user is authenticated admin)
  // render the layout with sidebar.
  // If !isAuthCheckComplete was true, we would have returned "Loading Admin Panel..." above.
  // So, if we reach here for a non-login page, isAuthCheckComplete must be true.
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800"> {/* Added text-gray-800 for default text color */}
      <AdminSidebar />
      <main className="flex-grow p-6 sm:p-8"> {/* Added sm:p-8 for slightly more padding on small+ screens */}
        {children} 
        {/* Removed the ternary for children as loading is handled above. 
            If !isAuthCheckComplete is true for a non-login page, we return loading.
            If isAuthCheckComplete is true, we render children.
        */}
      </main>
    </div>
  );
}
