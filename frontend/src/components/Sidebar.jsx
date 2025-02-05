import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Sidebar() {
  return (
    <motion.div
      className="w-64 bg-gray-900 text-white h-full p-5 flex flex-col"
      initial={{ x: -200 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav className="flex flex-col space-y-4">
        <Link to="/" className="hover:bg-gray-700 p-3 rounded-lg">
          Dashboard
        </Link>
        <Link to="/upload" className="hover:bg-gray-700 p-3 rounded-lg">
          Upload Media
        </Link>
        <Link to="/manage" className="hover:bg-gray-700 p-3 rounded-lg">
          Manage Content
        </Link>
      </nav>
    </motion.div>
  );
}
