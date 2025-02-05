import React from "react";

export default function Navbar() {
  return (
    <div className="bg-white shadow-md w-full flex justify-between p-4">
      <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
      <button className="bg-red-500 text-white px-4 py-2 rounded-lg">
        Logout
      </button>
    </div>
  );
}
