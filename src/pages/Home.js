// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';  // Importar el Header
import Button from '../components/Button/Button';

const Home = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');  // Redirige a la página de login
  };

  return (
    <div>
      <div className="container">
        <h1>Bienvenido a la página principal</h1>
        <Button text="Login" onClick={handleLoginClick} />
      </div>
    </div>
  );
};

export default Home;