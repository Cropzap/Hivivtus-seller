import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaDollarSign, FaHistory, FaUserCircle, FaEdit, FaSpinner, FaFileAlt, FaQuestionCircle, FaTicketAlt, FaSignOutAlt, FaEye, FaBuilding, FaHome, FaBox, FaWrench, FaTags, FaArrowRight, FaPlus, FaChevronRight, FaRegUserCircle, FaStore, FaChartLine, FaArrowLeft, FaBars,FaCheck } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// NOTE: Ensure your environment variables are configured correctly for these to work.
const API_URL = import.meta.env.VITE_API_URL;
const SELLER_PROFILE_API_URL = `${API_URL}sellerprofile`;
const SELLER_ORDERS_API_URL = `${API_URL}orders/seller`;
const SELLER_PRODUCTS_API_URL = `${API_URL}products`;
const SELLER_TICKETS_API_URL = `${API_URL}sellersupport-tickets`;

// --- Utility Components ---

/**
 * MetricCard Component (Mobile/Desktop)
 */
const MetricCard = ({ icon: Icon, title, value, colorClass, isMobile }) => (
  <motion.div
    className={`bg-white rounded-2xl shadow-lg p-4 flex items-center space-x-3 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-gray-100 ${isMobile ? 'active:scale-[0.98] active:opacity-80' : ''}`}
    whileTap={isMobile ? { scale: 0.98 } : {}}
  >
    <div className={`p-3 rounded-xl ${colorClass} text-white flex-shrink-0`}>
      <Icon className="text-xl" />
    </div>
    <div className='flex-1'>
      <p className="text-gray-600 text-xs font-medium uppercase truncate">{title}</p>
      <h3 className="text-gray-900 text-2xl font-bold mt-0.5">{value}</h3>
    </div>
  </motion.div>
);

/**
 * MobileFeatureCard Component (Used only in Overview)
 */
const MobileFeatureCard = ({ icon: Icon, title, onClick, colorClass }) => (
  <motion.button
    className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-lg border border-gray-100 h-28 w-full active:shadow-xl transition-shadow duration-150"
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
  >
    <div className={`p-3 rounded-xl ${colorClass} text-white mb-2 flex-shrink-0`}>
      <Icon className="text-2xl" />
    </div>
    <p className="text-sm font-semibold text-gray-700 text-center">{title}</p>
  </motion.button>
);

/**
 * OrderPriceChart Component (Desktop Only) - Bar Chart
 */
const OrderPriceChart = ({ orders }) => {
  // Use last 10 orders for a cleaner visualization
  const chartData = orders.slice(0, 10).reverse().map((order, index) => ({
    name: `Order #${orders.length - index}`, // Reverse the index for chronological look
    'Order Value': order.totalAmount,
  }));

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 mt-6 border border-gray-100 hidden lg:block">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <FaChartLine className='mr-2 text-blue-500' /> Recent Order Values
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="name" stroke="#6b7280" angle={-15} textAnchor="end" height={50} tick={{ fontSize: 10 }} />
          <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
          <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(value) => [`₹${value.toFixed(2)}`, 'Order Value']} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar dataKey="Order Value" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * SalesDistributionChart Component (Desktop Only) - Pie Chart
 */
const SalesDistributionChart = ({ orders, products }) => {
  const productSalesMap = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      // Use product ID as key, sum up total price * quantity
      productSalesMap[item.productId] = (productSalesMap[item.productId] || 0) + (item.price * item.quantity);
    });
  });

  const chartData = Object.entries(productSalesMap).map(([productId, sales]) => {
    const product = products.find(p => p._id === productId);
    return {
      name: product ? product.name.substring(0, 20) + (product.name.length > 20 ? '...' : '') : `Product ID: ${productId.substring(0, 4)}...`,
      value: sales,
    };
  }).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 products by sales

  const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <FaTags className='mr-2 text-emerald-600' /> Top Product Sales Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']} />
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
      {chartData.length === 0 && <p className="text-gray-500 text-center py-12">No sales data yet to display.</p>}
    </div>
  );
};

// --- Modals and Detail Components (Kept for completeness, simplified) ---

