import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Filter, CalendarDays, ChevronDown, ChevronUp, Download,
  DollarSign, MapPin, User, Tag, CheckCircle, AlertCircle, Search, X,
  ChevronLeft, ChevronRight, Loader, Eye, Package, Phone, Mail
} from 'lucide-react';

// --- Helper Functions ---
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
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// Function to get start and end dates for filters
const getDateRange = (filterType) => {
  const now = new Date();
  let startDate, endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999); // End of today

  switch (filterType) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'lastWeek':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'lastMonth':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'lastYear':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default: // custom or no filter
      startDate = null;
      endDate = null;
  }
  return { startDate, endDate };
};

// Status mapping for colors and icons
const statusMap = {
  'Processing': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  'Shipped': { color: 'bg-blue-100 text-blue-800', icon: Package },
  'Delivered': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  'Cancelled': { color: 'bg-red-100 text-red-800', icon: X },
};

const SellerOrders = () => {
  // State for all orders fetched from the backend
  const [allOrders, setAllOrders] = useState([]);
  // State for orders after date/custom filters
  const [filteredOrders, setFilteredOrders] = useState([]);
  // State for orders to display on the current page
  const [ordersToDisplay, setOrdersToDisplay] = useState([]);

  // UI state
  const [filterType, setFilterType] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomFilter, setShowCustomFilter] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // API call state
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 20; // Show 20 records per page

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  // Function to fetch orders from the backend
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Authentication error: No token found in localStorage.');
      setError('Please log in to view your orders.');
      setIsLoading(false);
      showToast('Authentication error: Please log in.', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders/seller', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        let errorMessage = 'Failed to fetch seller orders.';
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          console.error("Raw error response:", errorText);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setAllOrders(data);
      setFilteredOrders(data);
      setIsLoading(false);
      showToast(`Successfully loaded ${data.length} orders.`, 'success');

    } catch (err) {
      console.error('API call failed:', err);
      setError(err.message);
      setIsLoading(false);
      showToast(err.message, 'error');
    }
  }, [showToast]);


  // Initial fetch on component mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);


  // Filter orders based on selected filter type or custom dates
  const applyFilter = useCallback(() => {
    let tempFiltered = [...allOrders];

    if (filterType !== 'all') {
      let start, end;
      if (filterType === 'custom') {
        if (!customStartDate || !customEndDate) {
          showToast('Please select both start and end dates for custom filter.', 'error');
          setFilteredOrders([]);
          setCurrentPage(1);
          return;
        }
        start = new Date(customStartDate);
        end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
      } else {
        const range = getDateRange(filterType);
        start = range.startDate;
        end = range.endDate;
      }

      if (start && end) {
        tempFiltered = tempFiltered.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= start && orderDate <= end;
        });
      }
    }

    setFilteredOrders(tempFiltered);
    setCurrentPage(1); // Reset to first page on filter change

    if (tempFiltered.length === 0) {
      showToast('No orders found for the selected filter.', 'info');
    } else {
      showToast(`Filtered orders: ${tempFiltered.length} found.`, 'success');
    }
  }, [filterType, customStartDate, customEndDate, allOrders, showToast]);

  // Effect to apply filters when filterType or custom dates change
  useEffect(() => {
    applyFilter();
  }, [filterType, customStartDate, customEndDate, applyFilter]);

  // Effect to update orders displayed on current page
  useEffect(() => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    setOrdersToDisplay(filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder));
  }, [filteredOrders, currentPage, ordersPerPage]);


  const handleFilterChange = (newFilterType) => {
    setFilterType(newFilterType);
    if (newFilterType !== 'custom') {
      setShowCustomFilter(false);
      setCustomStartDate('');
      setCustomEndDate('');
    } else {
      setShowCustomFilter(true);
    }
  };

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setCustomStartDate(value);
    } else {
      setCustomEndDate(value);
    }
  };

  const handleDownload = () => {
    if (filteredOrders.length === 0) {
      showToast('No orders to download.', 'error');
      return;
    }

    const headers = ["Order ID", "Buyer Name", "Buyer City", "Buyer State", "Items", "Total Amount (INR)", "Status", "Order Date"];
    const csvRows = filteredOrders.map(order => {
      const itemsString = order.items.map(item => `${item.name} (${item.quantity} ${item.unit || ''})`).join('; ');
      return [
        `"${order._id}"`,
        `"${order.user?.name}"`,
        `"${order.shippingAddress?.city}"`,
        `"${order.shippingAddress?.state}"`,
        `"${itemsString}"`,
        `"${order.totalAmount?.toFixed(2)}"`,
        `"${order.status}"`,
        `"${formatDate(order.createdAt)}"`
      ].join(',');
    });

    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `seller_orders_${filterType}_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Orders downloaded successfully!', 'success');
    } else {
      showToast('Your browser does not support downloading files directly.', 'error');
    }
  };

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // --- New functions for modal and status update ---
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status); // Set the initial status for the select box
    setShowDetailsModal(true);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsUpdatingStatus(true);
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Authentication error: Please log in.', 'error');
      setIsUpdatingStatus(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/seller/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status.');
      }

      showToast(`Order status updated to '${newStatus}'!`, 'success');
      
      // Optimistically update the order list without a full re-fetch
      setAllOrders(prevOrders => prevOrders.map(order =>
        order._id === selectedOrder._id ? { ...order, status: newStatus } : order
      ));
      
      // Reset and close modal
      setSelectedOrder(null);
      setShowDetailsModal(false);

    } catch (err) {
      console.error('Status update failed:', err);
      showToast(err.message, 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 25 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const toastVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  const filterButtonClass = (type) => `
    flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out
    ${filterType === type
      ? 'bg-lime-600 text-white shadow-md'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'
    }
  `;

  const getStatusColor = (status) => statusMap[status]?.color || 'bg-gray-100 text-gray-800';
  const StatusIcon = ({ status }) => {
    const Icon = statusMap[status]?.icon || Tag;
    return <Icon size={16} className="inline mr-1" />;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Loader size={48} className="animate-spin text-lime-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 text-red-500">
          <p className="text-xl font-semibold mb-3">Error fetching orders: {error}</p>
          <p>Please try again later.</p>
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-10 text-gray-600">
          <p className="text-xl font-semibold mb-3">No orders found for the selected criteria.</p>
          <p>Try adjusting your filters or check back later!</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-xl">
                Order ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Buyer
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Items
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Total Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Order Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-xl">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {ordersToDisplay.map((order, index) => (
              <motion.tr
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-lime-50 transition-colors duration-200"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-[120px]">
                  {order._id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex items-center">
                    <User size={16} className="mr-1 text-gray-500" />
                    <span className="font-semibold">{order.user?.name || 'N/A'}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center mt-0.5">
                    <MapPin size={12} className="mr-1" />
                    {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.postalCode || 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start mb-1 last:mb-0">
                      <img
                        src={item.imageUrl || 'https://placehold.co/30x30/E0E0E0/333333?text=P'}
                        alt={item.name}
                        className="w-8 h-8 rounded-md object-cover mr-2 flex-shrink-0 border border-gray-200"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/30x30/E0E0E0/333333?text=P" }}
                      />
                      <span className="text-xs font-medium truncate">
                        <Tag size={12} className="inline mr-1 text-lime-600" />
                        {item.name} ({item.quantity} {item.unit || 'unit'})
                      </span>
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-bold">
                  <DollarSign size={16} className="inline mr-1 text-green-700" />
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(order.status)}`}>
                    <StatusIcon status={order.status} /> {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <motion.button
                    onClick={() => handleViewDetails(order)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-lime-500 text-white shadow-md hover:bg-lime-600 transition-colors"
                  >
                    <Eye size={16} />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-100 p-4 sm:p-6 lg:p-8 font-sans pt-20 mt-16 pb-10">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 w-full max-w-screen mx-auto border border-white/50">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-green-800 flex items-center text-center sm:text-left">
            <ShoppingCart className="mr-3 text-lime-600" size={36} /> My Orders
          </h1>
          <motion.button
            onClick={handleDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-md
                          transition-all duration-200 hover:bg-blue-700 hover:shadow-lg text-sm sm:text-base"
          >
            <Download className="mr-2" size={20} /> Download Orders
          </motion.button>
        </div>

        {/* Filter Section */}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Filter className="mr-2 text-lime-600" size={20} /> Filter Orders
          </h3>
          <div className="flex flex-nowrap overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap gap-3 justify-center sm:justify-start scrollbar-hide">
            <motion.button
              onClick={() => handleFilterChange('all')}
              className={filterButtonClass('all')}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              All Orders
            </motion.button>
            <motion.button
              onClick={() => handleFilterChange('today')}
              className={filterButtonClass('today')}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              Today
            </motion.button>
            <motion.button
              onClick={() => handleFilterChange('lastWeek')}
              className={filterButtonClass('lastWeek')}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              Last 7 Days
            </motion.button>
            <motion.button
              onClick={() => handleFilterChange('lastMonth')}
              className={filterButtonClass('lastMonth')}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              Last 30 Days
            </motion.button>
            <motion.button
              onClick={() => handleFilterChange('lastYear')}
              className={filterButtonClass('lastYear')}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              Last Year
            </motion.button>
            <motion.button
              onClick={() => handleFilterChange('custom')}
              className={filterButtonClass('custom')}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              Custom Range {showCustomFilter ? <ChevronUp size={16} className="inline ml-1" /> : <ChevronDown size={16} className="inline ml-1" />}
            </motion.button>
          </div>

          <AnimatePresence>
            {showCustomFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-4 items-center"
              >
                <div className="w-full sm:w-1/2">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={customStartDate}
                    onChange={handleCustomDateChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-lime-500 focus:border-lime-500"
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={customEndDate}
                    onChange={handleCustomDateChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-lime-500 focus:border-lime-500"
                  />
                </div>
                <motion.button
                  onClick={applyFilter}
                  className="w-full sm:w-auto mt-2 sm:mt-0 bg-lime-600 text-white px-5 py-2.5 rounded-md shadow-md
                              transition-all duration-200 hover:bg-lime-700 hover:shadow-lg text-sm font-semibold"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                >
                  <Search size={18} className="inline mr-2" /> Apply
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Orders Table or Status Message */}
        {renderContent()}

        {/* Pagination Controls */}
        {filteredOrders.length > ordersPerPage && (
          <div className="flex justify-center items-center mt-8 space-x-4">
            <motion.button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 rounded-full bg-lime-600 text-white font-semibold shadow-md
                                     transition-all duration-200 hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} className="mr-1" /> Previous
            </motion.button>
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              Page {currentPage} of {totalPages}
            </span>
            <motion.button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 rounded-full bg-lime-600 text-white font-semibold shadow-md
                                     transition-all duration-200 hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={20} className="ml-1" />
            </motion.button>
          </div>
        )}
      </div>

      {/* --- Order Details Modal --- */}
      <AnimatePresence>
        {showDetailsModal && selectedOrder && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-gray-100 relative
              bg-[url('data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'patt\' patternUnits=\'userSpaceOnUse\' width=\'20\' height=\'20\'%3E%3Cpath d=\'M5 0h10v20H5V0zM0 5v10h20V5H0z\' fill=\'%23f3f4f6\'%3E%3C/path%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23patt)\'%3E%3C/rect%3E%3C/svg%3E')]"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
              
              <h2 className="text-3xl font-extrabold text-green-800 mb-6 flex items-center gap-3">
                <Package size={30} className="text-lime-600" /> Order #{selectedOrder._id.slice(0, 8)}...
              </h2>
              
              {/* Main content grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left side: Product and Shipment Status Details */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Product Details Box */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 relative">
                    <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <ShoppingCart size={14} /> Ordered Items
                    </div>
                    <div className="flex flex-col space-y-4 pt-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl transition-shadow duration-200 hover:shadow-md border border-gray-100">
                          <img
                            src={item.imageUrl || 'https://placehold.co/80x80/E0E0E0/333333?text=Product'}
                            alt={item.name}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0 shadow-sm"
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/E0E0E0/333333?text=Product" }}
                          />
                          <div className="flex flex-col justify-center flex-grow">
                            <h4 className="text-base font-semibold text-gray-900 leading-tight">{item.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Quantity: <span className="font-medium text-gray-800">{item.quantity}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Price: <span className="font-medium text-gray-800">{formatCurrency(item.price)}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status & Update Box */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 relative">
                    <div className="absolute -top-3 left-4 bg-lime-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Package size={14} /> Shipment Status
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex-grow text-center sm:text-left">
                        <p className="text-sm font-medium text-gray-500">Current Status:</p>
                        <span className={`text-xl font-bold rounded-full px-4 py-1.5 capitalize mt-1 inline-flex items-center gap-2 ${getStatusColor(selectedOrder.status)}`}>
                          <StatusIcon status={selectedOrder.status} /> {selectedOrder.status}
                        </span>
                      </div>
                      <div className="w-full sm:w-auto">
                        <label htmlFor="orderStatus" className="block text-sm font-semibold text-gray-800 mb-2">Update Status:</label>
                        <div className="flex items-center gap-2">
                          <select
                            id="orderStatus"
                            value={newStatus}
                            onChange={handleStatusChange}
                            className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-lime-500 focus:border-lime-500 appearance-none bg-white pr-8"
                            disabled={isUpdatingStatus || selectedOrder.status === 'Delivered' || selectedOrder.status === 'Cancelled'}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <motion.button
                            onClick={updateOrderStatus}
                            disabled={isUpdatingStatus || newStatus === selectedOrder.status || selectedOrder.status === 'Delivered' || selectedOrder.status === 'Cancelled'}
                            className={`w-1/3 py-2 px-4 rounded-md text-white font-semibold transition-all duration-200
                                       ${isUpdatingStatus || newStatus === selectedOrder.status || selectedOrder.status === 'Delivered' || selectedOrder.status === 'Cancelled'
                                         ? 'bg-gray-400 cursor-not-allowed'
                                         : 'bg-green-600 hover:bg-green-700 active:scale-98'}`}
                            whileHover={{ scale: (isUpdatingStatus || newStatus === selectedOrder.status) ? 1 : 1.05 }}
                            whileTap={{ scale: (isUpdatingStatus || newStatus === selectedOrder.status) ? 1 : 0.95 }}
                          >
                            {isUpdatingStatus ? <Loader size={20} className="animate-spin text-white" /> : 'Update'}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div> {/* End of left side */}

                {/* Right side: Customer and Address Details */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Buyer Information Box */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 relative">
                    <div className="absolute -top-3 left-4 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <User size={14} /> Buyer Information
                    </div>
                    <div className="pt-4 space-y-3 text-sm text-gray-700">
                      <div className="flex items-center">
                        <User size={16} className="text-gray-500 mr-2 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">Name:</p>
                          <p>{selectedOrder.user?.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Mail size={16} className="text-gray-500 mr-2 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">Email:</p>
                          <p>{selectedOrder.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone size={16} className="text-gray-500 mr-2 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800">Phone:</p>
                          <p>{selectedOrder.user?.mobile || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Box */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200 relative">
                    <div className="absolute -top-3 left-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <MapPin size={14} /> Shipping Address
                    </div>
                    <div className="pt-4 space-y-3 text-sm text-gray-700">
                      {/* Added labels for each address field */}
                      <div>
                        <p className="font-semibold text-gray-800">Address Line 1:</p>
                        <p>{selectedOrder.shippingAddress?.address1 || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Address Line 2:</p>
                        <p>{selectedOrder.shippingAddress?.address2 || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">City:</p>
                        <p>{selectedOrder.shippingAddress?.city || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Pincode:</p>
                        <p>{selectedOrder.shippingAddress?.postalCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                </div> {/* End of right side */}

              </div> {/* End of main content grid */}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Toast Message --- */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-lg text-white font-medium z-[60]
                       ${toastType === 'success' ? 'bg-green-600' : toastType === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SellerOrders;
