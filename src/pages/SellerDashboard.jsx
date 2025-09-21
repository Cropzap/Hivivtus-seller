import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaDollarSign, FaHistory, FaUserCircle, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaEdit, FaStore, FaSpinner, FaFileAlt, FaQuestionCircle, FaTicketAlt, FaSignOutAlt, FaEye,FaBuilding } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// The API URLs for your backend routes.
// NOTE: These URLs assume a seller-specific endpoint structure.
const API_URL = import.meta.env.VITE_API_URL;
const SELLER_PROFILE_API_URL = `${API_URL}sellerprofile`;
const SELLER_ORDERS_API_URL = `${API_URL}orders/seller`;
const SELLER_PRODUCTS_API_URL = `${API_URL}products`;
const SELLER_TICKETS_API_URL = `${API_URL}sellersupport-tickets`;

/**
 * MetricCard Component
 * Displays a single metric with an icon, title, and value.
 * @param {object} props - The component props.
 * @param {React.ComponentType} props.icon - The icon component to display.
 * @param {string} props.title - The title of the metric.
 * @param {string|number} props.value - The value of the metric.
 * @param {string} props.colorClass - The Tailwind CSS class for the background color of the icon.
 */
const MetricCard = ({ icon: Icon, title, value, colorClass }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-start justify-center transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
    <div className={`p-3 rounded-xl ${colorClass} text-white mb-3`}>
      <Icon className="text-xl sm:text-2xl" />
    </div>
    <p className="text-gray-700 text-sm font-medium">{title}</p>
    <h3 className="text-gray-900 text-3xl font-bold mt-1">{value}</h3>
  </div>
);

/**
 * OrderPriceChart Component
 * Displays a bar chart of the total amount for each order.
 * @param {object} props - The component props.
 * @param {Array<object>} props.orders - The list of order objects.
 */
