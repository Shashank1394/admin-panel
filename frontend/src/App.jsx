// frontend/src/App.jsx
// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoadingPage from './pages/LoadingPage';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import ManagePage from './pages/ManagePage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoadingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* All other routes are public for now */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/manage" element={<ManagePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
