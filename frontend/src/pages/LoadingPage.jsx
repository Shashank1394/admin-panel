// frontend/src/pages/LoadingPage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/loading.scss'; // Correct import path

export default function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('loading-active');
    return () => {
      document.body.classList.remove('loading-active');
    };
  }, []);  

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/admin');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading-page">
      <div className="wrapper">
        <div className="box-wrap">
          <div className="box one"></div>
          <div className="box two"></div>
          <div className="box three"></div>
          <div className="box four"></div>
          <div className="box five"></div>
          <div className="box six"></div>
        </div>
      </div>
    </div>
  );
}