const OrderPriceChart = ({ orders }) => {
  // Format data for the chart, using truncated order IDs for the X-axis
  const chartData = orders.map(order => ({
    name: `Order ${order._id.substring(0, 5)}...`,
    'Total Revenue': order.totalAmount,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Order Value Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip />
          <Legend />
          <Bar dataKey="Total Revenue" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * OrderDetailsModal Component
 * A modal to display detailed information about a single order.
 * @param {object} props - The component props.
 * @param {object} props.order - The order object to display.
 * @param {Function} props.onClose - Function to call to close the modal.
 */
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  // Format the date for better readability
  const formattedDate = new Date(order.createdAt).toLocaleString();

  // A helper function to close the modal
  const handleClose = (e) => {
    // Only close if clicking the close button or the backdrop
    if (e.target === e.currentTarget || e.target.closest('button')) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 transition-all duration-300" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative animate-fade-in-up">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <FaTimesCircle className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Order ID</p>
            <p className="text-md font-semibold text-gray-900">{order._id}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Order Date</p>
            <p className="text-md font-semibold text-gray-900">{formattedDate}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Customer</p>
            <p className="text-md font-semibold text-gray-900">{order.customerDetails?.customerName || 'N/A'}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-md font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Products List */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">Products</h3>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl shadow-sm">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/64x64/E0E0E0/333333?text=${item.name.charAt(0)}`; }}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg text-gray-900 line-clamp-1">{item.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-lg text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * TicketDetailsModal Component
 * A modal to display detailed information about a single support ticket.
 * @param {object} props - The component props.
 * @param {object} props.ticket - The ticket object to display.
 * @param {Function} props.onClose - Function to call to close the modal.
 */
const TicketDetailsModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  // Function to get a color for the status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Resolved': return 'bg-green-500';
      case 'Closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleClose = (e) => {
    if (e.target === e.currentTarget || e.target.closest('button')) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 transition-all duration-300" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative animate-fade-in-up">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <FaTimesCircle className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Ticket Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Ticket ID</p>
            <p className="text-md font-semibold text-gray-900">{ticket.ticketId}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className={`text-md font-semibold text-white px-2 py-1 rounded-full text-center ${getStatusColor(ticket.status)}`}>
                {ticket.status}
            </p>
          </div>
          <div className="flex flex-col col-span-2">
            <p className="text-sm font-medium text-gray-500">Subject</p>
            <p className="text-md font-semibold text-gray-900">{ticket.subject}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Category</p>
            <p className="text-md font-semibold text-gray-900">{ticket.category}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-500">Order ID</p>
            <p className="text-md font-semibold text-gray-900">{ticket.orderId || 'N/A'}</p>
          </div>
        </div>
        
        {/* Description and Replies */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
        <p className="text-gray-700 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">{ticket.description}</p>
        
        <h3 className="text-xl font-bold text-gray-900 mb-4">Replies ({ticket.replies.length})</h3>
        <div className="space-y-4 max-h-60 overflow-y-auto">
            {ticket.replies.length > 0 ? (
                ticket.replies.map((reply, index) => (
                    <div key={index} className="p-4 rounded-xl shadow-sm bg-blue-50 border-l-4 border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-blue-800">{reply.userName}</span>
                            <span className="text-xs text-gray-500">{new Date(reply.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{reply.message}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No replies yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

/**
 * SellerDashboard Component
 * The main component for the seller's dashboard.
 */
const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sellerProfile, setSellerProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Placeholder for the seller's initial state
  const placeholderSeller = {
    sellerName: 'Loading...',
    companyName: 'Loading...',
    profilePicture: 'https://placehold.co/64x64/E0E0E0/333333?text=S',
    role: 'Seller',
    _id: null,
  };

  // Function to open the order details modal
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };
  
  // Function to close the order details modal
  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
    setIsOrderModalOpen(false);
  };

  // Function to open the ticket details modal
  const handleViewTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  // Function to close the ticket details modal
  const handleCloseTicketModal = () => {
    setSelectedTicket(null);
    setIsTicketModalOpen(false);
  };
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    navigate('/'); // Redirect to the homepage or login page
  };

  // Main effect to fetch seller profile data once
  useEffect(() => {
    const fetchSellerProfile = async () => {
      setError(null);
      const sellerToken = localStorage.getItem('token');

      if (!sellerToken) {
        setError("You must log in to view your dashboard.");
        setLoading(false);
        return;
      }

      try {
        const profileResponse = await axios.get(SELLER_PROFILE_API_URL, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': sellerToken,
          },
        });
        
        setSellerProfile({
          ...placeholderSeller,
          ...profileResponse.data,
        });

      } catch (err) {
        console.error("Seller profile fetch error:", err.response?.data?.msg || err.message);
        setError(err.response?.data?.msg || "Failed to fetch seller profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchSellerProfile();
  }, []);

  // Effect to fetch orders when the component mounts or the activeTab changes to 'orders' or 'overview'
  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'overview') {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        const sellerToken = localStorage.getItem('token');
        if (!sellerToken) {
          setLoadingOrders(false);
          return;
        }

        try {
          const ordersResponse = await axios.get(SELLER_ORDERS_API_URL, {
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': sellerToken,
            },
          });
          
          setOrders(ordersResponse.data);

        } catch (err) {
          console.error("Orders fetch error:", err.response?.data?.msg || err.message);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  // Effect to fetch products
// Effect to fetch products
useEffect(() => {
  if (activeTab === 'products') {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      const sellerToken = localStorage.getItem('token');
      
      if (!sellerToken) {
        setLoadingProducts(false);
        return;
      }

      try {
        // The key change is here. Your API needs to be updated to handle this route.
        // It should be something like: `/api/products/seller`
        const productsResponse = await axios.get(SELLER_PRODUCTS_API_URL + '/seller', {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': sellerToken,
          },
        });
        
        setProducts(productsResponse.data);
      } catch (err) {
        console.error("Products fetch error:", err.response?.data?.msg || err.message);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }
}, [activeTab]);

  // Effect to fetch support tickets
  useEffect(() => {
    if (activeTab === 'supportTickets') {
        const fetchTickets = async () => {
            setLoadingTickets(true);
            const sellerToken = localStorage.getItem('token');
            if (!sellerToken) {
                setLoadingTickets(false);
                return;
            }

            try {
                const ticketsResponse = await axios.get(SELLER_TICKETS_API_URL, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': sellerToken,
                    },
                });

                setTickets(ticketsResponse.data);
            } catch (err) {
                console.error("Tickets fetch error:", err.response?.data?.msg || err.message);
            } finally {
                setLoadingTickets(false);
            }
        };
        fetchTickets();
    }
  }, [activeTab]);

  // --- Dashboard Metrics Calculation ---
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2);
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'processing').length;
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open').length;
  
  const lastActivities = [
    { id: 1, text: 'Order #ORD001 delivered', status: 'success' },
    { id: 2, text: 'New item added to wishlist', status: 'info' },
    { id: 3, text: 'Review submitted for Hybrid Tomato Seeds', status: 'success' },
  ];

  const profileName = sellerProfile ? (sellerProfile.sellerName || sellerProfile.companyName) : placeholderSeller.sellerName;
  const profileImage = sellerProfile ? sellerProfile.profilePicture : placeholderSeller.profilePicture;
  const profileRole = sellerProfile ? sellerProfile.role : placeholderSeller.role;
const businessType = sellerProfile ? sellerProfile.businessType : placeholderSeller.businessType;
// New variable to get the email
const sellerEmail = sellerProfile ? sellerProfile.email : placeholderSeller.email;
const sellerStatus = sellerProfile ? sellerProfile.sellerStatus : 'N/A';

// A helper function to get a color class for the seller status
const getpStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-blue-500';
    case 'active':
      return 'bg-green-500';
    case 'suspended':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

  // A helper function to get a status-based color class
  const getStatusColor = (status) => {
    switch (status) {
        case 'Open': return 'bg-red-100 text-red-700 border-red-200';
        case 'In Progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
        case 'Closed': return 'bg-gray-100 text-gray-700 border-gray-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
        case 'delivered': return 'bg-emerald-500';
        case 'shipped': return 'bg-blue-500';
        case 'processing': return 'bg-orange-500';
        case 'pending': return 'bg-gray-500';
        default: return 'bg-gray-500';
    }
  };

  const getProductStockColor = (stock) => {
      if (stock > 50) return 'text-green-600';
      if (stock > 10) return 'text-orange-500';
      return 'text-red-600';
  };

  // The main dashboard UI
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 sm:p-6 mt-16 font-sans">
      {/* Modals */}
      {isOrderModalOpen && <OrderDetailsModal order={selectedOrder} onClose={handleCloseOrderModal} />}
      {isTicketModalOpen && <TicketDetailsModal ticket={selectedTicket} onClose={handleCloseTicketModal} />}

      <div className="w-full max-w-screen-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (User Profile & Navigation) */}
        <div className="lg:col-span-1 space-y-6">
{/* Improved User Profile Card */}
<div className="bg-white rounded-3xl shadow-2xl p-8 w-full border border-gray-100">
  <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
    
    {/* Profile Image and Status */}
    <div className="relative flex-shrink-0">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl">
        <img
          src={profileImage}
          alt="Seller Profile"
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/E0E0E0/333333?text=S'; }}
        />
      </div>
      {/* Seller Status Badge (positioned at the bottom right) */}
      <span className={`absolute bottom-0 right-0 transform translate-x-1 -translate-y-1 text-xs font-bold px-3 py-1 rounded-full text-white capitalize shadow-md ${getpStatusColor(sellerStatus)}`}>
        {sellerStatus}
      </span>
    </div>

    {/* Profile Details */}
    <div className="flex-1 text-center md:text-left">
      <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">{profileName}</h2>
      <p className="text-gray-600 text-sm mt-1">{sellerEmail}</p>
      
      <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-gray-700">
        <div className="flex items-center">
          <FaBuilding className="text-emerald-500 mr-2" />
          <span>{businessType}</span>
        </div>
      </div>
    </div>
    
    {/* Action Buttons */}
    <div className="flex space-x-2 md:space-x-3 mt-4 md:mt-0">
      {/* <Link
        to="seller-profile"
        className="p-3 rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition-colors duration-200"
        aria-label="View Profile"
      >
        <FaUserCircle className="text-xl" />
      </Link> */}
      <Link
        to="/seller-profile"
        className="p-3 rounded-full bg-gray-200 text-gray-700 shadow-md hover:bg-gray-300 transition-colors duration-200"
        aria-label="Edit Profile"
      >
        <FaEdit className="text-xl" />
      </Link>
    </div>
  </div>
</div>

          {/* New Navigation Menu */}
          <div className="bg-white rounded-2xl shadow-lg p-4 w-full">
            <nav className="space-y-2">
              <Link 
                to="/seller-orders" 
                className="flex items-center px-4 py-2 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <FaShoppingCart className="mr-3 text-lg text-emerald-600" />
                Orders
              </Link>
              <Link 
                to="/support" 
                className="flex items-center px-4 py-2 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <FaTicketAlt className="mr-3 text-lg text-emerald-600" />
                Support Tickets
              </Link>
              <Link 
                to="/terms-and-conditions" 
                className="flex items-center px-4 py-2 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <FaFileAlt className="mr-3 text-lg text-emerald-600" />
                Terms & Conditions
              </Link>
              <Link 
                to="/faq" 
                className="flex items-center px-4 py-2 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <FaQuestionCircle className="mr-3 text-lg text-emerald-600" />
                FAQ
              </Link>
              <button 
                onClick={handleLogout} 
                className="flex items-center w-full text-left px-4 py-2 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <FaSignOutAlt className="mr-3 text-lg text-red-500" />
                Logout
              </button>
            </nav>
          </div>

          {/* Last Activities section from original code */}
          {/* <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Last Activities</h2>
              <a href="#" className="text-emerald-600 hover:text-emerald-800 font-semibold text-sm transition-colors">See All</a>
            </div>
            <div className="space-y-3">
              {lastActivities.map(activity => (
                <div key={activity.id} className="flex items-center bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100">
                  {activity.status === 'success' && <FaCheckCircle className="text-emerald-500 mr-3 flex-shrink-0 text-lg" />}
                  {activity.status === 'error' && <FaTimesCircle className="text-red-500 mr-3 flex-shrink-0 text-lg" />}
                  {activity.status === 'info' && <FaInfoCircle className="text-blue-500 mr-3 flex-shrink-0 text-lg" />}
                  <p className="text-gray-800 text-sm flex-grow">{activity.text}</p>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {/* Right Column (Main Content Area - Tabs) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-2 w-full">
            <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
              <button 
                onClick={() => setActiveTab('overview')} 
                className={`flex-1 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 ${activeTab === 'overview' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`} 
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('orders')} 
                className={`flex-1 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 ${activeTab === 'orders' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`} 
              >
                My Orders
              </button>
              <button 
                onClick={() => setActiveTab('products')} 
                className={`flex-1 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 ${activeTab === 'products' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`} 
              >
                My Products
              </button>
              <button 
                onClick={() => setActiveTab('supportTickets')} 
                className={`flex-1 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 ${activeTab === 'supportTickets' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'}`} 
              >
                Support Tickets
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 pt-0 animate-fade-in">
              {(loading || loadingOrders || loadingProducts || loadingTickets) && (
                <div className="text-center p-8 flex flex-col items-center justify-center">
                    <FaSpinner className="text-4xl text-emerald-500 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
              )}
              {error && (
                <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg border-2 border-red-200">
                    <p className="font-semibold mb-2">Error!</p>
                    <p>{error}</p>
                </div>
              )}

              {!loading && !error && activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetricCard 
                      icon={FaDollarSign} 
                      title="Total Revenue" 
                      value={`₹${totalRevenue}`} 
                      colorClass="bg-emerald-500" 
                    />
                    <MetricCard 
                      icon={FaShoppingCart} 
                      title="Total Sales" 
                      value={totalSales} 
                      colorClass="bg-emerald-500" 
                    />
                    <MetricCard 
                      icon={FaHistory} 
                      title="Pending Orders" 
                      value={pendingOrders} 
                      colorClass="bg-red-500" 
                    />
                    <MetricCard 
                      icon={FaTicketAlt} 
                      title="Open Tickets" 
                      value={openTickets} 
                      colorClass="bg-yellow-500" 
                    />
                  </div>
                  {orders.length > 0 && <OrderPriceChart orders={orders} />}
                </div>
              )}

              {!loading && !error && activeTab === 'orders' && (
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <FaHistory className="mr-3 text-emerald-600" /> My Latest Orders
                  </h2>
                  {orders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {orders.map((order, index) => (
                        <div key={order._id || index} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between border border-gray-200 hover:shadow-xl transition-all duration-300">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-sm font-medium text-gray-500">Order ID: <span className="font-semibold text-gray-900">{order._id.substring(0, 8)}...</span></h3>
                              <p className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${getOrderStatusColor(order.status)}`}>
                                {order.status}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2 mb-4">
                              <FaUserCircle className="text-gray-500" />
                              <p className="text-sm font-medium text-gray-700">
                                Customer: <span className="font-semibold">{order.customerDetails?.name || 'N/A'}</span>
                              </p>
                            </div>
                            
                            <ul className="space-y-2">
                              {order.items.slice(0, 2).map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                    <img 
                                      src={item.imageUrl} 
                                      alt={item.name} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/E0E0E0/333333?text=${item.name.charAt(0)}`; }}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-900 line-clamp-1">{item.name}</p>
                                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-bold text-sm text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </li>
                              ))}
                            </ul>
                            {order.items.length > 2 && (
                              <p className="text-sm text-gray-500 mt-2">and {order.items.length - 2} more item(s)...</p>
                            )}
                          </div>
                          <button 
                            onClick={() => handleViewOrderDetails(order)} 
                            className="mt-4 flex items-center justify-center w-full px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors duration-200"
                          >
                            <FaEye className="mr-2" /> View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 font-semibold">No orders found.</p>
                      <p className="text-gray-400 text-sm mt-2">Start selling to see your orders here!</p>
                    </div>
                  )}
                </div>
              )}

{!loading && !error && activeTab === 'products' && (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
      <FaStore className="mr-3 text-emerald-600" /> My Products
    </h2>
    {products.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <div key={product._id || index} className="bg-white rounded-2xl shadow-lg p-5 flex flex-col justify-between border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            {/* Product Image */}
            <div className="w-full h-40 rounded-lg overflow-hidden mb-4">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x160/E0E0E0/333333?text=${product.name.charAt(0)}`; }}
              />
            </div>
            
            <div className="flex-1 space-y-3">
              {/* Product Name & Category */}
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{product.name}</h3>
              <div className="flex items-center text-sm font-medium text-gray-500">
                <FaFileAlt className="mr-2 text-emerald-500" />
                <span>Category: {product.category.name}</span>
              </div>
              
              {/* Price & Stock */}
              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center space-x-1">
                  <FaDollarSign className="text-gray-500" />
                  <p className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <FaCheckCircle className={`text-sm ${product.stock > 10 ? 'text-green-500' : 'text-orange-500'}`} />
                  <p className={`text-sm font-semibold ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                    {product.stock} in stock
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <FaInfoCircle className="mx-auto text-5xl text-gray-400 mb-4" />
        <p className="text-gray-500 font-semibold text-lg">No products found.</p>
        <p className="text-gray-400 text-sm mt-2">Add your first product to get started!</p>
      </div>
    )}
  </div>
)}

              {!loading && !error && activeTab === 'supportTickets' && (
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <FaTicketAlt className="mr-3 text-emerald-600" /> My Support Tickets
                  </h2>
                  {tickets.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {tickets.map(ticket => (
                        <div key={ticket._id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between border border-gray-200 hover:shadow-xl transition-all duration-300">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-md font-bold text-gray-900 line-clamp-1">{ticket.subject}</h3>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ticket.description}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <p>Ticket ID: <span className="font-semibold text-gray-900">{ticket.ticketId.substring(0, 8)}...</span></p>
                            <button 
                              onClick={() => handleViewTicketDetails(ticket)} 
                              className="flex items-center px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full hover:bg-emerald-600 transition-colors duration-200"
                            >
                              <FaEye className="mr-1" /> View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 font-semibold">No support tickets found.</p>
                      <p className="text-gray-400 text-sm mt-2">All good! No pending issues to report.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;