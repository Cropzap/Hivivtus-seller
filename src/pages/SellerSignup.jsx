// src/pages/SellerSignup.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Lock, User, Building2, Phone, MapPin, // Keeping stable Lucide icons
  Check, X, Loader, Users, Factory // Keeping stable Lucide icons
} from 'lucide-react';

const SellerSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    sellerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '', // CHANGED: From 'phone' to 'mobile' to match backend schema
    street: '',
    city: '',
    state: '',
    pincode: '',
    businessType: 'SME', // Default to SME
    numberOfFarmers: '', // Only for FPO
  });
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'
  const [validationErrors, setValidationErrors] = useState({}); // New state for input-specific errors
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
      case 'mobile':
        // Basic Indian mobile number validation (10 digits)
        if (!/^\d{10}$/.test(value)) {
          error = 'Mobile number must be 10 digits.';
        }
        break;
      case 'password':
        if (value.length < 8) {
          error = 'Password must be at least 8 characters.';
        } else if (!/[A-Z]/.test(value)) {
          error = 'Password must contain an uppercase letter.';
        } else if (!/[a-z]/.test(value)) {
          error = 'Password must contain a lowercase letter.';
        } else if (!/[0-9]/.test(value)) {
          error = 'Password must contain a number.';
        } else if (!/[^A-Za-z0-9]/.test(value)) {
          error = 'Password must contain a special character.';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          error = 'Passwords do not match.';
        }
        break;
      case 'numberOfFarmers':
        if (formData.businessType === 'FPO' && (value === '' || parseInt(value) <= 0 || isNaN(parseInt(value)))) {
          error = 'Number of farmers must be a positive number.';
        }
        break;
      default:
        if (value.trim() === '') {
          error = 'This field is required.';
        }
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  }, [formData.password, formData.businessType]); // Depend on formData.password and businessType

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Validate on change
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowToast(false); // Hide previous toast
    setValidationErrors({}); // Clear previous validation errors

    const { companyName, sellerName, email, password, confirmPassword, mobile, street, city, state, pincode, businessType, numberOfFarmers } = formData;

    // --- Full Client-Side Validation ---
    let isValid = true;
    const requiredFields = ['companyName', 'sellerName', 'email', 'password', 'confirmPassword', 'mobile', 'street', 'city', 'state', 'pincode'];
    requiredFields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    if (businessType === 'FPO') {
        if (!validateField('numberOfFarmers', numberOfFarmers)) {
            isValid = false;
        }
    }

    if (!isValid) {
      showToastMessage('Please correct the validation errors.', 'error');
      setLoading(false);
      return;
    }
    // --- End Client-Side Validation ---

    try {
      const response = await fetch(`${API_URL}seller-auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          sellerName,
          email,
          password,
          mobile, // CHANGED: 'phone' is now 'mobile'
          address: { street, city, state, pincode },
          businessType,
          numberOfFarmers: businessType === 'FPO' ? parseInt(numberOfFarmers) : undefined,
        }),
      });

      if (!response.ok) {
        // Attempt to parse JSON error first
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          // If JSON parsing fails, read as plain text
          const textError = await response.text();
          throw new Error(textError || 'An unknown server error occurred.');
        }
        throw new Error(errorData.message || 'Registration failed.');
      }

      showToastMessage('Registration successful! Your application is under review. We will notify you once approved.', 'success');
      // Clear form data after successful submission
      setFormData({
        companyName: '', sellerName: '', email: '', password: '', confirmPassword: '',
        mobile: '', street: '', city: '', state: '', pincode: '',
        businessType: 'SME', numberOfFarmers: ''
      });
      setValidationErrors({}); // Clear validation errors
      
      // Removed navigate for now as per previous discussion about minimal app
      // If you re-introduce login page, uncomment navigate
      // setTimeout(() => {
      //   navigate('/seller-login'); // Redirect to login page after successful submission
      // }, 3000); 

    } catch (err) {
      console.error('Seller registration error:', err);
      // Display the specific error message from the backend or a generic one
      showToastMessage(err.message || 'An unexpected error occurred during registration.', 'error');
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

      {/* Animated background elements (subtle leaves/tractor) */}
      <motion.div
        className="absolute top-10 left-10 text-green-400 opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <span style={{ fontSize: '80px' }}>🍃</span> {/* Replaced Leaf with emoji */}
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-lime-400 opacity-20"
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
      >
        <span style={{ fontSize: '100px' }}>🚜</span> {/* Replaced Tractor with emoji */}
      </motion.div>


      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 w-full max-w-2xl border border-green-300 z-10"
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
              Join Our Farm-to-Fork Network
            </motion.span>
          </h2>
          <p className="text-lg text-gray-600">
            Register as an FPO or SME to sell your fresh produce.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Type Selection */}
          <motion.div className="flex justify-center space-x-6 mb-6 p-3 bg-green-50 rounded-xl border border-green-200 shadow-inner" initial="initial" animate="animate" variants={inputVariants}>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="businessType"
                value="FPO"
                checked={formData.businessType === 'FPO'}
                onChange={handleChange}
                className="form-radio h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500 transition-colors duration-200"
              />
              <span className="text-lg font-medium text-gray-700 flex items-center">
                <Users size={20} className="mr-2 text-green-600" /> FPO
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="businessType"
                value="SME"
                checked={formData.businessType === 'SME'}
                onChange={handleChange}
                className="form-radio h-5 w-5 text-green-600 border-gray-300 focus:ring-green-500 transition-colors duration-200"
              />
              <span className="text-lg font-medium text-gray-700 flex items-center">
                <Factory size={20} className="mr-2 text-green-600" /> SME
              </span>
            </label>
          </motion.div>

          {/* Company Name */}
          <motion.div className="relative group" initial="initial" animate="animate" variants={inputVariants}>
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={formData.companyName}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 shadow-sm ${validationErrors.companyName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
              required
            />
            {validationErrors.companyName && <p className="text-red-500 text-xs mt-1">{validationErrors.companyName}</p>}
          </motion.div>

          {/* Contact Person */}
          <motion.div className="relative group" initial="initial" animate="animate" variants={inputVariants}>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
            <input
              type="text"
              name="sellerName"
              placeholder="Contact Person Name"
              value={formData.sellerName}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 shadow-sm ${validationErrors.sellerName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
              required
            />
            {validationErrors.sellerName && <p className="text-red-500 text-xs mt-1">{validationErrors.sellerName}</p>}
          </motion.div>

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

          {/* Confirm Password */}
          <motion.div className="relative group" initial="initial" animate="animate" variants={inputVariants}>
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 shadow-sm ${validationErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
              required
            />
            {validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>}
          </motion.div>

          {/* Mobile Number */}
          <motion.div className="relative group" initial="initial" animate="animate" variants={inputVariants}>
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
            <input
              type="tel"
              name="mobile" // CHANGED: Name is now 'mobile'
              placeholder="Mobile Number (10 digits)"
              value={formData.mobile} // Access formData.mobile
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 shadow-sm ${validationErrors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
              required
            />
            {validationErrors.mobile && <p className="text-red-500 text-xs mt-1">{validationErrors.mobile}</p>}
          </motion.div>

          {/* Address Fields */}
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" initial="initial" animate="animate" variants={inputVariants}>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
              <input
                type="text"
                name="street"
                placeholder="Street Address"
                value={formData.street}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 shadow-sm ${validationErrors.street ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                required
              />
              {validationErrors.street && <p className="text-red-500 text-xs mt-1">{validationErrors.street}</p>}
            </div>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors text-xl">🏙️</span> {/* Replaced City with emoji */}
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 shadow-sm ${validationErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                required
              />
              {validationErrors.city && <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>}
            </div>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors text-xl">🏛️</span> {/* Replaced Landmark with emoji */}
              <input
                type="text"
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 shadow-sm ${validationErrors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                required
              />
              {validationErrors.state && <p className="text-red-500 text-xs mt-1">{validationErrors.state}</p>}
            </div>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors text-xl">#️⃣</span> {/* Replaced Hash with emoji */}
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 shadow-sm ${validationErrors.pincode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                required
              />
              {validationErrors.pincode && <p className="text-red-500 text-xs mt-1">{validationErrors.pincode}</p>}
            </div>
          </motion.div>

          {/* Number of Farmers (Conditional for FPO) */}
          <AnimatePresence>
            {formData.businessType === 'FPO' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden group"
              >
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" size={20} />
                <input
                  type="number"
                  name="numberOfFarmers"
                  placeholder="Number of Farmers (for FPO)"
                  value={formData.numberOfFarmers}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 shadow-sm ${validationErrors.numberOfFarmers ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                  min="1"
                  required={formData.businessType === 'FPO'}
                />
                {validationErrors.numberOfFarmers && <p className="text-red-500 text-xs mt-1">{validationErrors.numberOfFarmers}</p>}
              </motion.div>
            )}
          </AnimatePresence>

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
                <span>Submitting...</span>
              </>
            ) : (
              <span>Register as Seller</span>
            )}
          </motion.button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/seller-login" className="text-green-600 hover:underline font-medium">
            Login here
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

export default SellerSignup;
