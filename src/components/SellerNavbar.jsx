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
  UserPlus, // For Register (if needed, though seller signup is usually separate)
  LogOut,
  User, // For Profile
  UsersRound, // For Add Farmers (FPO specific)
  PlusCircle, // For Add Farmers action
  Store, // General seller icon
} from "lucide-react";
import SellerLogo from "../assets/Hivictus.png"; // Assuming you have a seller-specific logo
import axios from 'axios'; // Import axios for API calls

// Helper component for Mobile Navigation Items
const SellerMobileNavItem = ({ to, onClick, icon, label }) => {
  const location = useLocation();
  const isActive = to && location.pathname === to; // Check if 'to' is defined

  const itemClass = `flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-300
    ${isActive ? "bg-lime-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"}`;

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

  return (
    <motion.div whileTap={{ scale: 0.95 }} className="relative flex flex-col items-center text-sm">
      <Link
        to={to}
        className={`flex flex-col items-center justify-center text-sm
          ${isActive ? "text-lime-300" : "text-green-100"}
          transition-all duration-200`}
      >
        {icon}
        <span className="mt-1">{label}</span>
      </Link>
    </motion.div>
  );
};


const SellerNavbar = () => {
  const [isClient, setIsClient] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSellerLoggedIn, setIsSellerLoggedIn] = useState(false);
  const [sellerData, setSellerData] = useState(null); // To store seller's businessType etc.
  const location = useLocation();
  const navigate = useNavigate();

  const accountDropdownRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to fetch seller profile from backend
  const fetchSellerProfile = useCallback(async (token) => {
    try {
      const res = await axios.get('/api/sellerprofile', {
        headers: { 'x-auth-token': token },
      });
      const profile = res.data;
      setSellerData(profile);
      setIsSellerLoggedIn(true);
      localStorage.setItem('sellerData', JSON.stringify(profile)); // Store valid data
    } catch (err) {
      console.error('Error fetching seller profile:', err);
      setSellerData(null);
      setIsSellerLoggedIn(false);
      localStorage.removeItem('sellerData'); // Clear invalid data
      if (err.response && err.response.status === 401) {
          // Token expired or invalid, force re-login
          localStorage.removeItem('token');
          navigate('/seller-login'); // Redirect to login
          // Optionally, add a toast message
          // toast.error('Your session has expired. Please log in again.');
      }
      // You might want to handle other errors, e.g., 404 profile not found
    }
  }, [navigate]);

  // Check seller login status and load seller data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedSellerData = localStorage.getItem('sellerData');

    if (token) {
      if (storedSellerData) {
        try {
          // IMPORTANT: Check for the literal string "undefined" before parsing
          if (storedSellerData === "undefined") {
            console.warn("localStorage 'sellerData' contained literal 'undefined', clearing and refetching.");
            localStorage.removeItem('sellerData');
            // Data was bad, so force a fetch
            fetchSellerProfile(token);
          } else {
            const parsedData = JSON.parse(storedSellerData);
            setSellerData(parsedData);
            setIsSellerLoggedIn(true);
            // Optionally, consider refreshing data if it's too old
            // or just rely on the existing token.
          }
        } catch (e) {
          console.error("Failed to parse sellerData from localStorage:", e);
          localStorage.removeItem('sellerData'); // Clear corrupted data
          setSellerData(null);
          setIsSellerLoggedIn(false);
          // Data was corrupted, force a fetch
          fetchSellerProfile(token);
        }
      } else {
        // Token exists but no sellerData in localStorage, fetch it
        fetchSellerProfile(token);
      }
    } else {
      // No token, ensure logged out state
      setIsSellerLoggedIn(false);
      setSellerData(null);
      localStorage.removeItem('sellerData'); // Clean up any stale data
    }
  }, [fetchSellerProfile]); // Dependency on fetchSellerProfile to avoid infinite loop


  const handleLogout = () => {
    localStorage.removeItem('sellerAuthToken');
    localStorage.removeItem('sellerData');
    setIsSellerLoggedIn(false);
    setSellerData(null);
    navigate('/seller-login'); // Redirect to seller login page
  };

  // Close dropdowns/menus on outside click
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

  const navLinkClass = (path) =>
    `relative flex items-center py-2 px-4 transition-all duration-300 ease-in-out text-sm
    ${
      location.pathname === path
        ? "text-lime-300 font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-0.5 after:bg-lime-300 after:rounded-full"
        : "text-green-100 hover:text-lime-200"
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
      <div className="hidden md:flex fixed top-0 left-0 w-full h-20 items-center justify-between px-6 z-50
                      bg-green-800/90 backdrop-blur-md shadow-lg border-b border-green-700">
        {/* Logo on the left */}
        <Link to="/seller-dashboard" className="flex items-center justify-start h-full">
          <motion.img
            src={SellerLogo}
            alt="Seller Portal Logo"
            className="object-contain h-16 w-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </Link>

        {/* Centered Nav */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-green-700/80 backdrop-blur-lg shadow-xl rounded-full px-8 py-3 flex items-center justify-center space-x-8 border border-green-600"
        >
          <nav className="flex space-x-6 text-black">
            {commonNavItems}
            {/* Account Dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className={`flex items-center space-x-1 py-2 px-4 transition-all duration-300 ease-in-out text-sm
                  ${
                    isSellerLoggedIn || location.pathname === "/seller-login" || location.pathname === "/seller-signup"
                      ? "text-lime-300 font-semibold"
                      : "text-green-100 hover:text-lime-200"
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
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white shadow-xl rounded-lg py-2 border border-gray-100 z-50"
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
                        {/* More seller-specific account options can go here */}
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
              <Link to="/seller-profile" className="text-green-100 hover:text-lime-300 transition-colors duration-200">
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
                className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out"
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
        className="md:hidden fixed top-0 left-0 w-full bg-white backdrop-blur-md shadow-sm p-1 flex justify-between items-center z-50"
      >
        <Link to="/seller-dashboard" className="flex flex-row items-center">
          <img
            src={SellerLogo}
            alt="Seller Portal Logo"
            className="object-contain h-16 w-auto"
          />
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          ref={mobileMenuButtonRef}
          className="text-green-100 hover:text-lime-300 transition-colors duration-200"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </motion.div>

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
            <div className="flex flex-col items-start space-y-4 pb-10 pt-20">
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
        className="md:hidden fixed bottom-0 left-0 w-full bg-green-800 transform transition-all duration-500 ease-out
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