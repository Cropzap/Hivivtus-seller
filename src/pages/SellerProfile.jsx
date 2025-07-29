// src/pages/SellerProfile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEdit, FaSave, FaTimes, FaCamera, FaUserCircle, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaBuilding, FaBriefcase, FaHome, FaFileAlt, FaUpload, FaCheckCircle, FaExclamationCircle,
  FaCalendarAlt, FaIdCard, FaRegBuilding, FaMoneyBillWave, FaInfoCircle, FaSeedling, FaUsers,
  FaStore, FaRegFilePdf, FaRegFileImage
} from 'react-icons/fa';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper for Input Fields (No changes needed here)
const InputField = ({ label, name, value, type = 'text', readOnly = false, icon: Icon, options, onChange, error }) => (
  <div className="mb-2">
    <label className="block text-gray-700 text-xs font-medium mb-0.5 flex items-center">
      {Icon && <Icon className="mr-1.5 text-lime-600 text-sm" />}
      {label}
    </label>
    {type === 'select' ? (
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={readOnly}
        className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-sm
                    ${readOnly ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-default' : 'bg-white border-gray-300 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 text-gray-900'}
                    shadow-sm focus:shadow-md appearance-none pr-8 ${error ? 'border-red-500' : ''}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        readOnly={readOnly}
        rows="3"
        className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-sm
                    ${readOnly ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-default' : 'bg-white border-gray-300 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 text-gray-900'}
                    shadow-sm focus:shadow-md ${error ? 'border-red-500' : ''}`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full p-2 rounded-lg border-2 transition-all duration-200 text-sm
                    ${readOnly ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-default' : 'bg-white border-gray-300 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 text-gray-900'}
                    shadow-sm focus:shadow-md ${error ? 'border-red-500' : ''}`}
      />
    )}
    {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
  </div>
);

// Helper for File Upload Fields - MODIFIED TO USE BLOB URLS FOR DISPLAY
const FileInputField = ({ label, name, value, onChange, readOnly = false, icon: Icon, error, allowedTypes, fileTypeLabel, displayUrl }) => {
  const fileName = value ? (value.startsWith('data:') ? 'Selected File' : 'Existing File') : 'No file chosen';
  const displayIcon = value && value.startsWith('data:image') ? <FaRegFileImage className="mr-2 text-lime-600" /> : <FaRegFilePdf className="mr-2 text-lime-600" />;
  const acceptAttr = allowedTypes.join(',');

  return (
    <div className="mb-2">
      <label className="block text-gray-700 text-xs font-medium mb-0.5 flex items-center">
        {Icon && <Icon className="mr-1.5 text-lime-600 text-sm" />}
        {label}
      </label>
      <div className="flex items-center">
        <input
          id={name}
          type="file"
          name={name}
          onChange={onChange}
          disabled={readOnly}
          className="hidden"
          accept={acceptAttr}
        />
        <label
          htmlFor={name}
          className={`flex-grow p-2 rounded-lg border-2 transition-all duration-200 text-sm cursor-pointer
                      ${readOnly ? 'bg-gray-100 border-gray-200 text-gray-700 cursor-default' : 'bg-white border-gray-300 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 text-gray-900 hover:bg-gray-50'}
                      shadow-sm focus:shadow-md flex items-center justify-between ${error ? 'border-red-500' : ''}`}
        >
          <span className="flex items-center">
            {displayIcon}
            {fileName}
          </span>
          {!readOnly && <FaUpload className="text-gray-500 ml-2" />}
        </label>
        {/* Use displayUrl (Blob URL) for viewing if available, otherwise fallback */}
        {displayUrl && (
          <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-lime-600 hover:text-lime-800 transition-colors"
          >
            View
          </a>
        )}
        {/* Optional: Add a clear button for files in edit mode */}
        {!readOnly && value && (
          <button
            type="button"
            onClick={() => onChange({ target: { name, files: [] } })} // Simulate empty file list to clear
            className="ml-2 p-1 text-red-500 hover:text-red-700"
            title="Clear file"
          >
            <FaTimes />
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
      {!readOnly && <p className="text-gray-500 text-xs mt-0.5">Allowed: {fileTypeLabel}, Max: {MAX_FILE_SIZE_MB}MB</p>}
    </div>
  );
};


const SellerProfile = () => {
  const navigate = useNavigate();
  const [sellerData, setSellerData] = useState(null); // The original fetched data
  const [editedData, setEditedData] = useState(null); // Data currently being edited
  const [editMode, setEditMode] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [docUrls, setDocUrls] = useState({}); // Stores Blob URLs for display

  const defaultProfilePic = 'https://placehold.co/150x150/E0E0E0/333333?text=Seller';
  const MAX_FILE_SIZE_MB = 2;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  const showToastMessage = useCallback((message, type = 'success') => {
    setError(''); // Clear previous error
    setShowSaveMessage(false); // Clear previous success
    if (type === 'success') {
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
    }
  }, []);

  const validateField = useCallback((name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'email':
        if (!/\S+@\S+\.\S+/.test(value)) {
          errorMsg = 'Invalid email format.';
        }
        break;
      case 'mobile':
      case 'alternateMobile':
        if (value && !/^\d{10}$/.test(value)) {
          errorMsg = 'Mobile number must be 10 digits.';
        }
        break;
      case 'address.pincode':
        if (value && !/^\d{6}$/.test(value)) {
          errorMsg = 'Pincode must be 6 digits.';
        }
        break;
      case 'numberOfFarmers':
        if (editedData?.businessType === 'FPO' && (value === '' || parseInt(value) <= 0 || isNaN(parseInt(value)))) {
          errorMsg = 'Number of farmers must be a positive number.';
        }
        break;
      case 'companyName':
      case 'sellerName':
      case 'address.street':
      case 'address.city':
      case 'address.state':
        if (value.trim() === '') {
          errorMsg = 'This field is required.';
        }
        break;
      default:
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg === '';
  }, [editedData]);


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setEditedData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setEditedData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    // Validate immediately on change
    validateField(name, value);
  }, [validateField]);


  // MODIFIED: handleFileChange to ensure proper Base64 and error handling
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    const { name } = e.target;

    // Handle clearing the file input
    if (!file) {
      setEditedData(prev => ({ ...prev, [name]: null }));
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
      // Also clear the Blob URL if it exists
      setDocUrls(prev => {
        const newUrls = { ...prev };
        if (newUrls[name]) URL.revokeObjectURL(newUrls[name]);
        delete newUrls[name];
        return newUrls;
      });
      return;
    }

    // File type validation (front-end check)
    let allowedMimeTypes = [];
    if (name === 'userPhoto' || name === 'shopPhoto') {
      allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!file.type.startsWith('image/')) {
        showToastMessage('Only image files are allowed for photos.', 'error');
        setValidationErrors(prev => ({ ...prev, [name]: 'Only image files are allowed.' }));
        return;
      }
    } else { // All other document fields should be PDF
      allowedMimeTypes = ['application/pdf'];
      if (file.type !== 'application/pdf') {
        showToastMessage('Only PDF files are allowed for documents.', 'error');
        setValidationErrors(prev => ({ ...prev, [name]: 'Only PDF files are allowed.' }));
        return;
      }
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToastMessage(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`, 'error');
      setValidationErrors(prev => ({ ...prev, [name]: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.` }));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file); // Reads the file as a data URL (Base64 string with prefix)

    reader.onloadend = () => {
      // Store the full Base64 string directly for sending to backend
      setEditedData(prev => ({
        ...prev,
        [name]: reader.result,
      }));
      setValidationErrors(prev => ({ ...prev, [name]: '' })); // Clear error

      // Create a Blob URL for immediate display
      try {
        const parts = reader.result.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
        if (parts) {
          const mimeType = parts[1];
          const base64Content = parts[2];
          const byteCharacters = atob(base64Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          const url = URL.createObjectURL(blob);

          // Revoke old URL if it exists for this field to prevent memory leaks
          setDocUrls(prev => {
            if (prev[name]) URL.revokeObjectURL(prev[name]);
            return { ...prev, [name]: url };
          });
        }
      } catch (e) {
        console.error("Error creating Blob URL:", e);
        showToastMessage('Failed to display file. Please re-upload.', 'error');
      }
    };

    reader.onerror = (error) => {
      showToastMessage('Failed to read file.', 'error');
      setValidationErrors(prev => ({ ...prev, [name]: 'Failed to read file.' }));
      console.error("File reading error:", error);
    };

  }, [showToastMessage, MAX_FILE_SIZE_BYTES]);


  const fetchSellerProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    const authToken = localStorage.getItem('sellerAuthToken');

    if (!authToken) {
      showToastMessage('You are not logged in. Please log in to view your profile.', 'error');
      setLoading(false);
      navigate('/seller-login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/sellerprofile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Backend response not OK:', data);
        throw new Error(data.message || 'Failed to fetch seller profile data.');
      }

      const fetchedData = {
        companyName: data.companyName || '',
        sellerName: data.sellerName || '',
        email: data.email || '',
        mobile: data.mobile || '',
        alternateMobile: data.alternateMobile || '',
        dateOfEstablishment: data.dateOfEstablishment ? data.dateOfEstablishment.split('T')[0] : '',
        businessType: data.businessType || 'SME',
        numberOfFarmers: data.numberOfFarmers || '',
        businessDescription: data.businessDescription || '',
        sellerStatus: data.sellerStatus || 'new',
        userPhoto: data.userPhoto || null,
        shopPhoto: data.shopPhoto || null,
        companyRegistrationDoc: data.companyRegistrationDoc || null,
        gstCertificate: data.gstCertificate || null,
        bankDetailsDoc: data.bankDetailsDoc || null,
        idProofDoc: data.idProofDoc || null,
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          pincode: data.address?.pincode || '',
        },
      };
      setSellerData(fetchedData);
      setEditedData(fetchedData);

      // Process Base64 strings from backend to create Blob URLs for display
      const newDocUrls = {};
      const fileFields = ['userPhoto', 'shopPhoto', 'companyRegistrationDoc', 'gstCertificate', 'bankDetailsDoc', 'idProofDoc'];

      fileFields.forEach(field => {
        const base64Data = data[field];
        if (base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:')) {
          try {
            const parts = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
            if (parts) {
              const mimeType = parts[1];
              const base64Content = parts[2];
              const byteCharacters = atob(base64Content);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: mimeType });
              newDocUrls[field] = URL.createObjectURL(blob);
            }
          } catch (e) {
            console.error(`Error creating Blob URL for ${field}:`, e);
            newDocUrls[field] = null; // Mark as null if creation fails
          }
        } else if (base64Data === null) {
          newDocUrls[field] = null; // Explicitly null if backend sent null
        } else {
           // Handle cases where backend sends a non-data: base64 string (e.g., just the raw base64)
           // This assumes your backend has been corrected to always send data:MIME;base64,...
           // If not, you'd need to guess MIME or store it in DB. For now, assume it's data: prefixed.
           console.warn(`Unexpected Base64 format for ${field} from backend (no data: prefix).`);
           newDocUrls[field] = null;
        }
      });
      setDocUrls(newDocUrls);

    } catch (err) {
      showToastMessage(err.message || 'Error fetching profile. Please try again.', 'error');
      console.error("Fetch seller profile error:", err);
      if (err.message.includes('token') || err.message.includes('Authentication') || err.message.includes('Access denied')) {
        localStorage.removeItem('sellerAuthToken');
        localStorage.removeItem('sellerData');
        setTimeout(() => navigate('/seller-login'), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, showToastMessage]);

  useEffect(() => {
    fetchSellerProfile();
    // Cleanup Blob URLs on component unmount
    return () => {
      Object.values(docUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [fetchSellerProfile, docUrls]); // Added docUrls to dependency array for cleanup

  const toggleEditMode = () => {
    if (editMode) {
      // If exiting edit mode, revert changes
      setEditedData(sellerData);
      setValidationErrors({});
      setError('');
      // Re-create Blob URLs from original sellerData in case they were revoked/changed during edit
      const newDocUrls = {};
      const fileFields = ['userPhoto', 'shopPhoto', 'companyRegistrationDoc', 'gstCertificate', 'bankDetailsDoc', 'idProofDoc'];
      fileFields.forEach(field => {
        const base64Data = sellerData[field]; // Use original sellerData
        if (base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:')) {
          try {
            const parts = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
            if (parts) {
              const mimeType = parts[1];
              const base64Content = parts[2];
              const byteCharacters = atob(base64Content);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: mimeType });
              newDocUrls[field] = URL.createObjectURL(blob);
            }
          } catch (e) {
            console.error(`Error recreating Blob URL for ${field} on cancel:`, e);
            newDocUrls[field] = null;
          }
        } else {
          newDocUrls[field] = null;
        }
      });
      setDocUrls(newDocUrls);
    }
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setValidationErrors({});

    const authToken = localStorage.getItem('sellerAuthToken');
    if (!authToken) {
      showToastMessage('Authentication token missing. Please log in.', 'error');
      setLoading(false);
      navigate('/seller-login');
      return;
    }

    // --- Client-Side Validation before sending to backend ---
    let isValid = true;
    const fieldsToValidate = [
      'companyName', 'sellerName', 'email', 'mobile',
      'address.street', 'address.city', 'address.state', 'address.pincode',
      'businessType', 'alternateMobile', 'numberOfFarmers' // numberOfFarmers is conditionally checked by validateField
    ];

    for (const field of fieldsToValidate) {
      let value;
      if (field.startsWith('address.')) {
        value = editedData.address[field.split('.')[1]];
      } else {
        value = editedData[field];
      }
      if (!validateField(field, value)) {
        isValid = false;
      }
    }

    // Check for any existing file validation errors
    const documentFields = ['userPhoto', 'shopPhoto', 'companyRegistrationDoc', 'gstCertificate', 'bankDetailsDoc', 'idProofDoc'];
    documentFields.forEach(docField => {
      if (validationErrors[docField]) { // Check if there's an error already set for this file
        isValid = false;
      }
    });

    if (!isValid) {
      showToastMessage('Please correct the validation errors before saving.', 'error');
      setLoading(false);
      return;
    }
    // --- End Client-Side Validation ---

    try {
      const response = await fetch('http://localhost:5000/api/sellerprofile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken,
        },
        // Send all edited data, including Base64 strings for files
        body: JSON.stringify(editedData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Backend response not OK:', data);
        throw new Error(data.message || 'Failed to update profile.');
      }

      // If save is successful, update original sellerData and disable edit mode
      setSellerData(editedData);
      setEditMode(false);
      showToastMessage('Profile saved successfully!', 'success');
      console.log('Profile saved:', data);

      // IMPORTANT: Re-process the newly saved Base64 data from the backend
      // to update the Blob URLs for display. This ensures newly uploaded files are viewable.
      const newDocUrls = {};
      const fileFields = ['userPhoto', 'shopPhoto', 'companyRegistrationDoc', 'gstCertificate', 'bankDetailsDoc', 'idProofDoc'];

      fileFields.forEach(field => {
        const base64Data = data.sellerProfile[field]; // Use data.sellerProfile as it's the latest from backend
        if (base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:')) {
          try {
            const parts = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
            if (parts) {
              const mimeType = parts[1];
              const base64Content = parts[2];
              const byteCharacters = atob(base64Content);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: mimeType });
              newDocUrls[field] = URL.createObjectURL(blob);
            }
          } catch (e) {
            console.error(`Error creating Blob URL for ${field} after save:`, e);
            newDocUrls[field] = null;
          }
        } else if (base64Data === null) {
          newDocUrls[field] = null;
        } else {
           console.warn(`Unexpected Base64 format for ${field} from backend after save.`);
           newDocUrls[field] = null;
        }
      });
      setDocUrls(newDocUrls);

    } catch (err) {
      showToastMessage(err.message || 'Error saving profile. Please try again.', 'error');
      console.error("Save seller profile error:", err);
      if (err.message.includes('token') || err.message.includes('Authentication') || err.message.includes('Access denied')) {
        localStorage.removeItem('sellerAuthToken');
        localStorage.removeItem('sellerData');
        setTimeout(() => navigate('/seller-login'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 to-green-100 flex items-center justify-center p-3 sm:p-4 font-sans">
        <div className="flex flex-col items-center text-green-700">
          <Loader size={48} className="animate-spin mb-4" />
          <p className="text-lg">Loading Seller Profile...</p>
        </div>
      </div>
    );
  }

  if (!sellerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 to-green-100 flex flex-col items-center justify-center p-3 sm:p-4 font-sans text-red-700">
        <FaExclamationCircle size={48} className="mb-4" />
        <p className="text-lg font-semibold">Could not load seller profile.</p>
        {error && <p className="text-sm mt-2">{error}</p>}
        <button onClick={fetchSellerProfile} className="mt-4 bg-lime-600 text-white px-4 py-2 rounded-lg shadow hover:bg-lime-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const statusColors = {
    new: 'bg-blue-100 text-blue-800 border-blue-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-green-100 flex items-center justify-center p-3 sm:p-4 font-sans pt-20 pb-10">
      <div className="relative bg-white/80 backdrop-blur-xl rounded-[1.5rem] shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-4xl border border-white/50">

        {/* Success/Error Messages */}
        <AnimatePresence>
          {showSaveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 bg-lime-500 text-white px-3 py-1.5 rounded-full shadow-lg text-xs font-semibold animate-fade-in-down z-20"
            >
              Profile Saved Successfully!
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg text-xs font-semibold animate-fade-in-down z-20"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>


        {/* Header and Action Buttons */}
        <div className="flex justify-between items-center mt-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <FaSeedling className="mr-3 text-lime-600 text-3xl" /> My Seller Profile
          </h1>
          {!editMode ? (
            <motion.button
              onClick={toggleEditMode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center bg-lime-600 text-white px-3 py-1.5 text-sm rounded-full shadow-md
                         transition-all duration-200 hover:bg-lime-700 hover:shadow-lg active:scale-95"
            >
              <FaEdit className="mr-1.5 text-xs" /> Edit
            </motion.button>
          ) : (
            <div className="flex space-x-2">
              <motion.button
                onClick={handleSave}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center bg-lime-600 text-white px-3 py-1.5 text-sm rounded-full shadow-md
                           transition-all duration-200 hover:bg-lime-700 hover:shadow-lg active:scale-95"
              >
                {loading ? <Loader size={12} className="animate-spin mr-1.5" /> : <FaSave className="mr-1.5 text-xs" />} Save
              </motion.button>
              <motion.button
                onClick={toggleEditMode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center bg-gray-300 text-gray-800 px-3 py-1.5 text-sm rounded-full shadow-md
                           transition-all duration-200 hover:bg-gray-400 hover:shadow-lg active:scale-95"
              >
                <FaTimes className="mr-1.5 text-xs" /> Cancel
              </motion.button>
            </div>
          )}
        </div>

        {/* Seller Status Display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className={`text-center font-semibold text-sm py-2 px-4 rounded-full border mb-6
                      ${statusColors[sellerData.sellerStatus] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
        >
          Status: {sellerData.sellerStatus.toUpperCase()}
          {sellerData.sellerStatus === 'new' && <span className="ml-2 text-xs">(Awaiting Review)</span>}
          {sellerData.sellerStatus === 'pending' && <span className="ml-2 text-xs">(Under Review)</span>}
          {sellerData.sellerStatus === 'approved' && <span className="ml-2 text-xs">(Active Seller)</span>}
          {sellerData.sellerStatus === 'rejected' && <span className="ml-2 text-xs">(Please contact support)</span>}
        </motion.div>


        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-3 border-white shadow-lg bg-gray-200">
            <img
              src={docUrls.userPhoto || defaultProfilePic} 
              alt="User Profile"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = defaultProfilePic; }}
            />
            {editMode && (
              <label htmlFor="user-photo-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-200">
                <FaCamera className="text-xl sm:text-2xl" />
                <input
                  id="user-photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  name="userPhoto"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
          {editMode && (
            <label htmlFor="user-photo-upload" className="mt-3 text-lime-600 cursor-pointer hover:underline text-xs sm:text-sm">
              Change Contact Person Photo
              <input
                id="user-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                name="userPhoto"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {/* Animated Tabs for Sections */}
        <div className="mb-4 bg-white/60 backdrop-blur-sm rounded-lg p-0.5 flex border border-white/70 shadow-inner">
          <motion.button
            onClick={() => setActiveTab('personal')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-300
                        ${activeTab === 'personal' ? 'bg-lime-500 text-white shadow-md' : 'text-gray-700 hover:bg-white/70'}`}
          >
            Personal & Contact
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('business')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-300
                        ${activeTab === 'business' ? 'bg-lime-500 text-white shadow-md' : 'text-gray-700 hover:bg-white/70'}`}
          >
            Business Details
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('documents')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-300
                        ${activeTab === 'documents' ? 'bg-lime-500 text-white shadow-md' : 'text-gray-700 hover:bg-white/70'}`}
          >
            Documents
          </motion.button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'personal' && (
            <motion.div
              key="personal-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/70 shadow-lg"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaUserCircle className="mr-2 text-lime-600 text-xl" /> Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2">
                <InputField label="Contact Person Name" name="sellerName" value={editedData.sellerName} onChange={handleChange} readOnly={!editMode} icon={FaUserCircle} error={validationErrors.sellerName} />
                <InputField label="Email" name="email" value={editedData.email} type="email" readOnly={true} icon={FaEnvelope} />
                <InputField label="Mobile Number" name="mobile" value={editedData.mobile} type="tel" readOnly={true} icon={FaPhone} error={validationErrors.mobile} />
                <InputField label="Alternate Mobile" name="alternateMobile" value={editedData.alternateMobile} onChange={handleChange} type="tel" readOnly={!editMode} icon={FaPhone} error={validationErrors.alternateMobile} />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 mt-6 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-lime-600 text-xl" /> Business Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2">
                <InputField label="Street Address" name="address.street" value={editedData.address.street} onChange={handleChange} readOnly={!editMode} icon={FaHome} error={validationErrors['address.street']} />
                <InputField label="City" name="address.city" value={editedData.address.city} onChange={handleChange} readOnly={!editMode} icon={FaBuilding} error={validationErrors['address.city']} />
                <InputField label="State" name="address.state" value={editedData.address.state} onChange={handleChange} readOnly={!editMode} icon={FaBuilding} error={validationErrors['address.state']} />
                <InputField label="Pincode" name="address.pincode" value={editedData.address.pincode} onChange={handleChange} readOnly={!editMode} icon={FaMapMarkerAlt} error={validationErrors['address.pincode']} />
              </div>
            </motion.div>
          )}

          {activeTab === 'business' && (
            <motion.div
              key="business-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/70 shadow-lg"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaBriefcase className="mr-2 text-lime-600 text-xl" /> Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2">
                <InputField label="Company Name" name="companyName" value={editedData.companyName} onChange={handleChange} readOnly={!editMode} icon={FaRegBuilding} error={validationErrors.companyName} />
                <InputField
                  label="Business Type"
                  name="businessType"
                  value={editedData.businessType}
                  onChange={handleChange}
                  type="select"
                  readOnly={!editMode}
                  icon={FaSeedling}
                  options={[{ value: 'SME', label: 'SME' }, { value: 'FPO', label: 'FPO' }]}
                />
                {editedData.businessType === 'FPO' && (
                  <InputField label="Number of Farmers" name="numberOfFarmers" value={editedData.numberOfFarmers} onChange={handleChange} type="number" readOnly={!editMode} icon={FaUsers} error={validationErrors.numberOfFarmers} />
                )}
                <InputField label="Date of Establishment" name="dateOfEstablishment" value={editedData.dateOfEstablishment} onChange={handleChange} type="date" readOnly={!editMode} icon={FaCalendarAlt} />
                <div className="md:col-span-2">
                  <InputField label="Business Description" name="businessDescription" value={editedData.businessDescription} onChange={handleChange} readOnly={!editMode} type="textarea" icon={FaInfoCircle} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/70 shadow-lg"
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaFileAlt className="mr-2 text-lime-600 text-xl" /> Required Documents
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Please upload files (max {MAX_FILE_SIZE_MB}MB per file).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2">
                <FileInputField label="Shop/Business Photo" name="shopPhoto" value={editedData.shopPhoto} onChange={handleFileChange} readOnly={!editMode} icon={FaStore} error={validationErrors.shopPhoto} allowedTypes={['image/jpeg', 'image/png', 'image/gif']} fileTypeLabel="Images (JPG, PNG, GIF)" displayUrl={docUrls.shopPhoto} />
                <FileInputField label="Company Registration Document" name="companyRegistrationDoc" value={editedData.companyRegistrationDoc} onChange={handleFileChange} readOnly={!editMode} icon={FaRegBuilding} error={validationErrors.companyRegistrationDoc} allowedTypes={['application/pdf']} fileTypeLabel="PDF" displayUrl={docUrls.companyRegistrationDoc} />
                <FileInputField label="GST Certificate" name="gstCertificate" value={editedData.gstCertificate} onChange={handleFileChange} readOnly={!editMode} icon={FaFileAlt} error={validationErrors.gstCertificate} allowedTypes={['application/pdf']} fileTypeLabel="PDF" displayUrl={docUrls.gstCertificate} />
                <FileInputField label="Bank Details Document" name="bankDetailsDoc" value={editedData.bankDetailsDoc} onChange={handleFileChange} readOnly={!editMode} icon={FaMoneyBillWave} error={validationErrors.bankDetailsDoc} allowedTypes={['application/pdf']} fileTypeLabel="PDF" displayUrl={docUrls.bankDetailsDoc} />
                <FileInputField label="Contact Person ID Proof" name="idProofDoc" value={editedData.idProofDoc} onChange={handleFileChange} readOnly={!editMode} icon={FaIdCard} error={validationErrors.idProofDoc} allowedTypes={['application/pdf']} fileTypeLabel="PDF" displayUrl={docUrls.idProofDoc} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default SellerProfile;