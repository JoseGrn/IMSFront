import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import { Modal, Button, Form, Dropdown } from 'react-bootstrap'; // Importar componentes necesarios
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faUser } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importar SweetAlert para el messagebox
import '../styles/Empresas.css';

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditOwnerModal, setShowEditOwnerModal] = useState(false);  
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); 
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDescription, setNewCompanyDescription] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCompanyDescription, setEditCompanyDescription] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const navigate = useNavigate();

  const ownerId = localStorage.getItem('ownerId');
  const firstNameStored = localStorage.getItem('firstName');
  const lastNameStored = localStorage.getItem('lastName');
  const usernameStored = localStorage.getItem('username');

  useEffect(() => {
    if (!ownerId) {
      navigate('/login');
      return;
    }

    // Set values from local storage initially
    setFirstName(firstNameStored);
    setLastName(lastNameStored);
    setUsername(usernameStored);

    const fetchEmpresas = async () => {
      try {
        const response = await fetch(`http://localhost:6001/api/Company/obtenerempresas?ownerId=${ownerId}`);
        if (!response.ok) {
          throw new Error('Error al obtener las empresas');
        }
        const data = await response.json();
        setEmpresas(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, [ownerId, navigate, firstNameStored, lastNameStored, usernameStored]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:6001/api/Company/crearempresa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: parseInt(ownerId),
          name: newCompanyName,
          description: newCompanyDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la empresa');
      }

      const updatedEmpresas = await response.json();
      setEmpresas(updatedEmpresas);

      Swal.fire({
        icon: 'success',
        title: 'Empresa agregada correctamente',
        showConfirmButton: false,
        timer: 1500,
      });

      setShowModal(false);
      setNewCompanyName('');
      setNewCompanyDescription('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditCompany = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:6001/api/Company/editarempresa?companyId=${selectedCompany.companyId}&name=${editCompanyName}&description=${editCompanyDescription}&ownerId=${ownerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al editar la empresa');
      }

      const updatedEmpresa = empresas.map((empresa) =>
        empresa.companyId === selectedCompany.companyId
          ? { ...empresa, name: editCompanyName, description: editCompanyDescription }
          : empresa
      );
      setEmpresas(updatedEmpresa);

      Swal.fire({
        icon: 'success',
        title: 'Empresa editada correctamente',
        showConfirmButton: false,
        timer: 1500,
      });

      setShowEditModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditOwner = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:6001/api/Owner/editowner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          OwnerId: parseInt(ownerId),
          FirstName: firstName,
          LastName: lastName,
          Username: username,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al editar los datos del propietario');
      }

      // Guardar los datos editados en localStorage
      localStorage.setItem('firstName', firstName);
      localStorage.setItem('lastName', lastName);
      localStorage.setItem('username', username);

      Swal.fire({
        icon: 'success',
        title: 'Informacion editada correctamente',
        showConfirmButton: false,
        timer: 1500,
      });

      setShowEditOwnerModal(false);  // Cerrar el modal
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:6001/api/Owner/changepassword?password=${password}&ownerId=${ownerId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al cambiar la contraseña');
      }

      // Mostrar un MessageBox de éxito usando SweetAlert
      Swal.fire({
        title: '¡Éxito!',
        text: 'Contraseña cambiada con éxito.',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/login'); // Redirigir al login después de cerrar el mensaje
      });

      setShowChangePasswordModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordsMatch(e.target.value === confirmPassword);
  };

  const openEmpresaDetalle = (empresa) => {
    navigate(`/empresa/${empresa.companyId}`, { state: { empresa } }); // Pasar la empresa seleccionada
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordsMatch(password === e.target.value);
  };

  const openEditOwnerModal = () => {
    setShowEditOwnerModal(true);
  };

  const openChangePasswordModal = () => {
    setShowChangePasswordModal(true);
  };

  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setPassword('');
    setConfirmPassword('');
  };

  const openEditModal = (empresa) => {
    setSelectedCompany(empresa);
    setEditCompanyName(empresa.name);
    setEditCompanyDescription(empresa.description);
    setShowEditModal(true);
  };

  const handleDeleteCompany = async () => {
    try {
      const response = await fetch(`http://localhost:6001/api/Company/borrarempresa?companyId=${selectedCompany.companyId}&ownerId=${ownerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la empresa');
      }

      const updatedEmpresas = await response.json();
      setEmpresas(updatedEmpresas);

      Swal.fire({
        icon: 'success',
        title: 'Empresa eliminada correctamente',
        showConfirmButton: false,
        timer: 1500,
      });

      setShowEditModal(false); // Cerrar el modal después de eliminar
    } catch (error) {
      setError(error.message);
    }
  };

  const confirmDeleteCompany = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará la empresa.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteCompany();
      }
    });
  };

  if (loading) {
    return <p>Cargando empresas...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div>
      <Header />

      {/* Menú de usuario en la parte superior derecha */}
      <div className="user-menu">
        <Dropdown align="end">
          <Dropdown.Toggle variant="light" id="dropdown-user">
            <FontAwesomeIcon icon={faUser} size="lg" /> {/* Ícono de usuario */}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={openEditOwnerModal}>Editar datos</Dropdown.Item>
            <Dropdown.Item onClick={openChangePasswordModal}>Cambiar contraseña</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="container">
        <h1>Bienvenido, {firstName} {lastName}</h1>
        <h2>Tus empresas:</h2>
        {empresas.length === 0 ? (
          <p>No tienes empresas registradas.</p>
        ) : (
            <ul className="empresa-list">
            {empresas.map((empresa) => (
                <li 
                key={empresa.companyId} 
                className="empresa" 
                onClick={() => openEmpresaDetalle(empresa)}
                >
                <h3>{empresa.name}</h3>
                <Button variant="secondary" size="sm" onClick={(e) => {
                    e.stopPropagation(); // Para evitar que el click en el botón también navegue a la vista de empresa
                    openEditModal(empresa);
                }}>
                    <FontAwesomeIcon icon={faEdit} />
                </Button>
                </li>
            ))}
            </ul>

        )}

        <Button className="add-company-button" onClick={() => setShowModal(true)}>
          Agregar Empresa
        </Button>
      </div>

      {/* Modal para cambiar contraseña */}
      <Modal show={showChangePasswordModal} onHide={closeChangePasswordModal}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleChangePassword}>
            <Form.Group controlId="password">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa la nueva contraseña"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="confirmPassword" className="mt-3">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirma la nueva contraseña"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
            </Form.Group>
            <div className="mt-3">
              {!passwordsMatch && confirmPassword && (
                <p style={{ color: 'red' }}>Las contraseñas no coinciden.</p>
              )}
            </div>
            <Button variant="primary" type="submit" className="mt-3" disabled={!passwordsMatch}>
              Guardar
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeChangePasswordModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para agregar una nueva empresa */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Empresa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateCompany}>
            <Form.Group controlId="companyName">
              <Form.Label>Nombre de la Empresa</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el nombre de la empresa"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="companyDescription" className="mt-3">
              <Form.Label>Descripción de la Empresa</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ingresa la descripción de la empresa"
                value={newCompanyDescription}
                onChange={(e) => setNewCompanyDescription(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar una empresa */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Empresa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditCompany}>
            <Form.Group controlId="editCompanyName">
              <Form.Label>Nombre de la Empresa</Form.Label>
              <Form.Control
                type="text"
                placeholder="Edita el nombre de la empresa"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="editCompanyDescription" className="mt-3">
              <Form.Label>Descripción de la Empresa</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Edita la descripción de la empresa"
                value={editCompanyDescription}
                onChange={(e) => setEditCompanyDescription(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="danger" onClick={confirmDeleteCompany} className="me-3">
              Eliminar Empresa
            </Button>
            <Button variant="primary" type="submit" className="mt-3">
              Guardar cambios
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar datos del propietario */}
      <Modal show={showEditOwnerModal} onHide={() => setShowEditOwnerModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Datos del Propietario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditOwner}>
            <Form.Group controlId="username">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="firstName" className="mt-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="lastName" className="mt-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditOwnerModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Empresas;
