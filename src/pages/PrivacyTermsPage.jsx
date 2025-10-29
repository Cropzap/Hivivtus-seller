import React, { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaShieldAlt, FaFileContract, FaShoppingCart, FaTruck, FaSeedling, FaHeart } from 'react-icons/fa';

// --- Accordion Item Component ---
// This component handles the click state and animation for each policy section
const PolicyAccordionItem = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <motion.button
        className="flex justify-between items-center w-full p-4 text-left font-semibold text-lg hover:bg-lime-50 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`content-${title}`}
        initial={false}
        whileHover={{ scale: 1.005 }}
      >
        <span className="flex items-center text-gray-800">
          <Icon className="text-lime-600 mr-3 w-5 h-5" />
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className="w-4 h-4 text-gray-500" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            id={`content-${title}`}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 text-gray-600 leading-relaxed text-sm bg-white/90">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Data Structure ---
// Organize the policies into an array for easy mapping
const policiesData = [
    {
        id: 'privacy',
        title: 'Privacy Policy',
        icon: FaShieldAlt,
        content: (
            <>
                <p className="text-right text-xs italic mb-2">
                    Last Updated On: <strong className='text-gray-800'>14-Oct-2025</strong> | Effective Date: <strong className='text-gray-800'>14-Oct-2025</strong>
                </p>
                <p className="mb-4">
                    This Privacy Policy describes the policies of <strong className='text-gray-800'>Hivictus Private Limited</strong> (CIN - U10309TZ2025PTC036366), located at Velan Nagar, chennimalai, Erode district, Tamil Nadu 638051, India. By accessing or using our Service (https://www.hivictus.com/), you consent to the collection, use, and disclosure of your information in accordance with this Policy.
                </p>

                <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Information We Collect</h3>
                <p>We collect and process the following personal information:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>Name</li>
                    <li>Email</li>
                    <li>Mobile</li>
                    <li>Social Media Profile</li>
                    <li>Date of Birth</li>
                    <li>Address</li>
                    <li>Payment Info</li>
                </ul>
                
                <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">How We Collect & Use Your Information</h3>
                <p className='font-semibold'>Collection Methods:</p>
                <ul className="list-disc list-inside ml-4 mb-3">
                    <li>When a user fills up the registration form or submits personal information.</li>
                    <li>Interacts with the website.</li>
                    <li>From public sources.</li>
                </ul>

                <p className='font-semibold'>Usage Purposes:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>Marketing/Promotional</li>
                    <li>Creating user account</li>
                    <li>Testimonials, Customer feedback collection</li>
                    <li>Enforce T&C</li>
                    <li>Processing payment, Support, Administration info, Fulfill the service</li>
                    <li>Targeted advertising</li>
                    <li>Manage customer order, Site protection, User to user comments</li>
                    <li>Dispute resolution, Manage user account</li>
                </ul>

                <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Sharing Your Information</h3>
                <p>We will not transfer your personal information to any third party without your consent, except in limited circumstances required to fulfill services, such as: **Delivery partners** and other service providers needed to process and fulfill your order.</p>
                <p className='mt-2'>We may also disclose information to comply with **applicable law, regulation, court order**, or to **enforce our agreements**.</p>

                <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Retention and Rights</h3>
                <p>We retain your personal information for <strong className='text-gray-800'>Upto 2 - 4 Years</strong> from the last active date or as long as necessary. You have the right to access, rectify, erase your data, restrict processing, and withdraw consent. To exercise these rights or opt-out of marketing, email us at <strong className='text-lime-600'>info@hivictus.com</strong>.</p>
                
                <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Grievance Officer</h3>
                <p>For any queries or concerns regarding your information, you may email our Grievance Officer at:</p>
                <p>Hivictus Private Limited, 1/6, velan nagar, chennimalai, Erode district, Tamilnadu.</p>
                <p>Email: <strong className='text-lime-600'>info@hivictus.com</strong></p>
            </>
        )
    },
    {
        id: 'terms',
        title: 'Hivictus Terms of Use',
        icon: FaFileContract,
        content: (
            <>
                <p className="text-right text-xs italic mb-2">
                    Effective Date: <strong className='text-gray-800'>15.10.2025</strong>
                </p>
                <p className="mb-4">
                    By accessing or using our platform, you agree to be bound by these Terms of Use. You must be at least <strong className='text-gray-800'>18 years old</strong> or a legal entity to use the service.
                </p>

                <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Key Terms</h3>
                
                <p className='font-semibold'>Account Registration & Responsibility:</p>
                <p>You must provide accurate information and are responsible for maintaining the confidentiality of your account credentials and any activity under your account.</p>

                <p className='font-semibold mt-3'>Marketplace Transactions:</p>
                <p>Hivictus acts as a platform connecting buyers and sellers; <strong className='text-gray-800'>we are not a party to the transactions</strong>. We do not guarantee product quality or delivery. Disputes should be reported via our grievance mechanism.</p>
                
                <p className='font-semibold mt-3'>Limitation of Liability:</p>
                <p>Maximum liability is limited to the value of the transaction or <strong className='text-gray-800'>₹3000</strong> (whichever is lower). Services are provided "as is" without warranties.</p>
                
                <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Prohibited Activities</h3>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>Violate any applicable law or regulation.</li>
                    <li>Post harmful, offensive, or fraudulent content.</li>
                    <li>Interfere with the Platform’s functionality or security (Hack, reverse-engineer, use bots).</li>
                    <li>Impersonate any person or entity.</li>
                </ul>

                <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Governing Law</h3>
                <p>These Terms are governed by the laws of **India**. Disputes are subject to the exclusive jurisdiction of courts in [City, State], India.</p>
                
                <p className='mt-4'>For questions, contact: Email: <strong className='text-lime-600'>support@hivictus.com</strong> | Phone: <strong className='text-lime-600'>8807192932</strong></p>
            </>
        )
    },
    {
        id: 'return',
        title: 'Return & Refund Policy',
        icon: FaShoppingCart,
        content: (
            <>
                <p className="text-right text-xs italic mb-2">
                    Effective Date: <strong className='text-gray-800'>15.10.2025</strong>
                </p>
                
                <p className='font-semibold mt-3'>Eligibility for Returns:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>Products must be returned within <strong className='text-gray-800'>3 - 5 days</strong> from the date of delivery.</li>
                    <li>Only **defective, damaged, or incorrectly delivered** items are eligible.</li>
                    <li>Perishable goods may have special terms.</li>
                </ul>

                <p className='font-semibold mt-3'>Refunds:</p>
                <p>Refunds will be processed to the original payment method, as a **redeem code**, or as **wallet credit** within <strong className='text-gray-800'>7–10 business days</strong> after receiving the return. Shipping charges are non-refundable unless due to our error.</p>
                
                <p className='font-semibold mt-3'>Cancellation:</p>
                <p>Orders can be cancelled <strong className='text-gray-800'>before dispatch</strong>. Once shipped, the return process applies.</p>
            </>
        )
    },
    {
        id: 'shipping',
        title: 'Shipping Policy',
        icon: FaTruck,
        content: (
            <>
                <p className="text-right text-xs italic mb-2">
                    Effective Date: <strong className='text-gray-800'>15.10.2025</strong>
                </p>
                
                <p className='font-semibold mt-3'>Shipping Area:</p>
                <p>We currently deliver only <strong className='text-gray-800'>inside Tamilnadu</strong>.</p>

                <p className='font-semibold mt-3'>Processing and Delivery:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>Orders are usually processed within <strong className='text-gray-800'>1–3 business days</strong>.</li>
                    <li>Delivery timelines vary based on seller, product type, and logistics partner.</li>
                    <li>Customers can track the order once confirmed.</li>
                </ul>

                <p className='font-semibold mt-3'>Damaged Shipments:</p>
                <p>Report lost or damaged shipments to Customer Support within <strong className='text-gray-800'>12 – 24 hours</strong> of delivery for replacement or refund as per the Return Policy.</p>
            </>
        )
    },
    {
        id: 'seller',
        title: 'Seller Policy (For Farmers/FPOs/SMEs)',
        icon: FaSeedling,
        content: (
            <>
                <p className="text-right text-xs italic mb-2">
                    Effective Date: <strong className='text-gray-800'>15.10.2025</strong>
                </p>
                
                <p className='font-semibold mt-3'>Eligibility & Compliance:</p>
                <p>Sellers must provide valid KYC documents (PAN, GST, bank details) and ensure products comply with local laws.</p>
                
                <p className='font-semibold mt-3'>Pricing & Payments:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>Sellers set prices. Hivictus charges an agreed commission/transaction fee.</li>
                    <li>Payments are settled via bank transfer within <strong className='text-gray-800'>7 days</strong> after successful delivery and buyer confirmation.</li>
                </ul>
                
                <p className='font-semibold mt-3'>Prohibited Activities:</p>
                <p>Includes selling counterfeit/illegal products, manipulation of ratings/reviews, and unauthorized use of Hivictus branding. Violations may lead to **suspension or termination**.</p>
                
                <p className='font-semibold mt-3'>Governing Law:</p>
                <p>All seller activities are governed by the laws of India. Disputes are subject to courts in **Erode, Tamil Nadu**.</p>
            </>
        )
    },
    {
        id: 'smilefunds',
        title: 'About SmileFunds Donation Program',
        icon: FaHeart,
        content: (
            <>
                <p className='font-semibold mt-3'>Our Mission:</p>
                <p>SmileFunds is a donation program dedicated to supporting children, the elderly, and individuals in rehabilitation centers across India. Every contribution brings hope and meaningful impact.</p>

                <p className='font-semibold mt-3'>How It Works:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>**Choose Your Cause:** Child education, old-age homes, or rehabilitation programs.</li>
                    <li>**Donate Easily:** Use secure options to contribute instantly or choose to pay after packing for orders.</li>
                    <li>**Direct Impact:** Funds go directly to verified NGOs and institutions.</li>
                </ul>

                <p className='font-semibold mt-3'>Transparency:</p>
                <p><strong className='text-gray-800'>100% of funds</strong> are transferred to verified partners. Donations are tracked, and updates are provided to ensure transparency.</p>
            </>
        )
    },
];


// --- Main Page Component ---
const PrivacyTermsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <motion.div 
                className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-lime-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Header Section with Animation */}
                <div className="bg-lime-600 p-6 sm:p-8 text-white">
                    <motion.h1 
                        className="text-3xl sm:text-4xl font-extrabold flex items-center mb-1"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <FaFileContract className="mr-3 text-lime-200" />
                        Hivictus Policies
                    </motion.h1>
                    <motion.p 
                        className="text-lime-200 text-sm italic"
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        Your legal rights and agreements with Hivictus Private Limited.
                    </motion.p>
                </div>

                {/* Policies Accordion */}
                <div className="p-4 sm:p-6 divide-y divide-gray-100">
                    {policiesData.map((policy, index) => (
                        <PolicyAccordionItem
                            key={policy.id}
                            title={policy.title}
                            icon={policy.icon}
                            defaultOpen={index === 0} // Open the first section by default
                        >
                            {policy.content}
                        </PolicyAccordionItem>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500 italic">
                    <p>
                        This document was generated on 14-Oct-2025. Please review the <strong className='text-gray-600'>Effective Date</strong> for each policy section.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default PrivacyTermsPage;