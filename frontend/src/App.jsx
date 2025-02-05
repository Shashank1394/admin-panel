// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingPage from './pages/LoadingPage';
import AdminPanel from './pages/AdminPanel';
import UploadPage from './pages/UploadPage';
import ManagePage from './pages/UploadPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/manage" element={<ManagePage />} />
      </Routes>
    </Router>
  );
}

export default App;
