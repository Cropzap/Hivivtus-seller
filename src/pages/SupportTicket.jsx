import React, { useState, useEffect, useCallback } from 'react';
import { FaTicketAlt, FaTag, FaClipboardList, FaFileAlt, FaPaperclip, FaCheckCircle, FaExclamationCircle, FaTimes, FaHashtag, FaHourglassHalf, FaEye, FaCalendarAlt, FaBoxOpen, FaCommentDots, FaTrashAlt, FaChevronLeft, FaChevronRight, FaReply, FaUserTie, FaUser, FaSpinner } from 'react-icons/fa'; // Added FaSpinner, FaUserTie, FaUser (for buyer in replies)
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;
// --- Helper to get status badge styling ---
const getStatusBadge = (status) => {
  let colorClass = '';
  let icon = null;
  switch (status) {
    case 'Open':
      colorClass = 'bg-blue-100 text-blue-700';
      icon = <FaHourglassHalf className="inline mr-1" />;
      break;
    case 'In Progress':
      colorClass = 'bg-yellow-100 text-yellow-700';
      icon = <FaHourglassHalf className="inline mr-1" />;
      break;
    case 'Resolved':
      colorClass = 'bg-emerald-100 text-emerald-700';
      icon = <FaCheckCircle className="inline mr-1" />;
      break;
    case 'Closed':
      colorClass = 'bg-gray-200 text-gray-700';
      icon = <FaTimes className="inline mr-1" />;
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-700';
      icon = <FaCommentDots className="inline mr-1" />;
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {icon} {status}
    </span>
  );
};