/**
 * OrderDetailsModal Component
 */
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;
  const formattedDate = new Date(order.createdAt).toLocaleString();
  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-500';
      case 'shipped': return 'bg-blue-500';
      case 'processing': return 'bg-orange-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 transition-all duration-300" onClick={(e) => (e.target === e.currentTarget && onClose())}>
      <motion.div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <motion.button onClick={onClose} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" whileTap={{ scale: 0.9 }}>
            &times;
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-4 my-4">
          <DetailItem label="Order ID" value={order._id.substring(0, 8) + '...'} />
          <DetailItem label="Total Revenue" value={`₹${order.totalAmount.toFixed(2)}`} />
          <DetailItem label="Order Date" value={formattedDate} />
          <DetailItem label="Customer" value={order.customerDetails?.customerName || 'N/A'} />
          <div className='col-span-2'>
            <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
            <p className={`text-md font-semibold text-white px-3 py-1 rounded-full text-center inline-block ${getOrderStatusColor(order.status)}`}>
              {order.status}
            </p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4 border-t pt-4">Products</h3>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/48x48/E0E0E0/333333?text=${item.name.charAt(0)}`; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-lg text-emerald-600 flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

/**
 * TicketDetailsModal Component
 */
const TicketDetailsModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Resolved': return 'bg-emerald-500';
      case 'Closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 transition-all duration-300" onClick={(e) => (e.target === e.currentTarget && onClose())}>
      <motion.div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
          <motion.button onClick={onClose} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" whileTap={{ scale: 0.9 }}>
            &times;
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-4 my-4">
          <DetailItem label="Ticket ID" value={ticket.ticketId} />
          <div className='flex flex-col'>
            <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
            <p className={`text-sm font-semibold text-white px-3 py-1 rounded-full text-center inline-block ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </p>
          </div>
          <DetailItem label="Subject" value={ticket.subject} fullWidth />
          <DetailItem label="Category" value={ticket.category} />
          <DetailItem label="Order ID" value={ticket.orderId || 'N/A'} />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 border-t pt-4">Description</h3>
        <p className="text-gray-700 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">{ticket.description}</p>

        <h3 className="text-xl font-bold text-gray-900 mb-3">Replies ({ticket.replies?.length || 0})</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {ticket.replies && ticket.replies.length > 0 ? (
            ticket.replies.map((reply, index) => (
              <div key={index} className="p-3 rounded-xl shadow-sm bg-blue-50 border-l-4 border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-blue-800 text-sm">{reply.userName}</span>
                  <span className="text-xs text-gray-500">{new Date(reply.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 text-sm">{reply.message}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No replies yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Helper component for modal details
const DetailItem = ({ label, value, fullWidth = false }) => (
  <div className={`flex flex-col ${fullWidth ? 'col-span-2' : ''}`}>
    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-md font-semibold text-gray-900 break-words">{value}</p>
  </div>
);

// --- Main Dashboard Component ---

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sellerProfile, setSellerProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Placeholder for the seller's initial state
  const placeholderSeller = {
    sellerName: 'Hivictus Seller',
    companyName: 'Loading Company',
    profilePicture: 'https://placehold.co/96x96/E0E0E0/333333?text=S',
    role: 'Seller',
    email: 'loading@example.com',
    businessType: 'Farm/FPO',
    sellerStatus: 'Pending',
    _id: null,
  };

  // --- Handlers ---
  const handleViewOrderDetails = (order) => { setSelectedOrder(order); setIsOrderModalOpen(true); };
  const handleCloseOrderModal = () => { setSelectedOrder(null); setIsOrderModalOpen(false); };
  const handleViewTicketDetails = (ticket) => { setSelectedTicket(ticket); setIsTicketModalOpen(true); };
  const handleCloseTicketModal = () => { setSelectedTicket(null); setIsTicketModalOpen(false); };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  // Custom navigation handler for mobile back button
  const handleMobileBack = () => {
    // Navigate back to 'overview' tab
    if (activeTab !== 'overview') {
      setActiveTab('overview');
    } else {
      // Optional: If already on overview, navigate to the previous page in browser history or a main app route
      // navigate(-1); 
    }
  };

  // --- Data Fetching Logic ---
  const fetchSellerData = async (token) => {
    const headers = { 'Content-Type': 'application/json', 'x-auth-token': token };
    const requests = {
      profile: axios.get(SELLER_PROFILE_API_URL, { headers }),
      orders: axios.get(SELLER_ORDERS_API_URL, { headers }),
      products: axios.get(SELLER_PRODUCTS_API_URL + '/seller', { headers }),
      tickets: axios.get(SELLER_TICKETS_API_URL, { headers }),
    };

    try {
      const [profileRes, ordersRes, productsRes, ticketsRes] = await Promise.all([
        requests.profile,
        requests.orders,
        requests.products,
        requests.tickets
      ]);

      setSellerProfile({ ...placeholderSeller, ...profileRes.data });
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setTickets(ticketsRes.data);
      setError(null);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load all dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sellerToken = localStorage.getItem('token');
    if (!sellerToken) {
      setError("You must log in to view your dashboard.");
      setLoading(false);
      return;
    }
    fetchSellerData(sellerToken);
  }, []);

  // --- Dashboard Metrics Calculation ---
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2);
  const pendingOrders = orders.filter(o => o.status?.toLowerCase() === 'pending' || o.status?.toLowerCase() === 'processing').length;
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;

  const profile = sellerProfile || placeholderSeller;
  const profileName = profile.sellerName || profile.companyName;
  const profileImage = profile.profilePicture;
  const sellerStatus = profile.sellerStatus;

  // --- Status/Color Helpers ---
  const getpStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-500';
      case 'active': return 'bg-emerald-600';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-600';
      case 'shipped': return 'bg-blue-500';
      case 'processing': return 'bg-orange-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTicketStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-500 text-red-100';
      case 'In Progress': return 'bg-yellow-500 text-yellow-100';
      case 'Resolved': return 'bg-emerald-500 text-emerald-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };

  const getProductStockColor = (stock) => {
    if (stock > 50) return 'text-emerald-600';
    if (stock > 10) return 'text-orange-500';
    return 'text-red-600';
  };

  // --- Mobile UI Components ---

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'overview': return 'Dashboard';
      case 'orders': return 'My Orders';
      case 'products': return 'My Products';
      case 'supportTickets': return 'Support Center';
      case 'profile': return 'My Account';
      default: return 'Dashboard';
    }
  }

  // Mobile Header with Back Button Logic
  const MobileNavHeader = () => (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 shadow-md z-40 lg:hidden transition-all duration-200">
      <div className="flex justify-between items-center px-4 py-3">
        {activeTab !== 'overview' ? (
          <>
            <motion.button 
              onClick={handleMobileBack} // Back to overview
              className="p-2 -ml-2 rounded-full text-gray-700 hover:bg-gray-100 active:scale-90 transition-transform flex-shrink-0"
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft className="text-xl" />
            </motion.button>
            <h1 className="text-gray-900 font-extrabold text-xl flex-1 text-center pr-6">
              {getPageTitle(activeTab)}
            </h1>
          </>
        ) : (
          <>
            <h1 className="text-gray-900 font-extrabold text-2xl">
              {getPageTitle(activeTab)}
            </h1>
            <Link 
              to="/seller-profile" 
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500 flex-shrink-0 active:scale-95 transition-transform"
              onClick={() => setActiveTab('profile')} // Keep profile view on click, but dashboard is still 'overview'
            >
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/E0E0E0/333333?text=S'; }}
              />
            </Link>
          </>
        )}
      </div>
    </div>
  );

  // Mobile Bottom Navigation Bar (Fixed to bottom)
  const MobileNavBar = () => {
    const NavItem = ({ tabKey, icon: Icon, label }) => (
      <motion.button
        className={`flex flex-col items-center p-1 flex-1 transition-colors duration-200 ${
          activeTab === tabKey ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-400'
        }`}
        onClick={() => setActiveTab(tabKey)}
        whileTap={{ scale: 0.95 }}
      >
        <Icon className="text-xl mb-0.5" />
        <span className="text-xs font-medium">{label}</span>
      </motion.button>
    );

    // Only show the bottom bar on the 'overview' tab for simplicity
    // When on other tabs, the Back Button takes precedence
    if (activeTab !== 'overview') return null;

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 lg:hidden">
        <div className="flex justify-around items-center h-16">
          <NavItem tabKey="overview" icon={FaHome} label="Home" />
          <NavItem tabKey="orders" icon={FaBox} label="Orders" />
          <NavItem tabKey="products" icon={FaTags} label="Products" />
          <NavItem tabKey="supportTickets" icon={FaWrench} label="Support" />
          <NavItem tabKey="profile" icon={FaRegUserCircle} label="Profile" />
        </div>
      </div>
    );
  };
  
  // New handler for Add Product - uses navigate for routing
  const handleAddNewProduct = () => {
    navigate('/add-product');
  }

  // New handler for New Ticket - uses navigate for routing
  const handleNewTicket = () => {
    navigate('/create-ticket');
  }

  // --- Tab Content Renderers (Simplified for brevity) ---

  const renderOverview = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-3xl font-extrabold text-gray-900 hidden lg:block">Welcome back, {profileName.split(' ')[0]} 👋</div>

      {/* --- Mobile Feature Grid (Only on mobile/small screens) --- */}
      <div className="grid grid-cols-2 gap-4 lg:hidden">
        <MobileFeatureCard icon={FaBox} title="Orders" onClick={() => setActiveTab('orders')} colorClass="bg-blue-500" />
        <MobileFeatureCard icon={FaTags} title="Products" onClick={() => setActiveTab('products')} colorClass="bg-red-500" />
        <MobileFeatureCard icon={FaWrench} title="Support" onClick={() => setActiveTab('supportTickets')} colorClass="bg-yellow-500" />
        <MobileFeatureCard icon={FaRegUserCircle} title="Profile" onClick={() => setActiveTab('profile')} colorClass="bg-purple-500" />
      </div>
      {/* --- END Mobile Feature Grid --- */}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={FaDollarSign} title="Total Revenue" value={`₹${totalRevenue}`} colorClass="bg-emerald-600" isMobile={true} />
        <MetricCard icon={FaShoppingCart} title="Total Sales" value={totalSales} colorClass="bg-blue-500" isMobile={true} />
        <MetricCard icon={FaHistory} title="Pending Orders" value={pendingOrders} colorClass="bg-red-500" isMobile={true} />
        <MetricCard icon={FaTicketAlt} title="Open Tickets" value={openTickets} colorClass="bg-yellow-500" isMobile={true} />
      </div>
      
      {/* Desktop Graph Area */}
      <div className="hidden lg:grid grid-cols-2 gap-6">
        {orders.length > 0 && <SalesDistributionChart orders={orders} products={products} />}
        {orders.length > 0 && <OrderPriceChart orders={orders} />}
      </div>

      {/* Latest Orders List (Visible on both) */}
      <div className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Latest Orders</h3>
          <motion.button onClick={() => setActiveTab('orders')} className="text-sm font-semibold text-emerald-600 flex items-center active:scale-95 transition-transform">
            See All <FaChevronRight className="ml-1 text-xs" />
          </motion.button>
        </div>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order) => (
            <OrderListItem key={order._id} order={order} handleViewDetails={handleViewOrderDetails} getOrderStatusColor={getOrderStatusColor} />
          ))}
          {orders.length === 0 && <p className="text-gray-500 text-center py-2 text-sm">No recent orders to show.</p>}
        </div>
      </div>
    </motion.div>
  );

  const OrderListItem = ({ order, handleViewDetails, getOrderStatusColor }) => (
    <motion.div
      className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex justify-between items-center active:bg-gray-50 transition-all duration-200 cursor-pointer hover:shadow-md"
      onClick={() => handleViewDetails(order)}
      whileTap={{ scale: 0.99, backgroundColor: "#f3f4f6" }}
    >
      <div className="flex-1 min-w-0 pr-2">
        <p className="font-semibold text-sm text-gray-900 truncate">#{order._id.substring(0, 8)}...</p>
        <p className="text-xs text-gray-500 mt-0.5">
          ₹{order.totalAmount.toFixed(0)} | {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className='flex items-center space-x-2 flex-shrink-0'>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${getOrderStatusColor(order.status)}`}>
          {order.status}
        </span>
        <FaChevronRight className="text-gray-400 text-xs" />
      </div>
    </motion.div>
  );

  const renderOrders = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 hidden lg:block">All Orders ({orders.length})</h2>
        <div className="space-y-3">
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <OrderListItem key={order._id || index} order={order} handleViewDetails={handleViewOrderDetails} getOrderStatusColor={getOrderStatusColor} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No orders found.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
  
  const ProductListItem = ({ product }) => (
    <motion.div
      className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex items-center space-x-3 transition-all duration-200 cursor-pointer hover:shadow-md"
      whileTap={{ scale: 0.99, backgroundColor: "#f3f4f6" }}
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
        <img
          src={product.imageUrl || 'https://placehold.co/48x48/E0E0E0/333333?text=P'}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/48x48/E0E0E0/333333?text=${product.name.charAt(0)}`; }}
        />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="font-semibold text-base text-gray-900 truncate">{product.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">Category: {product.category || 'N/A'}</p>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <p className="font-bold text-sm text-emerald-600">₹{product.price?.toFixed(2) || 'N/A'}</p>
        <p className={`text-xs font-medium ${getProductStockColor(product.stock)}`}>Stock: {product.stock}</p>
      </div>
    </motion.div>
  );

  const renderProducts = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 hidden lg:block">All Products ({products.length})</h2>
          <motion.button 
            onClick={handleAddNewProduct} 
            className="text-sm font-semibold text-white bg-emerald-600 px-3 py-1.5 rounded-full hover:bg-emerald-700 transition-colors flex items-center active:scale-95 shadow-md"
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus className='mr-1' /> Add New
          </motion.button>
        </div>
        <div className="space-y-3">
          {products.length > 0 ? (
            products.map((product, index) => (
              <ProductListItem key={product._id || index} product={product} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No products found. Time to add some!</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  const TicketListItem = ({ ticket, handleViewDetails }) => (
    <motion.div
      className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex justify-between items-center active:bg-gray-50 transition-all duration-200 cursor-pointer hover:shadow-md"
      onClick={() => handleViewDetails(ticket)}
      whileTap={{ scale: 0.99, backgroundColor: "#f3f4f6" }}
    >
      <div className="flex-1 min-w-0 pr-2">
        <p className="font-semibold text-sm text-gray-900 truncate">{ticket.subject}</p>
        <p className="text-xs text-gray-500 mt-0.5">ID: {ticket.ticketId}</p>
      </div>
      <div className='flex items-center space-x-2 flex-shrink-0'>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getTicketStatusColor(ticket.status)}`}>
          {ticket.status}
        </span>
        <FaChevronRight className="text-gray-400 text-xs" />
      </div>
    </motion.div>
  );
  
  const renderSupportTickets = () => (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 hidden lg:block">My Tickets ({tickets.length})</h2>
          <motion.button 
            onClick={handleNewTicket} 
            className="text-sm font-semibold text-white bg-blue-500 px-3 py-1.5 rounded-full hover:bg-blue-600 transition-colors flex items-center active:scale-95 shadow-md"
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus className='mr-1' /> New Ticket
          </motion.button>
        </div>
        <div className="space-y-3">
          {tickets.length > 0 ? (
            tickets.map((ticket, index) => (
              <TicketListItem key={ticket._id || index} ticket={ticket} handleViewDetails={handleViewTicketDetails} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No support tickets found. We're here to help!</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Desktop Navigation Item Component
  const DesktopNavItem = ({ tabKey, icon: Icon, label }) => (
    <motion.button
      className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
        activeTab === tabKey
          ? 'bg-emerald-500 text-white font-bold shadow-md hover:bg-emerald-600'
          : 'text-gray-700 hover:bg-gray-100 font-medium'
      }`}
      onClick={() => setActiveTab(tabKey)}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className={`mr-3 text-xl ${activeTab !== tabKey ? 'text-emerald-500' : 'text-white'}`} />
      <span>{label}</span>
    </motion.button>
  );

  const renderProfile = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Profile Info Card */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl">
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/E0E0E0/333333?text=S'; }}
              />
            </div>
            <span className={`absolute bottom-0 right-0 transform translate-x-1 -translate-y-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${getpStatusColor(sellerStatus)}`}>
              <FaCheck className='text-xs' /> {/* Placeholder icon */}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{profileName}</h2>
          <p className="text-gray-500 text-sm">{profile.email}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <DetailItem icon={FaBuilding} label="Company Name" value={profile.companyName} />
          <DetailItem icon={FaRegUserCircle} label="Seller Role" value={profile.role} />
          <DetailItem icon={FaStore} label="Business Type" value={profile.businessType} />
          <DetailItem 
            icon={FaFileAlt} 
            label="Verification Status" 
            value={
              <span className={`font-semibold text-white px-3 py-1 rounded-full text-xs inline-block ${getpStatusColor(sellerStatus)}`}>
                {sellerStatus}
              </span>
            } 
          />
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
          <motion.button
            onClick={() => navigate('/seller-profile')}
            className="flex items-center text-sm font-semibold text-blue-500 border border-blue-500 px-4 py-2 rounded-full hover:bg-blue-50 transition-colors active:scale-95"
            whileTap={{ scale: 0.95 }}
          >
            <FaEdit className='mr-2' /> Edit Profile
          </motion.button>
          <motion.button
            onClick={handleLogout}
            className="flex items-center text-sm font-semibold text-red-500 border border-red-500 px-4 py-2 rounded-full hover:bg-red-50 transition-colors active:scale-95"
            whileTap={{ scale: 0.95 }}
          >
            <FaSignOutAlt className='mr-2' /> Logout
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  // --- Main Content Renderer ---
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
          <FaSpinner className="text-4xl animate-spin text-emerald-500" />
          <p className="mt-4 text-lg font-semibold">Loading Dashboard Data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-600 p-4 bg-red-100 rounded-xl border border-red-300">
          <FaExclamationTriangle className="text-4xl mb-4" />
          <p className="mt-2 text-xl font-bold">Error Loading Data</p>
          <p className="text-center mt-2">{error}</p>
          <motion.button
            onClick={() => navigate('/login')}
            className="mt-6 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors active:scale-95"
            whileTap={{ scale: 0.95 }}
          >
            Go to Login
          </motion.button>
        </div>
      );
    }

    switch (activeTab) {
      case 'orders': return renderOrders();
      case 'products': return renderProducts();
      case 'supportTickets': return renderSupportTickets();
      case 'profile': return renderProfile();
      case 'overview':
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-16 flex">
      
      {/* --- Desktop Sidebar Navigation (Hidden on Mobile) --- */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-100 shadow-xl p-4 sticky top-0 min-h-screen">
        <div className="flex items-center p-3 mb-8 border-b pb-4">
          <FaStore className="text-3xl text-emerald-600 mr-3" />
          <h2 className="text-xl font-extrabold text-gray-900">Seller Hub</h2>
        </div>
        <nav className="space-y-2">
          <DesktopNavItem tabKey="overview" icon={FaHome} label="Dashboard" />
          <DesktopNavItem tabKey="orders" icon={FaBox} label="Orders" />
          <DesktopNavItem tabKey="products" icon={FaTags} label="Products" />
          <DesktopNavItem tabKey="supportTickets" icon={FaWrench} label="Support Center" />
          <DesktopNavItem tabKey="profile" icon={FaRegUserCircle} label="Profile" />
        </nav>
        <div className="mt-auto pt-6 border-t">
          <motion.button 
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <FaSignOutAlt className="mr-3 text-xl" />
            <span>Logout</span>
          </motion.button>
        </div>
      </div>
      
      {/* --- Mobile Header --- */}
      <MobileNavHeader />

      {/* --- Main Content Area (Covers Full Screen Space) --- */}
      <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto"> {/* pt-20 for mobile header space, lg:pt-8 for desktop space */}
        <AnimatePresence mode='wait'>
          <div className={`mb-16 lg:mb-0`}> {/* mb-16 for mobile bottom navbar space */}
            {renderTabContent()}
          </div>
        </AnimatePresence>
      </main>

      {/* --- Mobile Bottom Navigation Bar (Fixed) --- */}
      <MobileNavBar />
      
      {/* --- Modals (Rendered outside main content flow) --- */}
      <AnimatePresence>
        {isOrderModalOpen && <OrderDetailsModal order={selectedOrder} onClose={handleCloseOrderModal} />}
        {isTicketModalOpen && <TicketDetailsModal ticket={selectedTicket} onClose={handleCloseTicketModal} />}
      </AnimatePresence>
    </div>
  );
};

export default SellerDashboard;