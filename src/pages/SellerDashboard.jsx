// src/pages/SellerDashboard.jsx
import React from 'react'; // No useState, useEffect for data fetching as per request (UI only)
import { motion } from 'framer-motion'; // For subtle animations

// Lucide React icons for a modern look
import {
  Package,        // For products
  ShoppingBag,    // For orders
  Users,          // For farmers (FPO)
  CalendarDays,   // For today's orders section
  DollarSign,     // For currency
  MapPin,         // For address
  User,           // For buyer name
  Tag,            // For product name in order items
  CheckCircle,    // For success toast (if you add toast logic later)
  AlertCircle     // For error toast (if you add toast logic later)
} from 'lucide-react';

// Dummy Data for UI demonstration (replace with actual fetched data in your integrated app)
const DUMMY_DASHBOARD_DATA = {
  totalProducts: 125,
  totalOrders: 45,
  totalFarmers: 320, // Only relevant if isFPO is true
  isFPO: true, // Set to false to hide the "Farmers Added" card
  todayOrders: [
    {
      _id: 'ORDER001',
      userId: { name: 'Priya Sharma' },
      shippingAddress: { city: 'Bengaluru', state: 'Karnataka' },
      items: [
        { productId: { imageUrl: 'https://placehold.co/40x40/E0E0E0/333333?text=Rice' }, name: 'Organic Basmati Rice', quantity: 5, unit: 'kg', price: 120.00 },
        { productId: { imageUrl: 'https://placehold.co/40x40/E0E0E0/333333?text=Dal' }, name: 'Toor Dal', quantity: 2, unit: 'kg', price: 90.00 },
      ],
      totalAmountForSeller: 780.00, // Sum of (price * quantity) for seller's items
      status: 'processing',
      orderDate: new Date().toISOString(), // Today's date
    },
    {
      _id: 'ORDER002',
      userId: { name: 'Rahul Kumar' },
      shippingAddress: { city: 'Chennai', state: 'Tamil Nadu' },
      items: [
        { productId: { imageUrl: 'https://placehold.co/40x40/E0E0E0/333333?text=Honey' }, name: 'Multiflora Honey', quantity: 3, unit: 'jar', price: 350.00 },
      ],
      totalAmountForSeller: 1050.00,
      status: 'shipped',
      orderDate: new Date().toISOString(),
    },
    {
      _id: 'ORDER003',
      userId: { name: 'Anjali Singh' },
      shippingAddress: { city: 'Mumbai', state: 'Maharashtra' },
      items: [
        { productId: { imageUrl: 'https://placehold.co/40x40/E0E0E0/333333?text=Wheat' }, name: 'Organic Wheat Flour', quantity: 10, unit: 'kg', price: 60.00 },
        { productId: { imageUrl: 'https://placehold.co/40x40/E0E0E0/333333?text=Sugar' }, name: 'Jaggery Powder', quantity: 3, unit: 'kg', price: 80.00 },
      ],
      totalAmountForSeller: 840.00,
      status: 'pending',
      orderDate: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(), // 2 hours ago
    },
    // Add more dummy orders if needed
  ],
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const SellerDashboard = () => {
  // Using dummy data directly for UI rendering as per request
  const dashboardData = DUMMY_DASHBOARD_DATA;

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-green-50 to-lime-100 p-4 sm:p-6 lg:p-8 font-sans pt-20 pb-10">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 w-full max-w-screen-xl mx-auto border border-white/50">

        <h1 className="text-3xl sm:text-4xl font-extrabold text-green-800 mb-8 text-center">
          Seller Dashboard
        </h1>

        {/* Summary Cards */}
        {/* On extra small screens (xs), use flexbox for horizontal scrolling. On sm and larger, revert to grid. */}
        <div className="flex flex-nowrap overflow-x-auto space-x-4 pb-4 mb-10
                      sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:space-x-0 sm:pb-0">
          <DashboardCard
            title="Total Products"
            value={dashboardData.totalProducts}
            icon={Package}
            color="bg-blue-500"
          />
          <DashboardCard
            title="Total Orders"
            value={dashboardData.totalOrders}
            icon={ShoppingBag}
            color="bg-purple-500"
          />
          {/* Conditionally render FPO card */}
          {dashboardData.isFPO && (
            <DashboardCard
              title="Farmers Added"
              value={dashboardData.totalFarmers}
              icon={Users}
              color="bg-orange-500"
            />
          )}
        </div>

        {/* Today's Received Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
            <CalendarDays className="mr-3 text-lime-600" size={28} /> Today's Received Orders
          </h2>

          {dashboardData.todayOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p className="text-lg">No new orders received today.</p>
              <p className="text-sm mt-1">Keep up the great work!</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">
                      Order ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Items
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Total for You
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">
                      Order Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {dashboardData.todayOrders.map((order, index) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-lime-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-[120px]">
                        {order._id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          <User size={16} className="mr-1 text-gray-500" />
                          <span className="font-semibold">{order.userId.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-0.5">
                          <MapPin size={12} className="mr-1" />
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center mb-1 last:mb-0">
                            <img
                              src={item.productId?.imageUrl || 'https://placehold.co/30x30/E0E0E0/333333?text=P'}
                              alt={item.name}
                              className="w-8 h-8 rounded-md object-cover mr-2 flex-shrink-0"
                            />
                            <span className="text-xs font-medium truncate">
                              {item.name} ({item.quantity} {item.unit})
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-bold">
                        {formatCurrency(order.totalAmountForSeller)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Card Component - Reusable for summary cards
const DashboardCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    // Added min-w-[80vw] for mobile to ensure cards are scrollable and visible
    // On sm and above, min-w-0 ensures they shrink to fit the grid
    className={`relative ${color} rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-white overflow-hidden
                transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl
                min-w-[80vw] xs:min-w-[70vw] sm:min-w-0`}
    whileHover={{ y: -5 }} // Slight lift on hover
  >
    {/* Background icon for visual effect */}
    <div className="absolute top-0 left-0 w-full h-full opacity-10 flex items-center justify-center">
      <Icon size={140} className="text-white" />
    </div>
    <div className="relative z-10 text-center">
      <Icon size={48} className="mb-3 mx-auto drop-shadow-md" /> {/* Larger icon, subtle shadow */}
      <h3 className="text-xl sm:text-2xl font-semibold mb-1 drop-shadow-md">{title}</h3>
      <p className="text-4xl sm:text-5xl font-bold drop-shadow-lg">{value}</p>
    </div>
  </motion.div>
);

export default SellerDashboard;