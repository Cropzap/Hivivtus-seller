// src/App.jsx (FOR THE SELLER FRONTEND PROJECT - Minimal Version)
import React from 'react'; // No useState, useEffect needed directly in App for this minimal setup
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'; // Removed useNavigate

// Import seller-specific pages and components
import SellerSignup from './pages/SellerSignup'; // Your existing seller signup page
import SellerNavbar from './components/SellerNavbar';
import SellerLogin from './pages/SellerLogin';
import SellerProfile from './pages/SellerProfile';
import SellerProducts from './pages/SellerProducts';
import SellerDashboard from './pages/SellerDashboard';
import SellerOrders from './pages/SellerOrders';
import SupportTicket from './pages/SupportTicket';

// You can keep a global CSS file if you have one
// import './App.css';

function App() {
  // Removed isSellerLoggedIn state and related logic as it's not needed for just signup route
  // Removed handleSellerLogin and handleSellerLogout as they used useNavigate
  const handleSellerLogin = (token, sellerData) => {
    localStorage.setItem('sellerAuthToken', token);
    localStorage.setItem('sellerData', JSON.stringify(sellerData));
    // Removed navigate('/seller-dashboard'); from here
  };

  return (
    <BrowserRouter>
    <SellerNavbar/>
      <Routes>
        {/* Public Route for Seller Signup */}
        <Route path="/seller-dashboard" element={<SellerDashboard/>}/>
        <Route path="/seller-orders" element={<SellerOrders/>}/>
        <Route path="/seller-signup" element={<SellerSignup />} />
        <Route path="/seller-login" element={<SellerLogin handleSellerLogin={handleSellerLogin} />} />
        <Route path="/seller-profile" element={<SellerProfile />} />
        <Route path="/seller-products" element={<SellerProducts />} />
         <Route path="/seller-support" element={<SupportTicket />} />
        {/* Redirect root to seller signup for now */}
        <Route path="/" element={<SellerSignup />} />

        {/* Add a catch-all for unknown routes */}
        <Route path="*" element={<div>404 - Seller Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
