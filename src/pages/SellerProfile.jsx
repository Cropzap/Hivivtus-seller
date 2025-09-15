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

// Assuming axios is installed: npm install axios
import axios from 'axios';
const API_URL = import.meta.env.REACT_APP_API_URL;

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
const FileInputField = ({ label, name, value, onChange, readOnly = false, icon: Icon, error, allowedTypes, fileTypeLabel, displayUrl, MAX_FILE_SIZE_MB }) => {
  // Determine if a file is currently "selected" (either new upload or existing from backend)
  const isFilePresent = !!value; // Value would be a Base64 string (data: prefix or not) or null

  // Determine the display name
  let fileName = 'No file chosen';
  if (isFilePresent) {
    if (typeof value === 'string' && value.startsWith('data:')) {
      fileName = 'Selected File'; // New file or existing with correct prefix
    } else {
      fileName = 'Existing File'; // Existing file from backend without data: prefix
    }
  }

  // Determine the icon based on detected MIME type from value or general file type if not specified
  let displayIcon = <FaRegFilePdf className="mr-2 text-lime-600" />; // Default to PDF icon
  if (value && typeof value === 'string' && value.startsWith('data:image')) {
    displayIcon = <FaRegFileImage className="mr-2 text-lime-600" />;
  } else if (name === 'userPhoto' || name === 'shopPhoto') {
    // If it's a photo field but value doesn't start with data:image, still show image icon
    displayIcon = <FaRegFileImage className="mr-2 text-lime-600" />;
  }

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
            title="View Document"
          >
            View
          </a>
        )}
        {/* Optional: Add a clear button for files in edit mode */}
        {!readOnly && isFilePresent && ( // Only show clear button if a file is present and not read-only
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
    // Use `editedData` for conditional validation, ensuring it's not null
    const currentEditedData = editedData || sellerData;

    switch (name) {
      case 'email':
        if (!value || !/\S+@\S+\.\S+/.test(value)) { // Changed to !value for required check
          errorMsg = 'Invalid email format and is required.';
        }
        break;
      case 'mobile':
        if (!value || !/^\d{10}$/.test(value)) { // Changed to !value for required check
          errorMsg = 'Mobile number must be 10 digits and is required.';
        }
        break;
      case 'alternateMobile':
        if (value && !/^\d{10}$/.test(value)) { // Optional, but if provided, must be 10 digits
          errorMsg = 'Alternate mobile number must be 10 digits.';
        }
        break;
      case 'address.pincode':
        if (!value || !/^\d{6}$/.test(value)) { // Changed to !value for required check
          errorMsg = 'Pincode must be 6 digits and is required.';
        }
        break;
      case 'numberOfFarmers':
        // Check if currentEditedData exists before accessing businessType
        if (currentEditedData?.businessType === 'FPO' && (value === '' || parseInt(value) <= 0 || isNaN(parseInt(value)))) {
          errorMsg = 'Number of farmers must be a positive number for FPO.';
        }
        break;
      case 'companyName':
      case 'sellerName':
      case 'address.street':
      case 'address.city':
      case 'address.state':
        if (!value || value.trim() === '') { // Use !value for general required check
          errorMsg = 'This field is required.';
        }
        break;
      case 'businessType':
        if (!value) {
          errorMsg = 'Business type is required.';
        }
        break;
      default:
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg === '';
  }, [editedData, sellerData]); // Added sellerData to dependencies for initial validation context


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    // Special handling for number inputs to ensure they are numeric or empty string
    if (name === 'numberOfFarmers' && value !== '' && !/^\d*$/.test(value)) {
      return; // Prevent non-numeric input for number fields
    }

    setEditedData(prev => {
      if (name.includes('address.')) {
        const addressField = name.split('.')[1];
        return {
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value,
          },
        };
      } else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
    // Validate immediately on change
    validateField(name, value);
  }, [validateField]);


  // MODIFIED: handleFileChange to ensure proper Base64 and error handling
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    const { name } = e.target;

    // Handle clearing the file input (e.g., if button is clicked or no file selected)
    if (!file) {
      setEditedData(prev => ({ ...prev, [name]: null }));
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
      // Also clear and revoke the Blob URL if it exists
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
    let fileTypeLabelText = '';

    // Define labelMapping locally or pass as prop if needed within this scope
    const labelMapping = {
      userPhoto: 'Contact Person Photo',
      shopPhoto: 'Shop/Farm Photo',
      companyRegistrationDoc: 'Company Registration Document (PDF)',
      gstCertificate: 'GST Certificate (PDF)',
      bankDetailsDoc: 'Bank Details Document (PDF)',
      idProofDoc: 'ID Proof Document (PDF)',
    };


    if (name === 'userPhoto' || name === 'shopPhoto') {
      allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      fileTypeLabelText = 'JPG, PNG, GIF';
    } else { // All other document fields should be PDF
      allowedMimeTypes = ['application/pdf'];
      fileTypeLabelText = 'PDF';
    }

    if (!allowedMimeTypes.includes(file.type)) {
      showToastMessage(`Only ${fileTypeLabelText} files are allowed for ${labelMapping[name] || name}.`, 'error');
      setValidationErrors(prev => ({ ...prev, [name]: `Only ${fileTypeLabelText} files are allowed.` }));
      // Clear the input visually as well
      e.target.value = '';
      return;
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToastMessage(`File size for ${labelMapping[name] || name} exceeds ${MAX_FILE_SIZE_MB}MB limit.`, 'error');
      setValidationErrors(prev => ({ ...prev, [name]: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.` }));
      // Clear the input visually as well
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file); // Reads the file as a data URL (Base64 string with prefix)

    reader.onloadend = () => {
      // Store the full Base64 string (e.g., "data:image/jpeg;base64,....")
      // This is what will be sent to the backend.
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
          // Ensure base64Content is valid before decoding
          if (base64Content) {
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
          } else {
             throw new Error("Base64 content is empty or invalid.");
          }
        } else {
          throw new Error("Data URL format mismatch.");
        }
      } catch (e) {
        console.error(`Error creating Blob URL for ${name}:`, e);
        showToastMessage('Failed to display file preview. Please re-upload.', 'error');
        // Clear the generated Blob URL if preview fails
        setDocUrls(prev => {
          if (prev[name]) URL.revokeObjectURL(prev[name]);
          const newUrls = { ...prev };
          delete newUrls[name];
          return newUrls;
        });
      }
    };

    reader.onerror = (error) => {
      showToastMessage('Failed to read file.', 'error');
      setValidationErrors(prev => ({ ...prev, [name]: 'Failed to read file.' }));
      console.error("File reading error:", error);
    };

  }, [showToastMessage, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB]); // Added MAX_FILE_SIZE_MB to deps


  // Helper to process Base64 string from backend to a Blob URL
  const processBase64ToBlobUrl = useCallback((base64String, fieldName) => {
    if (base64String && typeof base64String === 'string') {
      let mimeType;
      let base64Content;

      // Check if it's already a data URI
      const parts = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);

      if (parts) {
        mimeType = parts[1];
        base64Content = parts[2];
      } else {
        // This means the backend sent raw Base64 without 'data:' prefix.
        console.warn(`Unexpected Base64 format for ${fieldName} from backend (no data: prefix). Attempting to guess MIME type.`);
        base64Content = base64String;

        // Attempt to guess MIME type based on fieldName (similar to backend's forgiving logic)
        // This is necessary because raw Base64 strings don't contain MIME type information.
        if (fieldName.includes('Photo')) {
          // For images, we can attempt to sniff popular types
          const hexSignature = base64Content.substring(0, 8).toUpperCase(); // Get first few bytes for sniffing
          if (hexSignature.startsWith('89504E47')) mimeType = 'image/png'; // PNG
          else if (hexSignature.startsWith('FFD8FF')) mimeType = 'image/jpeg'; // JPEG
          else if (hexSignature.startsWith('47494638')) mimeType = 'image/gif'; // GIF
          else mimeType = 'image/jpeg'; // Fallback for unknown image types
        } else if (fieldName.includes('Doc') || fieldName.includes('Certificate')) {
          // For documents, default to PDF unless other types are expected
          const hexSignature = base64Content.substring(0, 8).toUpperCase();
          if (hexSignature.startsWith('25504446')) mimeType = 'application/pdf'; // PDF
          else mimeType = 'application/pdf'; // Fallback for unknown document types
        } else {
          console.error(`Cannot guess MIME type for raw Base64 string for ${fieldName}.`);
          return null; // Cannot create Blob if MIME type is unknown
        }
      }

      try {
        if (base64Content) {
          const byteCharacters = atob(base64Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          return URL.createObjectURL(blob);
        }
      } catch (e) {
        console.error(`Error creating Blob URL for ${fieldName} with inferred MIME type ${mimeType}:`, e);
      }
    }
    return null; // Return null if invalid or not present
  }, []);


  const fetchSellerProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    const authToken = localStorage.getItem('token');

    if (!authToken) {
      showToastMessage('You are not logged in. Please log in to view your profile.', 'error');
      setLoading(false);
      navigate('/seller-login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}sellerprofile`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken,
        },
      });

      const data = response.data; // Axios automatically parses JSON

      // ⭐ CRITICAL FIX: Ensure fetched data is a valid object before setting state
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure received from backend.');
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
        // Files are stored as Base64 strings directly from backend response
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
      setEditedData(fetchedData); // Initialize editedData with fetched data

      // Process Base64 strings from backend to create Blob URLs for display
      const newDocUrls = {};
      const fileFields = ['userPhoto', 'shopPhoto', 'companyRegistrationDoc', 'gstCertificate', 'bankDetailsDoc', 'idProofDoc'];

      fileFields.forEach(field => {
        newDocUrls[field] = processBase64ToBlobUrl(fetchedData[field], field);
      });
      setDocUrls(newDocUrls);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error fetching profile. Please try again.';
      showToastMessage(errorMessage, 'error');
      console.error("Fetch seller profile error:", err);
      if (err.response?.status === 401 || errorMessage.includes('token') || errorMessage.includes('Authentication') || errorMessage.includes('Access denied')) {
        localStorage.removeItem('sellerAuthToken');
        localStorage.removeItem('sellerData'); // Clear potentially bad sellerData from localStorage
        setTimeout(() => navigate('/seller-login'), 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, showToastMessage, processBase64ToBlobUrl]);

  useEffect(() => {
    fetchSellerProfile();
    // Cleanup Blob URLs on component unmount
    return () => {
      Object.values(docUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
    // The dependency array should contain items that, if changed, should re-run the effect.
    // docUrls is managed *inside* this effect's lifecycle and cleanup, so including it here
    // might lead to infinite loops or unnecessary re-runs if it changes frequently.
    // `fetchSellerProfile` is a useCallback, so it's stable as long as its own dependencies don't change.
  }, [fetchSellerProfile]);


  const toggleEditMode = () => {
    if (editMode) {
      // If exiting edit mode, revert changes
      setEditedData(sellerData);
      setValidationErrors({});
      setError('');
      // Revoke all existing Blob URLs and re-create from original sellerData
      Object.values(docUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      const newDocUrls = {};
      const fileFields = ['userPhoto', 'shopPhoto', 'companyRegistrationDoc', 'gstCertificate', 'bankDetailsDoc', 'idProofDoc'];
      fileFields.forEach(field => {
        newDocUrls[field] = processBase64ToBlobUrl(sellerData[field], field);
      });
      setDocUrls(newDocUrls);
    } else {
       // When entering edit mode, ensure a fresh set of docUrls is available for potential changes
       // This is mostly to ensure we have a clean slate for new uploads, but also
       // to ensure existing ones are properly setup for display.
       const freshDocUrls = {};
       const fileFields = ['userPhoto', 'shopPhoto', 'companyRegistrationDoc', 'gstCertificate', 'bankDetailsDoc', 'idProofDoc'];
       fileFields.forEach(field => {
            freshDocUrls[field] = processBase64ToBlobUrl(sellerData[field], field);
       });
       setDocUrls(freshDocUrls);
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
    // Map of field names to their corresponding editedData paths for validation
    const fieldsToValidate = {
      'companyName': editedData.companyName,
      'sellerName': editedData.sellerName,
      'email': editedData.email,
      'mobile': editedData.mobile,
      'alternateMobile': editedData.alternateMobile, // Optional but validated if present
      'address.street': editedData.address?.street,
      'address.city': editedData.address?.city,
      'address.state': editedData.address?.state,
      'address.pincode': editedData.address?.pincode,
      'businessType': editedData.businessType,
      'numberOfFarmers': editedData.numberOfFarmers, // Conditionally checked by validateField
    };

    for (const field in fieldsToValidate) {
      if (!validateField(field, fieldsToValidate[field])) {
        isValid = false;
      }
    }

    // Also check for any existing file validation errors from handleFileChange
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
      const response = await axios.put(`${API_URL}sellerprofile`, editedData, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken,
        },
      });

      const data = response.data; // Axios automatically parses JSON

      if (!data || !data.sellerProfile || typeof data.sellerProfile !== 'object') {
        throw new Error('Invalid response received after saving profile.');
      }

      // If save is successful, update original sellerData and disable edit mode
      setSellerData(data.sellerProfile); // Use the data returned by the backend (might be updated/sanitized)
      setEditedData(data.sellerProfile);
      setEditMode(false);
      showToastMessage('Profile saved successfully!', 'success');
      console.log('Profile saved:', data.sellerProfile);

      // IMPORTANT: Re-process the newly saved Base64 data from the backend
      // to update the Blob URLs for display. This ensures newly uploaded files are viewable.
      const newDocUrls = {};
      const fileFields = ['userPhoto', 'shopPhoto', 'companyRegistrationDoc', 'gstCertificate', 'bankDetailsDoc', 'idProofDoc'];

      // Revoke any existing Blob URLs before creating new ones
      Object.values(docUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });

      fileFields.forEach(field => {
        newDocUrls[field] = processBase64ToBlobUrl(data.sellerProfile[field], field);
      });
      setDocUrls(newDocUrls);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error saving profile. Please try again.';
      showToastMessage(errorMessage, 'error');
      console.error("Save seller profile error:", err);
      if (err.response?.status === 401 || errorMessage.includes('token') || errorMessage.includes('Authentication') || errorMessage.includes('Access denied')) {
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

  // If sellerData is null after loading, it means there was an unrecoverable error or no data
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

  // Mapping for FileInputField labels
  const labelMapping = {
    userPhoto: 'Contact Person Photo',
    shopPhoto: 'Shop/Farm Photo',
    companyRegistrationDoc: 'Company Registration Document (PDF)',
    gstCertificate: 'GST Certificate (PDF)',
    bankDetailsDoc: 'Bank Details Document (PDF)',
    idProofDoc: 'ID Proof Document (PDF)',
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
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-lime-300 shadow-md bg-gray-200 flex items-center justify-center">
            {docUrls.userPhoto && typeof docUrls.userPhoto === 'string' ? (
              <img
                src={docUrls.userPhoto}
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="text-gray-500 text-6xl sm:text-7xl" />
            )}
            {editMode && (
              <label
                htmlFor="userPhoto"
                className="absolute bottom-0 right-0 bg-lime-500 p-2 rounded-full cursor-pointer hover:bg-lime-600 transition-colors shadow-md"
                title="Change Profile Photo"
              >
                <FaCamera className="text-white text-base sm:text-lg" />
                <input
                  id="userPhoto"
                  type="file"
                  name="userPhoto"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif"
                />
              </label>
            )}
          </div>
          <p className="mt-2 text-lg font-semibold text-gray-800">{editedData.sellerName || 'N/A'}</p>
        </div>

        {/* Tabs for Profile Sections */}
        <div className="flex justify-center border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'personal' ? 'text-lime-600 border-b-2 border-lime-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('personal')}
          >
            <FaUserCircle className="inline-block mr-1.5" /> Personal Details
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'business' ? 'text-lime-600 border-b-2 border-lime-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('business')}
          >
            <FaBuilding className="inline-block mr-1.5" /> Business Info
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${activeTab === 'documents' ? 'text-lime-600 border-b-2 border-lime-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('documents')}
          >
            <FaFileAlt className="inline-block mr-1.5" /> Documents
          </button>
        </div>


        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
              >
                <InputField
                  label="Contact Person Name"
                  name="sellerName"
                  value={editedData.sellerName}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaUserCircle}
                  error={validationErrors.sellerName}
                />
                <InputField
                  label="Company Name"
                  name="companyName"
                  value={editedData.companyName}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaRegBuilding}
                  error={validationErrors.companyName}
                />
                <InputField
                  label="Email"
                  name="email"
                  value={editedData.email}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaEnvelope}
                  type="email"
                  error={validationErrors.email}
                />
                <InputField
                  label="Mobile Number"
                  name="mobile"
                  value={editedData.mobile}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaPhone}
                  type="tel"
                  error={validationErrors.mobile}
                />
                <InputField
                  label="Alternate Mobile (Optional)"
                  name="alternateMobile"
                  value={editedData.alternateMobile}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaPhone}
                  type="tel"
                  error={validationErrors.alternateMobile}
                />
                <InputField
                  label="Date of Establishment"
                  name="dateOfEstablishment"
                  value={editedData.dateOfEstablishment}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaCalendarAlt}
                  type="date"
                />
                <InputField
                  label="Street Address"
                  name="address.street"
                  value={editedData.address.street}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaHome}
                  error={validationErrors['address.street']}
                />
                <InputField
                  label="City"
                  name="address.city"
                  value={editedData.address.city}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaMapMarkerAlt}
                  error={validationErrors['address.city']}
                />
                <InputField
                  label="State"
                  name="address.state"
                  value={editedData.address.state}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaMapMarkerAlt}
                  error={validationErrors['address.state']}
                />
                <InputField
                  label="Pincode"
                  name="address.pincode"
                  value={editedData.address.pincode}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaMapMarkerAlt}
                  type="text" // Keep as text to allow validation regex on string
                  error={validationErrors['address.pincode']}
                />
              </motion.div>
            )}

            {activeTab === 'business' && (
              <motion.div
                key="business"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
              >
                <InputField
                  label="Business Type"
                  name="businessType"
                  value={editedData.businessType}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaBriefcase}
                  type="select"
                  options={[
                    { value: 'SME', label: 'SME (Small/Medium Enterprise)' },
                    { value: 'FPO', label: 'FPO (Farmer Producer Organization)' },
                  ]}
                  error={validationErrors.businessType}
                />
                {editedData.businessType === 'FPO' && (
                  <InputField
                    label="Number of Farmers"
                    name="numberOfFarmers"
                    value={editedData.numberOfFarmers}
                    onChange={handleChange}
                    readOnly={!editMode}
                    icon={FaUsers}
                    type="number"
                    error={validationErrors.numberOfFarmers}
                  />
                )}
                <InputField
                  label="Business Description"
                  name="businessDescription"
                  value={editedData.businessDescription}
                  onChange={handleChange}
                  readOnly={!editMode}
                  icon={FaInfoCircle}
                  type="textarea"
                />
                {/* Shop Photo (reusing FileInputField) */}
                <FileInputField
                  label="Shop/Farm Photo"
                  name="shopPhoto"
                  value={editedData.shopPhoto}
                  onChange={handleFileChange}
                  readOnly={!editMode}
                  icon={FaStore}
                  allowedTypes={['image/jpeg', 'image/png', 'image/gif']}
                  fileTypeLabel="JPG, PNG, GIF"
                  displayUrl={docUrls.shopPhoto}
                  MAX_FILE_SIZE_MB={MAX_FILE_SIZE_MB}
                  error={validationErrors.shopPhoto}
                />
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"
              >
                <FileInputField
                  label="Company Registration Document"
                  name="companyRegistrationDoc"
                  value={editedData.companyRegistrationDoc}
                  onChange={handleFileChange}
                  readOnly={!editMode}
                  icon={FaRegFilePdf}
                  allowedTypes={['application/pdf']}
                  fileTypeLabel="PDF"
                  displayUrl={docUrls.companyRegistrationDoc}
                  MAX_FILE_SIZE_MB={MAX_FILE_SIZE_MB}
                  error={validationErrors.companyRegistrationDoc}
                />
                <FileInputField
                  label="GST Certificate"
                  name="gstCertificate"
                  value={editedData.gstCertificate}
                  onChange={handleFileChange}
                  readOnly={!editMode}
                  icon={FaRegFilePdf}
                  allowedTypes={['application/pdf']}
                  fileTypeLabel="PDF"
                  displayUrl={docUrls.gstCertificate}
                  MAX_FILE_SIZE_MB={MAX_FILE_SIZE_MB}
                  error={validationErrors.gstCertificate}
                />
                <FileInputField
                  label="Bank Details Document"
                  name="bankDetailsDoc"
                  value={editedData.bankDetailsDoc}
                  onChange={handleFileChange}
                  readOnly={!editMode}
                  icon={FaMoneyBillWave}
                  allowedTypes={['application/pdf']}
                  fileTypeLabel="PDF"
                  displayUrl={docUrls.bankDetailsDoc}
                  MAX_FILE_SIZE_MB={MAX_FILE_SIZE_MB}
                  error={validationErrors.bankDetailsDoc}
                />
                <FileInputField
                  label="ID Proof Document"
                  name="idProofDoc"
                  value={editedData.idProofDoc}
                  onChange={handleFileChange}
                  readOnly={!editMode}
                  icon={FaIdCard}
                  allowedTypes={['application/pdf']}
                  fileTypeLabel="PDF"
                  displayUrl={docUrls.idProofDoc}
                  MAX_FILE_SIZE_MB={MAX_FILE_SIZE_MB}
                  error={validationErrors.idProofDoc}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;