import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirigir a otra página
import Header from '../components/Header/Header';
import { Modal, Button } from 'react-bootstrap';  // Importar los componentes de modal

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isEmpresaMode, setIsEmpresaMode] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // Para redirigir al usuario

  const handleCloseModal = () => setShowModal(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isEmpresaMode
      ? 'http://localhost:6001/api/Owner/loginowner'
      : 'http://localhost:6001/api/User/loginuser';

    const params = new URLSearchParams({
      user: username,
      password: password,
    });

    try {
      const response = await fetch(`${endpoint}?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Error en la autenticación');
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (isEmpresaMode) {
        // Guardar ownerId, firstName y lastName en localStorage
        localStorage.setItem('ownerId', data.ownerId);
        localStorage.setItem('firstName', data.firstName);
        localStorage.setItem('lastName', data.lastName);
        
        // Redirigir a la página de empresas
        navigate('/empresas');
      } else {
        // Guardar información de usuario en localStorage
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('companyId', data.companyId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('name', data.name);
        localStorage.setItem('role', data.role);
        localStorage.setItem('productsIdList', data.productsIdList);
        
        // Redirigir a la página de Usuario
        navigate('/usuario');
      }
    } catch (error) {
      console.error('Error al hacer login:', error);
      setError('Credenciales incorrectas o error en el servidor.');
      setModalMessage('Error: Credenciales incorrectas o error en el servidor.');
      setShowModal(true);  // Mostrar modal de error
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsEmpresaMode(!isEmpresaMode);
  };

  return (
    <div>
      <div className="container">
        <h1>Iniciar sesión</h1>
        <div className="toggle-button" onClick={toggleMode}>
          <div className={isEmpresaMode ? 'toggle-button active' : 'toggle-button'}></div>
        </div>
        <p>{isEmpresaMode ? 'Modo Empresa' : 'Modo Usuario'}</p>
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
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Login'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      </div>

      {/* Modal para mostrar el mensaje */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Mensaje</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Login;