// --- CreateTicketForm Component ---
const CreateTicketForm = ({ categories, onSubmit, isSubmitting, submitSuccess, errors }) => {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    orderId: '',
    description: '',
    attachment: null,
  });

  // Reset form when submitSuccess changes to true (after successful submission)
  useEffect(() => {
    if (submitSuccess) {
      setFormData({
        subject: '',
        category: '',
        orderId: '',
        description: '',
        attachment: null,
      });
    }
  }, [submitSuccess]);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment') {
      setFormData(prev => ({ ...prev, attachment: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitInternal = (e) => {
    e.preventDefault();
    onSubmit(formData); // Pass current form data to parent handler
  };

  return (
    <form onSubmit={handleSubmitInternal} className="space-y-4">
      {/* Subject Field */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/70 shadow-lg">
        <label htmlFor="subject" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 flex items-center">
          <FaTag className="mr-1.5 text-gray-500 text-sm" /> Subject / Topic
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="e.g., Issue with recent order"
          className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base
                      ${errors.subject ? 'border-red-500' : 'border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'}
                      bg-white shadow-sm focus:shadow-md`}
        />
        {errors.subject && <p className="text-red-500 text-xs mt-0.5">{errors.subject}</p>}
      </div>

      {/* Category Field */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/70 shadow-lg">
        <label htmlFor="category" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 flex items-center">
          <FaClipboardList className="mr-1.5 text-gray-500 text-sm" /> Category
        </label>
        <div className="relative">
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base
                        ${errors.category ? 'border-red-500' : 'border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'}
                        bg-white shadow-sm focus:shadow-md appearance-none pr-8`}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value} disabled={cat.value === ''}>
                {cat.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <FaTimes className="text-xs rotate-45" />
          </div>
        </div>
        {errors.category && <p className="text-red-500 text-xs mt-0.5">{errors.category}</p>}
      </div>

      {/* Order ID Field (Conditional) */}
      {(formData.category === 'Order Issue' || formData.category === 'Delivery Issue' || formData.category === 'Payment Issue') && (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/70 shadow-lg"
        >
          <label htmlFor="orderId" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 flex items-center">
            <FaHashtag className="mr-1.5 text-gray-500 text-sm" /> Order ID (Optional)
          </label>
          <input
            type="text"
            id="orderId"
            name="orderId"
            value={formData.orderId}
            onChange={handleChange}
            placeholder="e.g., ORD123456"
            className="w-full p-2 rounded-lg border-2 border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                       bg-white shadow-sm focus:shadow-md text-sm sm:text-base"
          />
        </motion.div>
      )}

      {/* Description Field */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/70 shadow-lg">
        <label htmlFor="description" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 flex items-center">
          <FaFileAlt className="mr-1.5 text-gray-500 text-sm" /> Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          placeholder="Please describe your query in detail..."
          className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-sm sm:text-base
                      ${errors.description ? 'border-red-500' : 'border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'}
                      bg-white shadow-sm focus:shadow-md resize-y`}
        ></textarea>
        {errors.description && <p className="text-red-500 text-xs mt-0.5">{errors.description}</p>}
      </div>

      {/* Attachment Field */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/70 shadow-lg">
        <label htmlFor="attachment" className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 flex items-center">
          <FaPaperclip className="mr-1.5 text-gray-500 text-sm" /> Attach File (Optional)
        </label>
        <input
          type="file"
          id="attachment"
          name="attachment"
          onChange={handleChange}
          className="w-full text-xs sm:text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3
                     file:rounded-full file:border-0 file:text-xs file:font-semibold
                     file:bg-emerald-50 file:text-emerald-700
                     hover:file:bg-emerald-100 cursor-pointer"
        />
        {formData.attachment && (
          <p className="text-gray-600 text-xs mt-1">Attached: {formData.attachment.name}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex items-center justify-center px-4 py-2.5 rounded-full text-base font-bold
                    transition-all duration-300 shadow-lg
                    ${isSubmitting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98'}`}
      >
        {isSubmitting ? (
          <>
            <FaSpinner className="animate-spin mr-2" /> Submitting...
          </>
        ) : (
          <>
            <FaTicketAlt className="mr-2" /> Submit Ticket
          </>
        )}
      </button>
    </form>
  );
};

// --- ViewTicketsList Component ---
const ViewTicketsList = ({ tickets, onDeleteTicket, onSelectTicket, currentPage, setCurrentPage, ticketsPerPage, loading }) => {
  const totalPages = Math.ceil(tickets.length / ticketsPerPage);
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <FaSpinner className="animate-spin text-emerald-600 text-3xl" />
        <p className="ml-3 text-gray-600">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {currentTickets.length > 0 ? (
        <AnimatePresence>
          {currentTickets.map(ticket => (
            <motion.div
              key={ticket._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-2 border border-gray-100 transition-all duration-200 hover:shadow-xl hover:scale-[1.01]"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-md sm:text-lg font-bold text-gray-900 flex items-center">
                  <FaTicketAlt className="mr-2 text-emerald-600 text-lg" /> {ticket.ticketId}
                </h3>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(ticket.status)}
                  <button
                    onClick={() => onDeleteTicket(ticket.ticketId)}
                    className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors active:scale-95"
                    aria-label={`Delete ticket ${ticket.ticketId}`}
                  >
                    <FaTrashAlt className="text-sm" />
                  </button>
                </div>
              </div>
              <p className="text-gray-800 font-semibold text-sm sm:text-base mb-1 line-clamp-1">{ticket.subject}</p>
              <p className="text-gray-600 text-xs mb-2">Category: {ticket.category}</p>
              <div className="flex justify-between items-center text-gray-500 text-xs">
                <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                <span>Last Update: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => onSelectTicket(ticket.ticketId)}
                className="mt-3 w-full bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
              >
                <FaEye className="inline mr-2" /> View Details
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-600 text-sm">
          <p>You haven't created any support tickets yet.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {tickets.length > ticketsPerPage && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-full bg-emerald-600 text-white transition-all duration-200
                        ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700 active:scale-95'}`}
            aria-label="Previous page"
          >
            <FaChevronLeft className="text-lg" />
          </button>
          <span className="text-gray-700 text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={indexOfLastTicket >= tickets.length}
            className={`p-2 rounded-full bg-emerald-600 text-white transition-all duration-200
                        ${indexOfLastTicket >= tickets.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700 active:scale-95'}`}
            aria-label="Next page"
          >
            <FaChevronRight className="text-lg" />
          </button>
        </div>
      )}
    </div>
  );
};

// --- TicketDetailView Component ---
const TicketDetailView = ({ ticket, onClose, onReply, isReplying, currentUserId }) => { // Added currentUserId prop
  const [replyMessage, setReplyMessage] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyMessage.trim()) {
      onReply(ticket.ticketId, replyMessage);
      setReplyMessage('');
    }
  };

  if (!ticket) {
    return null;
  }

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl p-4 sm:p-8 md:p-10 z-30 overflow-y-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-4 left-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label="Close ticket details"
      >
        <FaChevronLeft className="text-gray-600 text-lg" />
      </button>

      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-4 text-center">Ticket Details: {ticket.ticketId}</h2>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
        <div className="flex flex-wrap justify-between items-center mb-3">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{ticket.subject}</h3>
          {getStatusBadge(ticket.status)}
        </div>
        <p className="text-gray-600 text-sm sm:text-base mb-2"><span className="font-medium">Category:</span> {ticket.category}</p>
        {ticket.orderId && (
          <p className="text-gray-600 text-sm sm:text-base mb-2"><span className="font-medium">Order ID:</span> {ticket.orderId}</p>
        )}
        <p className="text-gray-600 text-sm sm:text-base mb-2"><span className="font-medium">Created:</span> {new Date(ticket.createdAt).toLocaleString()}</p>
        <p className="text-gray-600 text-sm sm:text-base mb-2"><span className="font-medium">Last Update:</span> {new Date(ticket.updatedAt).toLocaleString()}</p>

        {ticket.assignedToName && (
            <p className="text-emerald-700 text-sm sm:text-base flex items-center mb-2">
                <FaUserTie className="mr-2" /> <span className="font-medium">Assigned To:</span> {ticket.assignedToName}
            </p>
        )}

        <div className="border-t border-gray-200 pt-3 mt-3">
          <h4 className="font-semibold text-gray-700 mb-1">Description:</h4>
          <p className="text-gray-700 text-sm sm:text-base">{ticket.description}</p>
        </div>

        {ticket.attachment && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-700 mb-1">Attachment:</h4>
            <a
              href={`http://localhost:5000${ticket.attachment}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center text-sm"
            >
              <FaPaperclip className="mr-2" /> View Attachment
            </a>
          </div>
        )}
      </div>

      {/* Replies Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 flex items-center">
          <FaCommentDots className="mr-2 text-emerald-600" /> Conversation
        </h3>
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {ticket.replies && ticket.replies.length > 0 ? (
            ticket.replies.map((reply, index) => (
              // Determine if the reply is from the current buyer
              <div key={index} className={`p-3 rounded-lg ${reply.userId === currentUserId ? 'bg-blue-50 ml-auto text-right' : 'bg-gray-50 mr-auto text-left'}`}>
                <p className={`font-semibold text-sm ${reply.userId === currentUserId ? 'text-blue-700' : 'text-gray-800'}`}>
                  {reply.userId === currentUserId ? (
                      <FaUser className="inline mr-1" /> // Buyer icon for their own replies
                  ) : (
                      <FaUserTie className="inline mr-1" /> // Staff/Admin icon for others' replies
                  )}
                  {reply.userId === currentUserId ? 'You' : reply.userName}
                </p>
                <p className="text-gray-700 text-sm mt-1">{reply.message}</p>
                <p className="text-gray-500 text-xs mt-1">{new Date(reply.timestamp).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-sm text-center">No replies yet.</p>
          )}
        </div>
      </div>

      {/* Reply Input */}
      {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
        <form onSubmit={handleReplySubmit} className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 flex items-center">
            <FaReply className="mr-2 text-emerald-600" /> Add a Reply
          </h3>
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            rows="3"
            placeholder="Type your reply here..."
            className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                       bg-white shadow-sm resize-y text-sm sm:text-base"
          ></textarea>
          <button
            type="submit"
            disabled={isReplying || !replyMessage.trim()}
            className={`mt-3 w-full flex items-center justify-center px-4 py-2.5 rounded-full text-base font-bold
                        transition-all duration-300 shadow-lg
                        ${isReplying || !replyMessage.trim() ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98'}`}
          >
            {isReplying ? <><FaSpinner className="animate-spin mr-2" /> Sending...</> : <><FaReply className="mr-2" /> Send Reply</>}
          </button>
        </form>
      )}
    </motion.div>
  );
};


// --- Main SupportTicket Component ---
const SupportTicket = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);
  const [loadingTicketDetails, setLoadingTicketDetails] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); // State to store the current authenticated user's ID

  // Get Auth Token - In a real app, this might come from a context/global state
  const getAuthToken = () => localStorage.getItem('token');

  // A dummy function to get current user ID from token
  // In a real app, you'd decode JWT or have this from your auth context
  const getUserIdFromToken = () => {
    const token = getAuthToken();
    if (token) {
        try {
            // This is a VERY simplified way. In production, you'd use a JWT library on the client
            // to decode the token properly. For now, we just assume a fixed dummy ID for testing.
            // Replace with actual JWT decoding logic if your token contains user ID.
            // Example: const decoded = jwt_decode(token); return decoded.user.id;
            console.warn("Using dummy user ID for frontend reply differentiation. Implement real JWT decode for production.");
            // For testing: assume a user ID if a token exists
            return "60c72b1f9b1e8b0015f8a2a0"; // Replace with a real user ID from your DB for testing
        } catch (e) {
            console.error("Failed to decode token:", e);
            return null;
        }
    }
    return null;
  };

  useEffect(() => {
    setCurrentUserId(getUserIdFromToken());
  }, []); // Run once on component mount

  const categories = [
    { value: '', label: 'Select a category' },
    { value: 'Order Issue', label: 'Order Issue' },
    { value: 'Product Query', label: 'Product Query' },
    { value: 'Delivery Issue', label: 'Delivery Issue' },
    { value: 'Payment Issue', label: 'Payment Issue' },
    { value: 'Technical Support', label: 'Technical Support' },
    { value: 'Feedback', label: 'Feedback' },
    { value: 'Other', label: 'Other' },
  ];

  const validateForm = (formData) => {
    let newErrors = {};
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required.';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.error("No auth token found. Please log in.");
        setLoadingTickets(false);
        return;
      }
      const response = await fetch(`${API_URL}sellersupport-tickets`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  const fetchTicketDetails = useCallback(async (ticketId) => {
    setLoadingTicketDetails(true);
    try {
      const token = getAuthToken();
      if (!token) {
        console.error("No auth token found. Please log in.");
        setLoadingTicketDetails(false);
        return;
      }
      const response = await fetch(`${API_URL}sellersupport-tickets/${ticketId}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedTicketDetails(data);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      setSelectedTicketDetails(null);
    } finally {
      setLoadingTicketDetails(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'view' && !selectedTicketId) {
      fetchTickets();
    }
  }, [activeTab, fetchTickets, selectedTicketId]);

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketDetails(selectedTicketId);
    }
  }, [selectedTicketId, fetchTicketDetails]);


  const handleSubmitTicket = async (formDataToSubmit) => {
    if (!validateForm(formDataToSubmit)) {
      return;
    }

    setSubmittingTicket(true);
    setErrors({});
    setSubmitSuccess(false);

    const formData = new FormData();
    formData.append('subject', formDataToSubmit.subject);
    formData.append('category', formDataToSubmit.category);
    formData.append('description', formDataToSubmit.description);
    if (formDataToSubmit.orderId) {
      formData.append('orderId', formDataToSubmit.orderId);
    }
    if (formDataToSubmit.attachment) {
      formData.append('attachment', formDataToSubmit.attachment);
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      const response = await fetch(`${API_URL}sellersupport-tickets`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
      }

      setSubmitSuccess(true);
      setActiveTab('view');
      setCurrentPage(1);
      fetchTickets();
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setErrors({ form: error.message });
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm(`Are you sure you want to delete ticket ${ticketId}?`)) {
      return;
    }
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      const response = await fetch(`${API_URL}sellersupport-tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
      }

      console.log(`Ticket ${ticketId} deleted successfully.`);
      fetchTickets();
      if (currentPage > Math.ceil((tickets.length - 1) / ticketsPerPage) && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

const handleReplyToTicket = async (mongoId, message) => {
  setIsReplying(true);
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    // Use the mongoId in the fetch URL
    const response = await fetch(`${API_URL}sellersupport-tickets/${mongoId}/reply`, {
      method: 'POST',
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
    }

    const updatedTicket = await response.json();
    setSelectedTicketDetails(prev => ({
      ...prev,
      replies: updatedTicket.replies, // The backend returns the whole updated ticket object, not just replies
      updatedAt: updatedTicket.updatedAt
    }));
    fetchTickets();
    console.log('Reply added successfully!');
  } catch (error) {
    console.error('Error adding reply:', error);
  } finally {
    setIsReplying(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center sm:p-2 font-sans">
      <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-2 sm:p-8 md:p-10 w-full max-w-2xl border border-white/50">

        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold z-20 flex items-center"
            >
              <FaCheckCircle className="mr-2" /> Ticket Submitted Successfully!
            </motion.div>
          )}
          {errors.form && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold z-20 flex items-center"
            >
              <FaExclamationCircle className="mr-2" /> {errors.form}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-6 mt-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <FaTicketAlt className="mr-3 text-emerald-600" /> Support
          </h1>
        </div>

        <div className="mb-6 bg-white/60 backdrop-blur-sm rounded-xl p-1 flex border border-white/70 shadow-inner">
          <button
            onClick={() => { setActiveTab('create'); setErrors({}); setSelectedTicketId(null); setSelectedTicketDetails(null); }}
            className={`flex-1 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300
                        ${activeTab === 'create' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-700 hover:bg-white/70'}`}
          >
            Create Ticket
          </button>
          <button
            onClick={() => { setActiveTab('view'); setErrors({}); setSelectedTicketId(null); setSelectedTicketDetails(null); }}
            className={`flex-1 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300
                        ${activeTab === 'view' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-700 hover:bg-white/70'}`}
          >
            View Tickets
          </button>
        </div>

        <div className="p-4 pt-0 rounded-2xl min-h-screen bg-white/60 backdrop-blur-sm border border-white/70 shadow-lg animate-fade-in">
          {activeTab === 'create' && (
            <CreateTicketForm
              categories={categories}
              onSubmit={handleSubmitTicket}
              isSubmitting={submittingTicket}
              submitSuccess={submitSuccess}
              errors={errors}
            />
          )}

          {activeTab === 'view' && !selectedTicketId && (
            <ViewTicketsList
              tickets={tickets}
              onDeleteTicket={handleDeleteTicket}
              onSelectTicket={setSelectedTicketId}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              ticketsPerPage={ticketsPerPage}
              loading={loadingTickets}
            />
          )}

          <AnimatePresence>
            {activeTab === 'view' && selectedTicketId && selectedTicketDetails && (
              <TicketDetailView
                ticket={selectedTicketDetails}
                onClose={() => setSelectedTicketId(null)}
                onReply={handleReplyToTicket}
                isReplying={isReplying}
                currentUserId={currentUserId} // Pass current user ID for reply differentiation
              />
            )}
          </AnimatePresence>

          {activeTab === 'view' && selectedTicketId && loadingTicketDetails && !selectedTicketDetails && (
             <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-[2rem] z-40">
                <FaSpinner className="animate-spin text-emerald-600 text-4xl" />
                <p className="ml-4 text-gray-700">Loading ticket details...</p>
             </div>
          )}
           {activeTab === 'view' && selectedTicketId && !loadingTicketDetails && !selectedTicketDetails && (
             <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-[2rem] z-40 p-4 text-center">
                <p className="text-red-600 text-lg">Failed to load ticket details or ticket not found.</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SupportTicket;