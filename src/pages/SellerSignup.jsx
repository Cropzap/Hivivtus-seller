import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    Mail, Lock, User, Building2, Phone, MapPin,
    Check, X, Loader, Users, Factory, Globe, Info,
    ArrowRight, ArrowLeft
} from 'lucide-react';

// FIX: Setting a direct, safe fallback URL. (Placeholder, not actively used for submission)
const API_BASE_URL = "https://api.hivictus.com";
// Pincode API
const PINCODE_API_URL = "https://api.postalpincode.in/pincode/";
const TARGET_STATE = "Tamil Nadu"; // Enforcing the Tamil Nadu-only requirement

// --- New Animated SVG Component for Right Side Content (Direct Supply Chain Theme) ---
const AnimatedSupplyChainSVG = () => {
    // --- 🎨 Colors for better contrast and branding ---
    const PRIMARY_GREEN = '#36A84F'; // Hivictus Brand Green (Agriculture/Source)
    const SECONDARY_BLUE = '#1E40AF'; // Tech/Platform Blue (Movement/Trust)
    const TERTIARY_ORANGE = '#F97316'; // Consumer/Product Warmth (Destination/Product)
    const BACKGROUND_LINE = '#FFFFFF30'; // Subtle path line

    // --- 📐 SVG and Icon Dimensions/Positions ---
    const SVG_WIDTH = 300; // Reduced size for desktop
    const SVG_HEIGHT = 150; // Reduced size for desktop
    const START_X = 50;
    const END_X = 250;
    const Y_POS = 80;

    // --- 🎬 Animation Variants ---
    const svgVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const iconVariants = {
        hidden: { scale: 0, opacity: 0, y: Y_POS + 30 },
        visible: {
            scale: 1,
            opacity: 1,
            y: Y_POS,
            transition: {
                type: 'spring',
                stiffness: 150,
                damping: 12
            }
        }
    };

    const productVariants = {
        start: { x: START_X - 10, y: Y_POS - 10, opacity: 0, rotate: 0 },
        end: {
            x: END_X - 10,
            y: Y_POS - 10,
            opacity: 1,
            rotate: 360,
            transition: {
                x: {
                    duration: 1.8,
                    delay: 1.0,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear"
                },
                opacity: {
                    times: [0, 0.05, 0.95, 1],
                    values: [0, 1, 1, 0],
                    duration: 1.8,
                    delay: 1.0,
                    repeat: Infinity,
                    ease: "linear"
                },
                rotate: {
                    duration: 1.8,
                    delay: 1.0,
                    repeat: Infinity,
                    ease: "linear"
                },
                y: {
                    duration: 1.8,
                    delay: 1.0,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear"
                }
            }
        }
    };

    return (
        <motion.svg
            width={SVG_WIDTH}
            height={SVG_HEIGHT}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            variants={svgVariants}
            initial="hidden"
            animate="visible"
            className="my-4" // Adjusted margin
        >
            {/* --- Path for Direct Supply Line --- */}
            <line
                x1={START_X}
                y1={Y_POS}
                x2={END_X}
                y2={Y_POS}
                stroke={BACKGROUND_LINE}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="5 5"
            />

            {/* --- 1. Seller/Farmer Icon (Source) --- */}
            <motion.g variants={iconVariants} initial="hidden" animate="visible" transform={`translate(${START_X}, ${Y_POS})`}>
                <rect x="-10" y="-20" width="20" height="30" fill={PRIMARY_GREEN} rx="3" />
                <path d="M 0 -25 L -3 -35 L 0 -45 L 3 -35 Z" fill="white" />
                <text x="0" y="25" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">Seller</text>
            </motion.g>

            {/* --- 2. Product Box (Animated Movement) --- */}
            <motion.rect
                width="15" // Reduced size
                height="15" // Reduced size
                fill={TERTIARY_ORANGE}
                rx="3"
                variants={productVariants}
                initial="start"
                animate="end"
                style={{
                    filter: "drop-shadow(0 0 8px rgba(249, 115, 22, 0.8))",
                    stroke: 'white',
                    strokeWidth: 1,
                }}
            />

            {/* --- 3. Consumer/Buyer Icon (Destination) --- */}
            <motion.g variants={iconVariants} initial="hidden" animate="visible" transform={`translate(${END_X}, ${Y_POS})`}>
                <path d="M -15 -5 H 15 L 10 15 H -10 Z" fill={SECONDARY_BLUE} />
                <rect x="-7" y="-15" width="14" height="7" fill={SECONDARY_BLUE} rx="2" />
                <text x="0" y="25" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">Consumer</text>
            </motion.g>
        </motion.svg>
    );
};
// --- End New Animated SVG Component ---


