import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle, Edit, Trash2, X, Loader, Image as ImageIcon, Tag, Text, DollarSign, Package, Scale,
  List, Layers, Info, Check, AlertCircle, ShoppingBag, Box, Grid, Percent
} from 'lucide-react';
// Note: We're keeping the useNavigate hook, assuming a routing context exists.
import { useNavigate } from 'react-router-dom';

// Helper for Input Fields - Updated with new styling
const InputField = ({ label, name, value, type = 'text', icon: Icon, options, onChange, error, placeholder }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
      {Icon && <Icon className="mr-2 text-emerald-600" size={18} />}
      {label}
    </label>
    {type === 'select' ? (
      <div className="relative">
        <select
          name={name}
          value={value || ''}
          onChange={onChange}
          className={`w-full p-2.5 rounded-lg border-2 transition-all duration-200 text-sm bg-white border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 shadow-sm appearance-none pr-10
                      ${error ? 'border-red-500' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
          // SVG background image for the dropdown arrow, styled to match the new color
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2334D399' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    ) : type === 'textarea' ? (
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        rows="3"
        placeholder={placeholder}
        className={`w-full p-2.5 rounded-lg border-2 transition-all duration-200 text-sm bg-white border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 shadow-sm focus:shadow-md
                      ${error ? 'border-red-500' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-2.5 rounded-lg border-2 transition-all duration-200 text-sm bg-white border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-gray-900 shadow-sm focus:shadow-md
                      ${error ? 'border-red-500' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
      />
    )}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SellerProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: '',
    quantity: '',
    imageUrl: '',
    category: '',
    subCategory: '',
    type: 'Conventional',
  });
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [validationErrors, setValidationErrors] = useState({});

  const MAX_IMAGE_SIZE_MB = 2;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  const validateField = useCallback((name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Product name is required.';
        break;
      case 'description':
        if (!value.trim()) error = 'Description is required.';
        break;
      case 'price':
        if (value === '' || isNaN(value) || parseFloat(value) <= 0) error = 'Price must be a positive number.';
        break;
      case 'unit':
        if (!value.trim()) error = 'Unit is required (e.g., kg, piece).';
        break;
      case 'quantity':
        if (value === '' || isNaN(value) || parseInt(value) < 0) error = 'Quantity must be a non-negative integer.';
        break;
      case 'category':
        if (!value) error = 'Category is required.';
        break;
      case 'subCategory':
        if (formData.category && !value.trim()) error = 'Subcategory is required.';
        break;
      case 'imageUrl':
        if (value && !value.startsWith('data:image/') && !value.startsWith('http')) error = 'Invalid image format or URL.';
        break;
      default:
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  }, [formData.category]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  }, [validateField]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData(prev => ({ ...prev, imageUrl: '' }));
      setValidationErrors(prev => ({ ...prev, imageUrl: '' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Only image files are allowed.', 'error');
      setValidationErrors(prev => ({ ...prev, imageUrl: 'Only image files are allowed.' }));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      showToast(`Image size exceeds ${MAX_IMAGE_SIZE_MB}MB limit.`, 'error');
      setValidationErrors(prev => ({ ...prev, imageUrl: `Image size exceeds ${MAX_IMAGE_SIZE_MB}MB limit.` }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      setValidationErrors(prev => ({ ...prev, imageUrl: '' }));
    };
    reader.onerror = () => {
      showToast('Failed to read image file.', 'error');
      setValidationErrors(prev => ({ ...prev, imageUrl: 'Failed to read image file.' }));
    };
    reader.readAsDataURL(file);
  }, [showToast]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories.');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err.message);
      setError('Failed to load categories. ' + err.message);
    }
  }, []);

  const fetchSellerProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      navigate('/seller-login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/products/seller', {
        headers: { 'x-auth-token': authToken },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products.');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err.message);
      setError('Failed to load your products. ' + err.message);
      if (err.message.includes('token') || err.message.includes('Authentication') || err.message.includes('Access denied')) {
        showToast('Session expired or unauthorized. Please log in again.', 'error');
        setTimeout(() => navigate('/seller-login'), 1500);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    fetchCategories();
    fetchSellerProducts();
  }, [fetchCategories, fetchSellerProducts]);

  const openModal = (product = null) => {
    setCurrentProduct(product);
    setValidationErrors({});
    setError('');
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        unit: product.unit,
        quantity: product.quantity,
        imageUrl: product.imageUrl,
        category: product.category._id,
        subCategory: product.subCategory,
        type: product.type || 'Conventional',
      });
    } else {
      setFormData({
        name: '', description: '', price: '', unit: '', quantity: '', imageUrl: '',
        category: '', subCategory: '', type: 'Conventional',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
    setFormData({
      name: '', description: '', price: '', unit: '', quantity: '', imageUrl: '',
      category: '', subCategory: '', type: 'Conventional',
    });
    setValidationErrors({});
    setError('');
  };

  const openConfirmModal = (productId) => {
    setProductToDelete(productId);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setProductToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setValidationErrors({});

    let isValid = true;
    const fieldsToValidate = ['name', 'description', 'price', 'unit', 'quantity', 'category', 'subCategory'];
    if (formData.imageUrl) fieldsToValidate.push('imageUrl');

    for (const field of fieldsToValidate) {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    }

    if (!isValid) {
      showToast('Please correct the form errors.', 'error');
      setFormLoading(false);
      return;
    }

    const authToken = localStorage.getItem('token');
    if (!authToken) {
      showToast('Authentication token missing. Please log in.', 'error');
      setFormLoading(false);
      navigate('/seller-login');
      return;
    }

    try {
      let response;
      if (currentProduct) {
        response = await fetch(`http://localhost:5000/api/products/${currentProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authToken,
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authToken,
          },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Operation failed.');
      }

      showToast(`Product ${currentProduct ? 'updated' : 'added'} successfully!`, 'success');
      closeModal();
      fetchSellerProducts();
    } catch (err) {
      console.error('Product operation error:', err);
      setError(err.message || 'An unexpected error occurred.');
      showToast(err.message || 'An unexpected error occurred.', 'error');
      if (err.message.includes('token') || err.message.includes('Authentication') || err.message.includes('Access denied')) {
        setTimeout(() => navigate('/seller-login'), 1500);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setLoading(true);
    setError('');
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      showToast('Authentication token missing. Please log in.', 'error');
      setLoading(false);
      closeConfirmModal();
      navigate('/seller-login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productToDelete}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': authToken },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product.');
      }

      showToast('Product deleted successfully!', 'success');
      fetchSellerProducts();
    } catch (err) {
      console.error('Error deleting product:', err.message);
      setError(err.message || 'An unexpected error occurred during deletion.');
      showToast(err.message || 'An unexpected error occurred during deletion.', 'error');
      if (err.message.includes('token') || err.message.includes('Authentication') || err.message.includes('Access denied')) {
        setTimeout(() => navigate('/seller-login'), 1500);
      }
    } finally {
      setLoading(false);
      closeConfirmModal();
    }
  };

  const getSubcategoriesForSelectedCategory = () => {
    const selectedCategory = categories.find(cat => cat._id === formData.category);
    return selectedCategory ? selectedCategory.subcategories : [];
  };

  // Framer Motion variants for animated elements
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const toastVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  return (
    // Outer container with requested m-16 top margin
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans mt-16">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 w-full max-w-screen mx-auto border border-gray-100">

        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-900 flex items-center">
            <ShoppingBag className="mr-3 text-emerald-600" size={36} /> My Products
          </h1>
          <motion.button
            onClick={() => openModal()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-full shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg text-sm sm:text-base font-semibold"
          >
            <PlusCircle className="mr-2" size={20} /> Add New Product
          </motion.button>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-center"
            role="alert"
          >
            <AlertCircle className="mr-2" size={20} />
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}

        {/* Product List - Grid of Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-emerald-700">
            <Loader size={48} className="animate-spin mb-4" />
            <p className="text-lg font-semibold">Loading Products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-xl font-semibold mb-3">You haven't added any products yet.</p>
            <p>Click "Add New Product" to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-emerald-300 flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={product.imageUrl || 'https://placehold.co/400x200/E0E0E0/333333?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/E0E0E0/333333?text=No+Image'; }}
                  />
                  {product.type && (
                    <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md flex items-center">
                      <Percent size={14} className="mr-1" /> {product.type}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-emerald-800 mb-1 truncate">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center text-gray-700 text-sm mb-1">
                    <Grid size={14} className="mr-2 text-emerald-600" />
                    <span className="font-medium">{product.category ? product.category.name : 'N/A'}</span>
                    {product.subCategory && (
                      <span className="ml-1 text-gray-500"> / {product.subCategory}</span>
                    )}
                  </div>
                  <div className="flex items-center text-gray-800 font-semibold text-lg mb-2">
                    <DollarSign size={16} className="mr-2 text-emerald-700" />
                    ₹{product.price.toFixed(2)} <span className="text-sm text-gray-500 ml-1">/ {product.unit}</span>
                  </div>
                  <div className="flex items-center text-gray-700 text-sm mb-4">
                    <Box size={14} className="mr-2 text-emerald-600" />
                    Quantity: <span className="font-medium ml-1">{product.quantity} in stock</span>
                  </div>
                  <div className="flex space-x-2 justify-end mt-auto">
                    <motion.button
                      onClick={() => openModal(product)}
                      whileHover={{ scale: 1.05, backgroundColor: '#10B981' }} // emerald-500 hover
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-md transition-all duration-200 hover:shadow-lg text-xs sm:text-sm font-semibold"
                    >
                      <Edit size={14} className="mr-1" /> Edit
                    </motion.button>
                    <motion.button
                      onClick={() => openConfirmModal(product._id)}
                      whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center bg-red-500 text-white px-3 py-1.5 rounded-full shadow-md transition-all duration-200 hover:shadow-lg text-xs sm:text-sm font-semibold"
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-lg relative border border-emerald-300 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-emerald-900 mb-6 text-center">
                {currentProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSubmit}>
                <InputField
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={Tag}
                  placeholder="e.g., Organic Honey"
                  error={validationErrors.name}
                />
                <InputField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  type="textarea"
                  icon={Text}
                  placeholder="Detailed description of the product..."
                  error={validationErrors.description}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  <InputField
                    label="Price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    type="number"
                    icon={DollarSign}
                    placeholder="e.g., 250.00"
                    error={validationErrors.price}
                  />
                  <InputField
                    label="Unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    icon={Scale}
                    placeholder="e.g., Kg, Liter, Piece, Jar"
                    error={validationErrors.unit}
                  />
                </div>
                <InputField
                  label="Quantity in Stock"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  type="number"
                  icon={Package}
                  placeholder="e.g., 100"
                  error={validationErrors.quantity}
                />

                <InputField
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  type="select"
                  icon={List}
                  options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
                  error={validationErrors.category}
                />

                {formData.category && (
                  <InputField
                    label="Subcategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    type="select"
                    icon={Layers}
                    options={getSubcategoriesForSelectedCategory().map(sub => ({ value: sub.name, label: sub.name }))}
                    error={validationErrors.subCategory}
                  />
                )}

                <InputField
                  label="Product Type (Optional)"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  icon={Info}
                  placeholder="e.g., Organic, Natural"
                />

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1 flex items-center">
                    <ImageIcon className="mr-2 text-emerald-600" size={18} />
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {validationErrors.imageUrl && <p className="text-red-500 text-xs mt-1">{validationErrors.imageUrl}</p>}
                  {formData.imageUrl && (
                    <div className="mt-3 flex items-center space-x-2">
                      <img src={formData.imageUrl} alt="Product Preview" className="w-20 h-20 object-cover rounded-md border border-gray-200" />
                      <span className="text-gray-600 text-sm">Image uploaded.</span>
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={formLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-lg shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center space-x-2
                              ${formLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'}`}
                >
                  {formLoading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{currentProduct ? 'Update Product' : 'Add Product'}</span>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative border border-gray-200 text-center"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex justify-center space-x-4">
                <motion.button
                  onClick={closeConfirmModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-full transition-all duration-200 hover:bg-gray-400"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDelete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-500 text-white font-semibold px-6 py-2 rounded-full transition-all duration-200 hover:bg-red-600"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${toastType === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg text-sm sm:text-base z-50 flex items-center space-x-2`}
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

export default SellerProducts;
