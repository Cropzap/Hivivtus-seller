// src/pages/SellerOrders.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Filter, CalendarDays, ChevronDown, ChevronUp, Download,
  DollarSign, MapPin, User, Tag, CheckCircle, AlertCircle, Search, X,
  ChevronLeft, ChevronRight // New icons for pagination
} from 'lucide-react';

// --- Dummy Data ---
// Function to generate a random date within a range
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate dummy orders
const generateDummyOrders = (count = 100) => { // Increased count for better pagination demo
  const orders = [];
  const productNames = ['Organic Basmati Rice', 'Toor Dal', 'Multiflora Honey', 'Organic Wheat Flour', 'Jaggery Powder', 'Fresh Vegetables Mix', 'Farm Fresh Eggs', 'A2 Cow Ghee', 'Whole Wheat Bread', 'Spices Combo Pack'];
  const units = ['kg', 'piece', 'jar', 'dozen', 'pack', 'liter'];
  const buyerNames = ['Priya Sharma', 'Rahul Kumar', 'Anjali Singh', 'Vikram Patel', 'Deepa Rao', 'Suresh Reddy', 'Meena Devi', 'Arjun Malhotra', 'Nisha Gupta', 'Rajeshwari Iyer', 'Gaurav Jain', 'Sneha Reddy'];
  const cities = ['Bengaluru', 'Chennai', 'Mumbai', 'Delhi', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Bhopal'];
  const states = ['Karnataka', 'Tamil Nadu', 'Maharashtra', 'Delhi', 'Telangana', 'West Bengal', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Madhya Pradesh'];
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  for (let i = 1; i <= count; i++) {
    const orderDate = getRandomDate(new Date(2024, 0, 1), new Date()); // Orders from Jan 1, 2024 to today
    const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items per order
    const items = [];
    let totalAmountForSeller = 0;

    for (let j = 0; j < numItems; j++) {
      const productName = productNames[Math.floor(Math.random() * productNames.length)];
      const unit = units[Math.floor(Math.random() * units.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const price = parseFloat((Math.random() * 500 + 50).toFixed(2)); // Price between 50 and 550
      items.push({
        productId: { imageUrl: `https://placehold.co/40x40/E0E0E0/333333?text=${productName.substring(0,2)}` },
        name: productName,
        quantity,
        unit,
        price,
      });
      totalAmountForSeller += price * quantity;
    }

    orders.push({
      _id: `ORDER${String(i).padStart(3, '0')}`,
      userId: { name: buyerNames[Math.floor(Math.random() * buyerNames.length)] },
      shippingAddress: {
        city: cities[Math.floor(Math.random() * cities.length)],
        state: states[Math.floor(Math.random() * states.length)],
      },
      items,
      totalAmountForSeller: parseFloat(totalAmountForSeller.toFixed(2)),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      orderDate: orderDate.toISOString(),
    });
  }
  return orders;
};

const ALL_DUMMY_ORDERS = generateDummyOrders();

// --- Helper Functions ---
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

const SellerOrders = () => {
  const [filteredOrders, setFilteredOrders] = useState([]); // Stores orders after date/custom filters
  const [ordersToDisplay, setOrdersToDisplay] = useState([]); // Stores orders for current page
  const [filterType, setFilterType] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomFilter, setShowCustomFilter] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 20; // Show 20 records per page

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  // Filter orders based on selected filter type or custom dates
  const applyFilter = useCallback(() => {
    let tempFiltered = [...ALL_DUMMY_ORDERS];

    if (filterType !== 'all') {
      let start, end;
      if (filterType === 'custom') {
        if (!customStartDate || !customEndDate) {
          showToast('Please select both start and end dates for custom filter.', 'error');
          setFilteredOrders([]); // Clear filtered orders if custom dates are invalid
          setCurrentPage(1);
          return;
        }
        start = new Date(customStartDate);
        end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999); // Set to end of the day
      } else {
        const range = getDateRange(filterType);
        start = range.startDate;
        end = range.endDate;
      }

      if (start && end) {
        tempFiltered = tempFiltered.filter(order => {
          const orderDate = new Date(order.orderDate);
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
  }, [filterType, customStartDate, customEndDate, showToast]);

  // Effect to apply filters when filterType or custom dates change
  useEffect(() => {
    applyFilter();
  }, [filterType, customStartDate, customEndDate, applyFilter]); // Added applyFilter to dependencies

  // Effect to update orders displayed on current page when filteredOrders or currentPage changes
  useEffect(() => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    setOrdersToDisplay(filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder));
  }, [filteredOrders, currentPage, ordersPerPage]);


  const handleFilterChange = (newFilterType) => {
    setFilterType(newFilterType);
    if (newFilterType !== 'custom') {
      setShowCustomFilter(false); // Hide custom filter if another filter is selected
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
    if (filteredOrders.length === 0) { // Use filteredOrders for download
      showToast('No orders to download.', 'error');
      return;
    }

    // Simulate CSV generation
    const headers = ["Order ID", "Buyer Name", "Buyer City", "Buyer State", "Items", "Total Amount (INR)", "Status", "Order Date"];
    const csvRows = filteredOrders.map(order => { // Use filteredOrders
      const itemsString = order.items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join('; ');
      return [
        `"${order._id}"`,
        `"${order.userId.name}"`,
        `"${order.shippingAddress.city}"`,
        `"${order.shippingAddress.state}"`,
        `"${itemsString}"`,
        `"${order.totalAmountForSeller.toFixed(2)}"`,
        `"${order.status}"`,
        `"${formatDate(order.orderDate)}"`
      ].join(',');
    });

    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `seller_orders_${filterType}_${new Date().toISOString().slice(0,10)}.csv`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-100 p-4 sm:p-6 lg:p-8 font-sans pt-20 pb-10">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 w-full max-w-screen-xl mx-auto border border-white/50">

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
          {/* Mobile: Horizontal scrollable filters */}
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

        {/* Orders Table */}
        {ordersToDisplay.length === 0 && filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <p className="text-xl font-semibold mb-3">No orders found for the selected criteria.</p>
            <p>Try adjusting your filters or check back later!</p>
          </div>
        ) : (
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
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-xl">
                    Order Date
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
                            className="w-8 h-8 rounded-md object-cover mr-2 flex-shrink-0 border border-gray-200"
                          />
                          <span className="text-xs font-medium truncate">
                            <Tag size={12} className="inline mr-1 text-lime-600" />
                            {item.name} ({item.quantity} {item.unit})
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-bold">
                      <DollarSign size={16} className="inline mr-1 text-green-700" />
                      {formatCurrency(order.totalAmountForSeller)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
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

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${toastType === 'success' ? 'bg-green-500' : toastType === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg text-sm sm:text-base z-50 flex items-center space-x-2`}
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {toastType === 'success' ? <CheckCircle size={18} /> : toastType === 'error' ? <X size={18} /> : <AlertCircle size={18} />}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SellerOrders;