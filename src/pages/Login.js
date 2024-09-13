// src/pages/Login.js
import React, { useState } from 'react';
import Header from '../components/Header/Header';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isEmpresaMode, setIsEmpresaMode] = useState(true);  // Estado para el modo empresa/empleado

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Según el modo seleccionado, redirigimos a diferentes endpoints
    const endpoint = isEmpresaMode
      ? 'https://api.empresa.com/login'
      : 'https://api.empleado.com/login';

    // Aquí harías una petición a la API con los datos de usuario y contraseña
    console.log('Endpoint:', endpoint);
    console.log('Usuario:', username);
    console.log('Contraseña:', password);
  };

  const toggleMode = () => {
    setIsEmpresaMode(!isEmpresaMode);
  };

  return (
    <div>
      <Header />
      <div className="container">
        <h1>Iniciar sesión</h1>
        <div className="toggle-button" onClick={toggleMode}>
          <div className={isEmpresaMode ? 'toggle-button active' : 'toggle-button'}></div>
        </div>
        <p>{isEmpresaMode ? 'Modo Empresa' : 'Modo Empleado'}</p>
        <form className="login-form" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;