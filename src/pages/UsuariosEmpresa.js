import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Header from '../components/Header/Header';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import '../styles/UsuariosEmpresa.css'; // Crear un nuevo archivo CSS para los estilos

const UsuariosEmpresa = () => {
  const location = useLocation();
  const { empresa } = location.state || {}; // Recibir la información de la empresa
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Hook para redirigir

  // Función para obtener los usuarios de la empresa
  const obtenerUsuarios = async () => {
    try {
      const response = await fetch(`http://localhost:6001/api/User/obtenerusers?companyId=${empresa.companyId}`);

      if (!response.ok) {
        throw new Error('Error al obtener los usuarios de la empresa');
      }

      const data = await response.json();
      setUsuarios(data); // Guardar los usuarios en el estado
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para obtener los nombres de productos y almacenarlos
  const obtenerProductosNombres = async () => {
    try {
      const response = await fetch(`http://localhost:6001/api/Product/obtenerproductosnombres?companyId=${empresa.companyId}`);

      if (!response.ok) {
        throw new Error('Error al obtener los nombres de productos');
      }

      const data = await response.json();
      setProductos(data); // Guardar los nombres de productos en el estado
    } catch (error) {
      setError(error.message);
    }
  };

  // useEffect para hacer la llamada al API cuando se carga la página
  useEffect(() => {
    obtenerUsuarios();
    obtenerProductosNombres();
  }, []);

  // Función para redirigir a la vista de detalles del usuario
  const handleOpenModal = (user) => {
    navigate(`/empresa/${empresa.companyId}/usuarios/${user.userId}`, { state: { productos, user, empresa } });
  };

  // Función para eliminar un usuario
  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:6001/api/User/eliminaruser?userId=${userId}&companyId=${empresa.companyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el usuario');
      }

      const updatedUsers = await response.json();
      setUsuarios(updatedUsers); // Actualizar la lista de usuarios con los nuevos datos

      // Mostrar SweetAlert de éxito
      Swal.fire({
        icon: 'success',
        title: 'Usuario eliminado correctamente',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      setError(error.message);
    }
  };

  // Confirmación antes de eliminar
  const confirmDeleteUser = (userId) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará al usuario permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteUser(userId); // Llamar a la función de eliminación si se confirma
      }
    });
  };

  const handleCreateUser = () => {
    navigate(`/empresa/${empresa.companyId}/usuarios/crear`, { state: { productos, empresa } });
  };

  return (
    <div>
      <Header />
      <div className="usuarios-empresa-container">
        {/* Botón "Regresar" */}
        <button onClick={() => window.history.back()} className="back-button">
          Regresar
        </button>

        <h1>Usuarios de {empresa.name}</h1>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {usuarios.length > 0 ? (
          <div className="usuarios-list-horizontal">
            {usuarios.map((usuario) => (
              <div key={usuario.userId} className="usuario-item-horizontal">
                <h3>{usuario.name}</h3>
                <p><strong>Rol:</strong> {usuario.role}</p>
                <p><strong>Expiración:</strong> {new Date(usuario.expirationDate).toLocaleDateString()}</p>

                {/* Botón para ver detalles */}
                <Button variant="info" onClick={() => handleOpenModal(usuario)}>
                  Ver Detalles
                </Button>

                {/* Botón para eliminar usuario */}
                <Button variant="danger" onClick={() => confirmDeleteUser(usuario.userId)} className="ms-2">
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay usuarios disponibles para esta empresa.</p>
        )}

        {/* Botón para agregar un nuevo usuario */}
        <Button variant="primary" onClick={handleCreateUser} className="add-user-button">
          Crear Usuario
        </Button>
      </div>
    </div>
  );
};

export default UsuariosEmpresa;
