// src/components/SellerNavbar.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Menu,
  X,
  Home,
  Tag, // For Sell Products
  ListOrdered, // For Orders
  LifeBuoy, // For Tickets/Support
  Shield, // For Privacy Policy
  FileText, // For Terms and Conditions
  LogIn,
  UserPlus, // For Register
  LogOut,
  User, // For Profile
  UsersRound, // For Add Farmers (FPO specific)
  PlusCircle, // For Add Farmers action
} from "lucide-react";
import SellerLogo from "../assets/Hivictus.png"; // Assuming you have a seller-specific logo
import axios from 'axios'; // Import axios for API calls

// Helper component for Mobile Navigation Items
const SellerMobileNavItem = ({ to, onClick, icon, label }) => {
  const location = useLocation();
  const isActive = to && location.pathname === to;

  // Adjusted for white background: text-gray-800, hover:bg-lime-50
  const itemClass = `flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-300
    ${isActive ? "bg-lime-600 text-white shadow-md" : "text-gray-800 hover:bg-lime-50"}`;

  return (
    <motion.div whileTap={{ scale: 0.98 }} className="w-full">
      {to ? (
        <Link to={to} onClick={onClick} className={itemClass}>
          {icon}
          <span className="text-base font-medium">{label}</span>
        </Link>
      ) : (
        <button onClick={onClick} className={itemClass}>
          {icon}
          <span className="text-base font-medium">{label}</span>
        </button>
      )}
    </motion.div>
  );
};

// Helper component for Mobile Floating Bottom Navigation Items
const SellerFloatingBottomNavItem = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  // Switched to a lime/green palette for the bottom nav
  return (
    <motion.div whileTap={{ scale: 0.95 }} className="relative flex flex-col items-center text-sm">
      <Link
        to={to}
        className={`flex flex-col items-center justify-center text-xs p-1
          ${isActive ? "text-lime-400" : "text-gray-200 hover:text-lime-300"}
          transition-all duration-200`}
      >
        {icon}
        <span className="mt-0.5">{label}</span>
      </Link>
    </motion.div>
  );
};


