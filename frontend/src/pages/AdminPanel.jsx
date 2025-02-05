// frontend/src/pages/AdminPanel.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <h1 className="text-5xl md:text-7xl font-extrabold text-gray-800 mb-6">
        Admin Panel
      </h1>
      <p className="text-xl md:text-2xl text-gray-700 mb-10">
        Manage your content with ease.
      </p>
      {/* Options Section */}
      <div className="flex flex-wrap justify-center gap-6 w-full max-w-4xl px-4">
        {/* Option: Manage Content (redirects to the Upload Page) */}
        <motion.div
          onClick={() => navigate('/manage')}
          className="p-6 bg-white rounded-lg shadow-lg w-64 text-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-2 text-gray-800">Manage Content</h3>
          <p className="text-gray-600">Easily manage and organize your media.</p>
        </motion.div>
        {/* Option: View Gallery */}
        <motion.div
          onClick={() => navigate('/manage')}
          className="p-6 bg-white rounded-lg shadow-lg w-64 text-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-2 text-gray-800">View Gallery</h3>
          <p className="text-gray-600">Browse a rich gallery of content.</p>
        </motion.div>
        {/* Option: Other Feature */}
        <motion.div
          onClick={() => navigate('/manage')}
          className="p-6 bg-white rounded-lg shadow-lg w-64 text-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-2 text-gray-800">Other Feature</h3>
          <p className="text-gray-600">Additional functionality here.</p>
        </motion.div>
      </div>
    </div>
  );
}
