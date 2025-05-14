// src/components/Header/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <h2>IMS</h2>
      <button className="go-back-button" onClick={handleGoHome}>
        Cerrar sesión
      </button>
    </header>
  );
};

export default Header;