// src/pages/SellerLogin.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Lock, Loader, Check, X,
} from 'lucide-react';

// The handleSellerLogin prop has been removed as the component will now handle token storage itself.
const SellerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'
  const [validationErrors, setValidationErrors] = useState({}); // For input-specific errors
  const API_URL = import.meta.env.VITE_API_URL;

  const showToastMessage = useCallback((message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  // Validation function
  const validateField = useCallback((name, value) => {
    let error = '';
    switch (name) {
      case 'email':
        if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Invalid email format.';
        }
        break;
      case 'password':
        if (value.length === 0) {
          error = 'Password is required.';
        }
        break;
      default:
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value); // Validate on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowToast(false); // Hide previous toast
    setValidationErrors({}); // Clear previous validation errors

    // --- Client-Side Validation ---
    let isValid = true;
    if (!validateField('email', formData.email)) isValid = false;
    if (!validateField('password', formData.password)) isValid = false;

    if (!isValid) {
      showToastMessage('Please correct the validation errors.', 'error');
      setLoading(false);
      return;
    }
    // --- End Client-Side Validation ---

    try {
      const response = await fetch(`${API_URL}sellerauth/login`, { // NEW LOGIN ENDPOINT
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          const textError = await response.text();
          throw new Error(textError || `Server responded with status ${response.status}`);
        }
        throw new Error(errorData.message || 'Login failed.');
      }

      const data = await response.json();
      
      // Save the token to local storage directly in this component
      // This is the key change to fix the authentication issue
      localStorage.setItem('token', data.token);

      // Assuming the backend returns { token, user: { ...sellerData } }
      // The 'user' key here actually holds the seller's data for consistency with buyer login structure
      // Removed the call to handleSellerLogin, as it's no longer needed
      
      showToastMessage('Login successful! Redirecting to dashboard...', 'success');
      setTimeout(() => {
        navigate('/seller-dashboard'); // Redirect to seller dashboard
      }, 1500);

    } catch (err) {
      console.error('Seller login error:', err);
      showToastMessage(err.message || 'An unexpected error occurred during login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const inputVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const toastVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans
                    bg-gradient-to-br from-green-50 to-lime-100
                    bg-[url('data:image/svg+xml,%3Csvg width=\'18\' height=\'18\' viewBox=\'0 0 18 18\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23d9f99d\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 0h9v3H0V0zm0 6h9v3H0V6zm0 12h9v3H0V12zM9 0h9v3H9V0zm0 6h9v3H9V6zm0 12h9v3H9V12z\'/%3E%3C/g%3E%3C/svg%3E')]
                    bg-repeat bg-center relative overflow-hidden">

      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 left-10 text-green-400 opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <span style={{ fontSize: '80px' }}>🌾</span> {/* Grain/Crop emoji */}
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-lime-400 opacity-20"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
      >
        <span style={{ fontSize: '100px' }}>🚜</span> {/* Tractor emoji */}
      </motion.div>


      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 w-full max-w-md border border-green-300 z-10"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-green-800 leading-tight mb-2">
            <motion.span
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              Seller Login
            </motion.span>
          </h2>
          <p className="text-lg text-gray-600">
            Access your Hivictus Seller Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <motion.div className="relative group" initial="initial" animate="animate" variants={inputVariants}>
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 shadow-sm ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
              required
            />
            {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
          </motion.div>

          {/* Password */}
          <motion.div className="relative group" initial="initial" animate="animate" variants={inputVariants}>
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 shadow-sm ${validationErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
              required
            />
            {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-lg shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center space-x-2
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-98'}`}
            disabled={loading}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                <span>Logging In...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </motion.button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/seller-signup" className="text-green-600 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg text-sm sm:text-base z-50 flex items-center space-x-2`}
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {toastType === 'success' ? <Check size={18} /> : <X size={18} />}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerLogin;