const SellerNavbar = () => {
  const [isClient, setIsClient] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSellerLoggedIn, setIsSellerLoggedIn] = useState(false);
  const [sellerData, setSellerData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const accountDropdownRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to fetch seller profile from backend (omitted implementation details for brevity, assumed functional)
  const fetchSellerProfile = useCallback(async (token) => {
    // ... (Your existing fetchSellerProfile logic)
    try {
      const res = await axios.get('/api/sellerprofile', {
        headers: { 'x-auth-token': token },
      });
      const profile = res.data;
      setSellerData(profile);
      setIsSellerLoggedIn(true);
      localStorage.setItem('sellerData', JSON.stringify(profile));
    } catch (err) {
      console.error('Error fetching seller profile:', err);
      setSellerData(null);
      setIsSellerLoggedIn(false);
      localStorage.removeItem('sellerData');
      if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/seller-login');
      }
    }
  }, [navigate]);

  // Check seller login status and load seller data (omitted implementation details for brevity, assumed functional)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedSellerData = localStorage.getItem('sellerData');

    if (token) {
      // Logic to check token and stored data, then call fetchSellerProfile if needed
      if (storedSellerData) {
        try {
          if (storedSellerData === "undefined") {
            localStorage.removeItem('sellerData');
            fetchSellerProfile(token);
          } else {
            const parsedData = JSON.parse(storedSellerData);
            setSellerData(parsedData);
            setIsSellerLoggedIn(true);
          }
        } catch (e) {
          localStorage.removeItem('sellerData');
          setSellerData(null);
          setIsSellerLoggedIn(false);
          fetchSellerProfile(token);
        }
      } else {
        fetchSellerProfile(token);
      }
    } else {
      setIsSellerLoggedIn(false);
      setSellerData(null);
      localStorage.removeItem('sellerData');
    }
  }, [fetchSellerProfile]);


  const handleLogout = () => {
    localStorage.removeItem('token'); // Use the correct key, typically 'token' or 'x-auth-token'
    localStorage.removeItem('sellerData');
    setIsSellerLoggedIn(false);
    setSellerData(null);
    navigate('/seller-login');
  };

  // Close dropdowns/menus on outside click (retained existing logic)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(event.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isClient) return null;

  // Adjusted text-color for white background: text-gray-700
  const navLinkClass = (path) =>
    `relative flex items-center py-2 px-4 transition-all duration-300 ease-in-out text-sm
    ${
      location.pathname === path
        ? "text-lime-600 font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-0.5 after:bg-lime-600 after:rounded-full"
        : "text-gray-700 hover:text-lime-600"
    }`;

  const commonNavItems = (
    <>
      <Link to="/seller-dashboard" className={navLinkClass("/seller-dashboard")}>
        Home
      </Link>
      {/* Conditional: Add Farmers for FPO */}
      {isSellerLoggedIn && sellerData?.businessType === 'FPO' && (
        <Link to="/seller-add-farmers" className={navLinkClass("/seller-add-farmers")}>
          Add Farmers
        </Link>
      )}
      <Link to="/seller-products" className={navLinkClass("/seller-products")}>
        Sell Products
      </Link>
      <Link to="/seller-orders" className={navLinkClass("/seller-orders")}>
        Orders
      </Link>
    </>
  );

  const mobileMenuCommonItems = (
    <>
      <SellerMobileNavItem to="/seller-dashboard" onClick={() => setIsMobileMenuOpen(false)} icon={<Home size={20} />} label="Home" />
      {isSellerLoggedIn && sellerData?.businessType === 'FPO' && (
        <SellerMobileNavItem to="/seller-add-farmers" onClick={() => setIsMobileMenuOpen(false)} icon={<UsersRound size={20} />} label="Add Farmers" />
      )}
      <SellerMobileNavItem to="/seller-products" onClick={() => setIsMobileMenuOpen(false)} icon={<Tag size={20} />} label="Sell Products" />
      <SellerMobileNavItem to="/seller-orders" onClick={() => setIsMobileMenuOpen(false)} icon={<ListOrdered size={20} />} label="Orders" />
    </>
  );

  return (
    <div className="w-full">
      {/* 🔹 Desktop Navbar */}
      <div className="hidden md:flex fixed top-0 left-0 w-full h-20 items-center justify-between px-8 z-50 
                      bg-white shadow-lg border-b border-gray-100"> {/* Changed to WHITE background */}
        
        {/* Logo on the left - BIGGER SIZE */}
        <Link to="/seller-dashboard" className="flex items-center justify-start h-full">
          <motion.img
            src={SellerLogo}
            alt="Seller Portal Logo"
            // Increased height to h-20 for a bigger logo
            className="object-contain h-20 w-auto" 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </Link>

        {/* Centered Nav - Adjusted styling for white background */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gray-50/50 backdrop-blur-sm shadow-inner rounded-full px-6 py-2 flex items-center justify-center space-x-6 border border-gray-200"
        >
          <nav className="flex space-x-4 text-gray-700">
            {commonNavItems}
            {/* Account Dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className={`flex items-center space-x-1 py-2 px-4 transition-all duration-300 ease-in-out text-sm
                  ${
                    isSellerLoggedIn || location.pathname === "/seller-login" || location.pathname === "/seller-signup"
                      ? "text-lime-600 font-semibold" // Active/Logged-in state color
                      : "text-gray-700 hover:text-lime-600" // Default state color
                  }`}
              >
                <span>My Account</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isAccountDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isAccountDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white shadow-2xl rounded-lg py-2 border border-gray-100 z-50"
                  >
                    {!isSellerLoggedIn ? (
                      <>
                        <Link
                          to="/seller-login"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-800 hover:bg-lime-50 hover:text-lime-600 transition-colors duration-200"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          <LogIn size={16} /> <span>Login</span>
                        </Link>
                        <Link
                          to="/seller-signup"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-800 hover:bg-lime-50 hover:text-lime-600 transition-colors duration-200"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          <UserPlus size={16} /> <span>Register</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/seller-profile"
                          className="flex items-center space-x-2 px-4 py-2 text-gray-800 hover:bg-lime-50 hover:text-lime-600 transition-colors duration-200"
                          onClick={() => setIsAccountDropdownOpen(false)}
                        >
                          <User size={16} /> <span>My Profile</span>
                        </Link>
                        <button
                          onClick={() => { handleLogout(); setIsAccountDropdownOpen(false); }}
                          className="flex items-center space-x-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut size={16} /> <span>Logout</span>
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </motion.header>

        {/* Action Buttons on the right (Profile/Login/Logout) */}
        <div className="flex items-center space-x-4">
          {isSellerLoggedIn ? (
            <>
              <Link to="/seller-profile" className="text-gray-600 hover:text-lime-600 transition-colors duration-200">
                <User size={24} />
              </Link>
              <motion.button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/seller-login"
                className="bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 ease-in-out"
              >
                Login
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* 🔹 Mobile Navbar - Top Bar (Logo + Menu Toggle) */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        // Set to WHITE background, fixed height h-20 for better look
        className="md:hidden fixed top-0 left-0 w-full bg-white shadow-lg p-2 flex justify-between items-center z-50 h-20" 
      >
        <Link to="/seller-dashboard" className="flex flex-row items-center">
          <img
            src={SellerLogo}
            alt="Seller Portal Logo"
            // Increased size for mobile logo
            className="object-contain h-16 w-auto" 
          />
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          ref={mobileMenuButtonRef}
          // Changed color to gray for white background
          className="text-gray-700 hover:text-lime-600 transition-colors duration-200 pr-2" 
        >
          {isMobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </motion.div>
      
      {/* MOBILE CONTENT PADDING HACK */}
      <div className="block md:hidden h-20" /> 
      {/* This invisible div pushes the main content down by the height of the fixed top nav */}


      {/* 🔹 Mobile Full-Screen Menu (when toggled) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="md:hidden fixed top-0 right-0 h-full w-full bg-white z-40 p-6 overflow-y-auto shadow-lg"
            ref={mobileNavRef}
          >
            {/* Increased padding-top to account for fixed top bar */}
            <div className="flex flex-col items-start space-y-4 pb-20 pt-24"> 
              {mobileMenuCommonItems}

              <div className="w-full h-px bg-gray-200 my-4" />

              {isSellerLoggedIn ? (
                <>
                  <SellerMobileNavItem to="/seller-profile" onClick={() => setIsMobileMenuOpen(false)} icon={<User size={20} />} label="My Profile" />
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center space-x-2 mt-4"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <SellerMobileNavItem to="/seller-login" onClick={() => setIsMobileMenuOpen(false)} icon={<LogIn size={20} />} label="Login" />
                  <SellerMobileNavItem to="/seller-signup" onClick={() => setIsMobileMenuOpen(false)} icon={<UserPlus size={20} />} label="Register" />
                </>
              )}

              <div className="w-full h-px bg-gray-200 my-4" />

              <SellerMobileNavItem to="/seller-support" onClick={() => setIsMobileMenuOpen(false)} icon={<LifeBuoy size={20} />} label="Tickets for Issues" />
              <SellerMobileNavItem to="/seller-terms-and-conditions" onClick={() => setIsMobileMenuOpen(false)} icon={<FileText size={20} />} label="Terms & Conditions" />
              <SellerMobileNavItem to="/seller-privacy-policy" onClick={() => setIsMobileMenuOpen(false)} icon={<Shield size={20} />} label="Privacy Policy" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔹 Mobile Floating Bottom Navigation (Always Visible for quick access) */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 15, delay: 0.5 }}
        // Set to dark green background to clearly separate it from the main content
        className="md:hidden fixed bottom-0 left-0 w-full bg-green-800 transition-all duration-500 ease-out
                   border-t border-green-700 shadow-[0_-4px_15px_rgba(0,0,0,0.1)] px-4 py-2 flex justify-around items-center z-50"
      >
        <SellerFloatingBottomNavItem to="/seller-dashboard" icon={<Home size={22} />} label="Home" />
        <SellerFloatingBottomNavItem to="/seller-products" icon={<Tag size={22} />} label="Products" />
        <SellerFloatingBottomNavItem to="/seller-orders" icon={<ListOrdered size={22} />} label="Orders" />
        {isSellerLoggedIn ? (
          <SellerFloatingBottomNavItem to="/seller-profile" icon={<User size={22} />} label="Profile" />
        ) : (
          <SellerFloatingBottomNavItem to="/seller-login" icon={<LogIn size={22} />} label="Login" />
        )}
      </motion.nav>
    </div>
  );
};

export default SellerNavbar;