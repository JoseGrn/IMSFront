import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Para redirigir a otra página
import { Modal, Button } from 'react-bootstrap';  // Importar los componentes de modal
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importar el componente FontAwesome
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // Importar íconos de ojo

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isEmpresaMode, setIsEmpresaMode] = useState(false); // Cambiado a 'false' para que el modo Empleado esté activo por defecto
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Nuevo estado para mostrar/ocultar contraseña
  const navigate = useNavigate(); // Para redirigir al usuario

  // Efecto para limpiar el localStorage y reiniciar variables cuando se carga la página de login
  useEffect(() => {
    // Limpiar localStorage
    localStorage.clear();

    // Reiniciar variables de estado
    setUsername('');
    setPassword('');
    setError('');
  }, []);

  const handleCloseModal = () => setShowModal(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isEmpresaMode
      ? 'http://ec2-18-117-218-240.us-east-2.compute.amazonaws.com:6001/api/Owner/loginowner'
      : 'http://ec2-18-117-218-240.us-east-2.compute.amazonaws.com:6001/api/User/loginuser';

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
        localStorage.setItem('username', data.username);
        
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

  // Función para alternar la visibilidad de la contraseña
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
          <div className="form-group">
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
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                onClick={toggleShowPassword}
                style={{
                  marginLeft: '10px',
                  cursor: 'pointer',
                  color: 'black',
                }}
              />
            </div>
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