// --- Right Side Content Component with new SVG and Hivictus content ---
const RightSideContent = () => {
    const PRIMARY_GREEN = '#36A84F';
    const SECONDARY_BROWN_ISH = '#E6C6A0';

    return (
        // ******* UPDATED LAYOUT CLASS: w-2/5 (40%) *******
        <div
            style={{ backgroundColor: PRIMARY_GREEN }}
            className="relative hidden lg:flex flex-col items-center justify-center p-6 w-2/5 text-white overflow-hidden rounded-r-2xl"
        >
            {/* Top Green Accent Shape (Curved based on image) */}
            <svg className="absolute top-0 right-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,0 L100,20 C 70,35, 30,35, 0,20 Z" fill="rgba(0,0,0,0.1)" />
            </svg>

            {/* Bottom Brown Accent Shape */}
            <div
                style={{ backgroundColor: SECONDARY_BROWN_ISH }}
                className="absolute bottom-0 left-0 w-full h-1/5 transform origin-bottom-right"
            >
                <div
                    style={{ backgroundColor: PRIMARY_GREEN }}
                    className="absolute top-0 right-0 w-full h-full transform translate-y-[-1px] rounded-tl-[60px]"
                ></div>
            </div>

            <div className="text-center z-10 p-4">
                <h1 className="text-3xl font-extrabold mb-3 leading-snug">
                    <span className="bg-white text-green-700 px-2 py-0.5 rounded-md shadow-lg inline-block">Hivictus</span>
                </h1>
                <p className="text-xs font-light uppercase tracking-widest text-green-100 mb-4">
                    Seller Registration
                </p>
                <div className="my-2">
                    <AnimatedSupplyChainSVG />
                </div>

                <h3 className="text-xl font-bold mb-2 text-white">
                    Empowering Farmers & SMEs
                </h3>
                <p className="text-xs px-2 text-green-100 font-light">
                    Gain **direct market access** and ensure **fair pricing** for your agricultural and rural products.
                </p>
            </div>
        </div>
    );
};
// --- End Right Side Content ---


// --- Improved Input Component for Reusability and UI Consistency ---
const FormInput = ({ label, name, icon: Icon, error, className = '', ...props }) => {
    return (
        <label className="block relative">
            <span className="text-xs font-medium text-gray-700 block mb-1">{label}</span>
            <div className="relative">
                {Icon && (
                    <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /> // Reduced icon size
                )}
                <input
                    {...props}
                    name={name}
                    className={`w-full pl-9 pr-3 py-1.5 border text-sm rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-500 shadow-sm transition-all duration-200
                        ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'} ${className}`}
                />
            </div>
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-red-500 text-xs mt-1 font-medium overflow-hidden"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </label>
    );
};

