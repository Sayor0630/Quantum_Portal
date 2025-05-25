export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Admin Dashboard</h1>
      <p className="text-gray-700">Welcome to the admin control panel. Use the sidebar to navigate through different management sections.</p>
      {/* Placeholder for future dashboard widgets or summaries */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Products</h2>
          <p className="text-3xl font-bold text-blue-600">150</p> {/* Placeholder value */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-green-600">2,345</p> {/* Placeholder value */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Pending Orders</h2>
          <p className="text-3xl font-bold text-yellow-500">23</p> {/* Placeholder value */}
        </div>
      </div>
    </div>
  );
}
