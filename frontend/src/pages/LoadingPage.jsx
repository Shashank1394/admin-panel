// frontend/src/pages/LoadingPage.jsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LoadingPage() {
  const navigate = useNavigate();

  // After 3 seconds, redirect to the Admin Panel
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/admin');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 z-50">
      {/* Animated Spinner */}
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
        className="mb-6"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="#4A5568"  // Tailwind's gray-700
          strokeWidth="8"
          fill="none"
        />
      </motion.svg>
      {/* Animated Loading Text */}
      <motion.div
        className="text-xl font-bold text-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Loading...
      </motion.div>
    </div>
  );
}