// --- Pincode Input with Dropdown Lookup ---
const PincodeInputWithLookup = ({ value, onChange, onSelectAddress, error }) => {
    const [pincodeLookupResults, setPincodeLookupResults] = useState([]);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showInfo, setShowInfo] = useState(true);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Debounced Pincode fetch
    useEffect(() => {
        const infoTimer = setTimeout(() => setShowInfo(false), 5000);

        if (value.length === 6 && /^\d{6}$/.test(value)) {
            const delayDebounceFn = setTimeout(() => {
                fetchPincodeData(value);
            }, 500);

            return () => {
                clearTimeout(delayDebounceFn);
                clearTimeout(infoTimer);
            };
        } else {
            setPincodeLookupResults([]);
            setShowDropdown(false);
        }
        return () => clearTimeout(infoTimer);
    }, [value]);

    const fetchPincodeData = async (pincode) => {
        setLookupLoading(true);
        setPincodeLookupResults([]);
        setShowInfo(false);
        try {
            const response = await fetch(`${PINCODE_API_URL}${pincode}`);
            const data = await response.json();

            if (data && data[0] && data[0].Status === 'Success') {
                const postOffices = data[0].PostOffice || [];
                const tamilNaduResults = postOffices.filter(po => po.State === TARGET_STATE);

                if (tamilNaduResults.length > 0) {
                    const uniqueResults = [];
                    const names = new Set();
                    tamilNaduResults.forEach(po => {
                        const key = `${po.Name}-${po.District}`;
                        if (!names.has(key)) {
                            names.add(key);
                            uniqueResults.push({
                                name: po.Name,
                                district: po.District,
                                state: po.State,
                                block: po.Block
                            });
                        }
                    });
                    setPincodeLookupResults(uniqueResults);
                    setShowDropdown(true);
                } else {
                    setPincodeLookupResults([]);
                    setShowDropdown(false);
                }
            } else {
                setPincodeLookupResults([]);
                setShowDropdown(false);
            }
        } catch (error) {
            console.error("Pincode fetch error:", error);
            setPincodeLookupResults([]);
            setShowDropdown(false);
        } finally {
            setLookupLoading(false);
        }
    };

    const handleAddressSelect = (address) => {
        onSelectAddress(address);
        setShowDropdown(false);
        setShowInfo(false);
    };

    // Handle clicks outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Info Message Variants
    const infoVariants = {
        hidden: { opacity: 0, scale: 0.8, x: '50%' },
        visible: { opacity: 1, scale: 1, x: 0 },
        exit: { opacity: 0, scale: 0.8, x: '50%' },
    };

    return (
        <label className="block relative">
            <span className="text-xs font-medium text-gray-700 block mb-1">Pincode * (Tamil Nadu Only)</span>
            <div className="relative" ref={inputRef}>
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="tel"
                    name="pincode"
                    placeholder="6 digits"
                    value={value}
                    onChange={onChange}
                    onFocus={() => value.length === 6 && pincodeLookupResults.length > 0 && setShowDropdown(true)}
                    className={`w-full pl-9 pr-3 py-1.5 border text-sm rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-500 shadow-sm transition-all duration-200
                        ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    maxLength={6}
                    required
                />
                {(lookupLoading || pincodeLookupResults.length > 0) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {lookupLoading ? (
                            <Loader size={16} className="animate-spin text-green-500" />
                        ) : pincodeLookupResults.length > 0 ? (
                            <Globe size={16} className="text-green-500" />
                        ) : null}
                    </div>
                )}
            </div>

            {/* Animated Info Message */}
            <AnimatePresence>
                {showInfo && value.length < 6 && (
                    <motion.div
                        className="absolute -top-1 right-0 sm:right-auto sm:left-[105%] z-30 p-1.5 bg-blue-100 border border-blue-300 rounded-lg shadow-xl" // Adjusted padding
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={infoVariants}
                        transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    >
                        <div className="flex items-center space-x-1 text-blue-700 text-xs font-semibold whitespace-nowrap">
                            <Info size={12} />
                            <span>Enter 6 digits to list address areas.</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDropdown && pincodeLookupResults.length > 0 && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto" // Adjusted max height and border radius
                    >
                        <div className="p-2 text-xs font-bold text-gray-500 border-b">Select Area</div>
                        {pincodeLookupResults.map((address, index) => (
                            <div
                                key={index}
                                onClick={() => handleAddressSelect(address)}
                                className="px-3 py-1.5 text-sm text-gray-700 cursor-pointer hover:bg-green-50 transition-colors"
                            >
                                <span className="font-semibold">{address.name}</span>, {address.district} ({address.state})
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-red-500 text-xs mt-1 font-medium overflow-hidden"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </label>
    );
};

// --- Step Components (Unified for Mobile/Desktop Page Switch) ---
const Step1AccountDetails = ({ formData, handleChange, validateField, validationErrors }) => {
    return (
        <div className="space-y-4"> {/* Increased spacing slightly for better look */}
            <h3 className="text-xl font-bold text-green-700 border-b-2 border-green-200 pb-2 mb-4 tracking-tight">1. Your Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Contact Person *" name="sellerName" icon={User} placeholder="Your Full Name"
                    value={formData.sellerName} onChange={handleChange} onBlur={() => validateField('sellerName', formData.sellerName)}
                    error={validationErrors.sellerName} required
                />
                <FormInput
                    label="Mobile Number *" type="tel" name="mobile" icon={Phone} placeholder="10 digits"
                    value={formData.mobile} onChange={handleChange} onBlur={() => validateField('mobile', formData.mobile)}
                    error={validationErrors.mobile} required maxLength={10}
                />
            </div>
            <FormInput
                label="Email Address *" type="email" name="email" icon={Mail} placeholder="you@example.com"
                value={formData.email} onChange={handleChange} onBlur={() => validateField('email', formData.email)}
                error={validationErrors.email} required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Password *" type="password" name="password" icon={Lock} placeholder="Min 8 chars, incl. special"
                    value={formData.password} onChange={handleChange} onBlur={() => validateField('password', formData.password)}
                    error={validationErrors.password} required
                />
                <FormInput
                    label="Confirm Password *" type="password" name="confirmPassword" icon={Lock} placeholder="Repeat password"
                    value={formData.confirmPassword} onChange={handleChange} onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                    error={validationErrors.confirmPassword} required
                />
            </div>
        </div>
    );
};

const Step2BusinessDetails = ({ formData, handleChange, validateField, validationErrors, handleAddressSelect }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-green-700 border-b-2 border-green-200 pb-2 mb-4 tracking-tight">2. Business & Address Details</h3>

            <FormInput
                label="Company Name *" name="companyName" icon={Building2} placeholder="Your Company/Organization"
                value={formData.companyName} onChange={handleChange} onBlur={() => validateField('companyName', formData.companyName)}
                error={validationErrors.companyName} required
            />

            {/* Business Type Selection - Grid layout on larger screens */}
            <div className="pt-2">
                <span className="text-xs font-medium text-gray-700 block mb-2">Business Type *</span>
                <div className="flex flex-wrap gap-4">
                    <label className={`flex items-center space-x-2 cursor-pointer text-sm py-2 px-4 border rounded-xl transition-all duration-200 ${formData.businessType === 'FPO' ? 'bg-green-100 border-green-500 text-green-800 shadow-md' : 'bg-white border-gray-300 hover:bg-green-50'}`}>
                        <input
                            type="radio" name="businessType" value="FPO" checked={formData.businessType === 'FPO'} onChange={handleChange}
                            className="form-radio h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <span className="font-medium flex items-center"><Users size={14} className="mr-1" /> FPO (Farmer Producer Org.)</span>
                    </label>
                    <label className={`flex items-center space-x-2 cursor-pointer text-sm py-2 px-4 border rounded-xl transition-all duration-200 ${formData.businessType === 'SME' ? 'bg-green-100 border-green-500 text-green-800 shadow-md' : 'bg-white border-gray-300 hover:bg-green-50'}`}>
                        <input
                            type="radio" name="businessType" value="SME" checked={formData.businessType === 'SME'} onChange={handleChange}
                            className="form-radio h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                        />
                        <span className="font-medium flex items-center"><Factory size={14} className="mr-1" /> SME (Small/Medium Enterprise)</span>
                    </label>
                </div>
            </div>

            <AnimatePresence>
                {formData.businessType === 'FPO' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <FormInput
                            label="Number of Farmers in FPO *" type="number" name="numberOfFarmers" icon={Users} placeholder="50+"
                            value={formData.numberOfFarmers} onChange={handleChange} onBlur={() => validateField('numberOfFarmers', formData.numberOfFarmers)}
                            error={validationErrors.numberOfFarmers} required min="1"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Address Row: Pincode and Street in the first line */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                    <PincodeInputWithLookup
                        value={formData.pincode}
                        onChange={handleChange}
                        onSelectAddress={handleAddressSelect}
                        error={validationErrors.pincode}
                    />
                </div>
                <div className="md:col-span-2">
                    <FormInput
                        label="Street / Area Name *" name="street" icon={MapPin} placeholder="Eg: 12th Main Road, Padi"
                        value={formData.street} onChange={handleChange} onBlur={() => validateField('street', formData.street)}
                        error={validationErrors.street} required
                    />
                </div>
            </div>

            {/* City & State Row (Read-only from Pincode lookup) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="City/District *" name="city" icon={Building2} placeholder="Auto-filled by Pincode" readOnly
                    value={formData.city} error={validationErrors.city}
                    className="cursor-not-allowed bg-gray-100"
                />
                <FormInput
                    label="State *" name="state" icon={MapPin} placeholder="Tamil Nadu" readOnly
                    value={formData.state} error={validationErrors.state}
                    className="cursor-not-allowed bg-gray-100"
                />
            </div>
        </div>
    );
};


// --- Main Component ---
const SellerSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: '',
        sellerName: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobile: '',
        street: '',
        city: '',
        state: TARGET_STATE,
        pincode: '',
        businessType: 'SME',
        numberOfFarmers: '',
    });
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [validationErrors, setValidationErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1); // 1 or 2 for both mobile and desktop view

    const showToastMessage = useCallback((message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }, []);

    const validateField = useCallback((name, value, allData = formData) => {
        let error = '';

        if (['companyName', 'sellerName', 'email', 'mobile', 'street', 'city', 'state', 'pincode', 'password', 'confirmPassword'].includes(name) && value.trim() === '') {
            error = 'Required.';
        }

        switch (name) {
            case 'email':
                if (value.trim() !== '' && !/\S+@\S+\.\S+/.test(value)) {
                    error = 'Invalid email format.';
                }
                break;
            case 'mobile':
                if (value.trim() !== '' && !/^\d{10}$/.test(value)) {
                    error = '10 digits required.';
                }
                break;
            case 'pincode':
                if (value.trim() !== '' && !/^\d{6}$/.test(value)) {
                    error = '6 digits required.';
                } else if (value.trim().length === 6 && allData.state.trim() !== TARGET_STATE) {
                    error = `Only Pincodes from ${TARGET_STATE} are allowed.`;
                }
                break;
            case 'state':
                if (value.trim() !== TARGET_STATE) {
                    error = `Must be ${TARGET_STATE}.`;
                }
                break;
            case 'password':
                if (value.length > 0 && value.length < 8) {
                    error = 'Min 8 characters.';
                } else if (value.length > 0 && !/[A-Z]/.test(value)) {
                    error = 'Must contain an uppercase letter.';
                } else if (value.length > 0 && !/[a-z]/.test(value)) {
                    error = 'Must contain a lowercase letter.';
                } else if (value.length > 0 && !/[0-9]/.test(value)) {
                    error = 'Must contain a number.';
                } else if (value.length > 0 && !/[^A-Za-z0-9]/.test(value)) {
                    error = 'Must contain a special character.';
                }
                break;
            case 'confirmPassword':
                if (value !== allData.password) {
                    error = 'Passwords do not match.';
                }
                break;
            case 'numberOfFarmers':
                const num = parseInt(value, 10);
                if (allData.businessType === 'FPO' && (isNaN(num) || num <= 0)) {
                    error = 'Must be a valid number greater than 0.';
                }
                break;
            case 'city':
            case 'street':
                if (value.trim() === '') {
                    error = 'Required.';
                }
                break;
            default:
                break;
        }

        setValidationErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    }, [formData]);

    const handleChange = useCallback((e) => {
        const { name, value, type } = e.target;
        let newValue = value;

        // Constraint for mobile and pincode to only allow digits
        if (type === 'tel') {
            newValue = value.replace(/\D/g, '').slice(0, name === 'mobile' ? 10 : 6);
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));

        // Real-time validation for mobile/pincode on change
        if (name === 'mobile' || name === 'pincode') {
            validateField(name, newValue, { ...formData, [name]: newValue });
        }
    }, [formData, validateField]);

    const handleAddressSelect = useCallback((address) => {
        setFormData(prev => ({
            ...prev,
            city: address.district,
            state: address.state,
            // Keep pincode the same as it triggered the lookup
        }));
        // Re-validate city/state after update
        validateField('city', address.district, { ...formData, city: address.district, state: address.state });
        validateField('state', address.state, { ...formData, city: address.district, state: address.state });
    }, [formData, validateField]);


    // Helper function to validate fields for the current step before advancing/submitting
    const validateCurrentStep = () => {
        let isValid = true;
        const fieldsToValidateStep1 = ['sellerName', 'email', 'mobile', 'password', 'confirmPassword'];
        const fieldsToValidateStep2 = ['companyName', 'pincode', 'street', 'city', 'state'];

        const fields = currentStep === 1 ? fieldsToValidateStep1 : fieldsToValidateStep2;

        if (currentStep === 2 && formData.businessType === 'FPO') {
            fields.push('numberOfFarmers');
        }

        fields.forEach(field => {
            if (!validateField(field, formData[field])) {
                isValid = false;
            }
        });

        return isValid;
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (validateCurrentStep()) {
            setCurrentStep(2);
        } else {
            showToastMessage('Please fill in all required fields and correct errors on this page.', 'error');
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(1);
    };


    // ********* UPDATED handleSubmit FUNCTION *********
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setShowToast(false);

        // Ensure all fields from both steps are validated before submission
        if (!validateCurrentStep() || currentStep === 1) {
            // Force validation of ALL fields if trying to submit from step 1 (shouldn't happen on desktop but good for robustness)
            // On mobile, force move to step 2 first if on step 1
            if (currentStep === 1) {
                handleNextStep(e); // Will also show a toast message
            } else {
                showToastMessage('Please correct all business details errors before submitting.', 'error');
            }
            setLoading(false);
            return;
        }

        const { companyName, sellerName, email, password, mobile, street, city, state, pincode, businessType, numberOfFarmers } = formData;

        try {
            // CRITICAL FIX: Ensure the endpoint matches the backend route: /api/sellerauth/register (no hyphen in 'auth')
            const fullUrl = `${API_BASE_URL.replace(/\/$/, '')}/api/sellerauth/register`;

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyName,
                    sellerName,
                    email,
                    password,
                    mobile,
                    // Address structured as a nested object, as required by the backend model
                    address: { street, city, state, pincode },
                    businessType,
                    numberOfFarmers: businessType === 'FPO' ? numberOfFarmers : undefined, // Only send if FPO
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showToastMessage('Registration successful! Redirecting to login...', 'success');
                setTimeout(() => navigate('/seller-login'), 1500); // Navigate on success
            } else {
                // Handle API-specific errors (e.g., email already exists)
                const errorMessage = data.message || data.error || 'Registration failed due to a server error.';
                showToastMessage(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            showToastMessage('Network error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Toast Component
    const Toast = ({ message, type }) => {
        const icon = type === 'success' ? <Check size={18} /> : <X size={18} />;
        const color = type === 'success' ? 'bg-green-500' : 'bg-red-500';

        return (
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`fixed top-4 right-4 z-50 p-4 rounded-lg text-white shadow-xl flex items-center space-x-2 ${color}`}
            >
                {icon}
                <span className="font-medium text-sm">{message}</span>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ marginTop: '50px' }}> {/* **Increased Margin Top** */}
            <div className="bg-white shadow-2xl rounded-2xl flex w-full max-w-7xl overflow-hidden">
                
                {/* --- Left Side: Registration Form (60%) --- */}
                <div className="w-full lg:w-3/5 p-6 sm:p-10"> 
                    <div className="lg:hidden text-center mb-6">
                        <h1 className="text-2xl font-extrabold text-green-700">Hivictus <span className="text-gray-500 text-sm font-light">Seller</span></h1>
                        <p className="text-sm text-gray-500 mt-1">Join the network for fair market access.</p>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-3xl font-extrabold text-gray-800 mb-1">Seller Registration</h2>
                        <p className="text-sm text-gray-500">Create your account to start selling products.</p>
                    </div>

                    {/* Desktop Step Navigation */}
                    <div className="hidden lg:flex justify-around mb-6 border-b pb-2">
                        <div 
                            className={`cursor-pointer transition-all duration-300 ${currentStep === 1 ? 'border-b-4 border-green-500 text-green-700 font-bold' : 'text-gray-500 hover:text-green-600'}`}
                            onClick={() => setCurrentStep(1)}
                        >
                            <span className="text-sm tracking-wide">Step 1: Account Details</span>
                        </div>
                        <div 
                            className={`cursor-pointer transition-all duration-300 ${currentStep === 2 ? 'border-b-4 border-green-500 text-green-700 font-bold' : 'text-gray-500 hover:text-green-600'}`}
                            onClick={() => setCurrentStep(2)}
                        >
                            <span className="text-sm tracking-wide">Step 2: Business & Address</span>
                        </div>
                    </div>
                    {/* End Desktop Step Navigation */}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Account Details */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1-content"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Step1AccountDetails 
                                        formData={formData} 
                                        handleChange={handleChange} 
                                        validateField={validateField} 
                                        validationErrors={validationErrors} 
                                    />
                                </motion.div>
                            )}

                            {/* Step 2: Business Details */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2-content"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Step2BusinessDetails 
                                        formData={formData} 
                                        handleChange={handleChange} 
                                        validateField={validateField} 
                                        validationErrors={validationErrors} 
                                        handleAddressSelect={handleAddressSelect}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation and Submit Buttons */}
                        <div className={`flex ${currentStep === 1 ? 'justify-end' : 'justify-between'} pt-4 border-t border-gray-100`}>
                            {currentStep === 2 && (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="flex items-center px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <ArrowLeft size={16} className="mr-2" /> Back
                                </button>
                            )}
                            
                            {currentStep === 1 && (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="flex items-center px-6 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 transition-colors"
                                >
                                    Next: Business <ArrowRight size={16} className="ml-2" />
                                </button>
                            )}

                            {currentStep === 2 && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader size={16} className="animate-spin mr-2" /> Registering...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} className="mr-2" /> Complete Registration
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                    
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/seller-login" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                            Login here
                        </Link>
                    </p>
                </div>

                {/* --- Right Side: Branding/Visual (40%) --- */}
                <RightSideContent />
            </div>

            <AnimatePresence>
                {showToast && <Toast message={toastMessage} type={toastType} />}
            </AnimatePresence>
        </div>
    );
};

export default SellerSignup;