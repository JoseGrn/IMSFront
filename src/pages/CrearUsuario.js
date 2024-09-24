import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Form, Badge } from 'react-bootstrap'; // Importar Bootstrap para los formularios, botones y badges
import Header from '../components/Header/Header';
import Swal from 'sweetalert2'; // Importar SweetAlert2 para los mensajes de confirmación
import '../styles/DetallesUsuario.css'; // Archivo CSS para los estilos

const CrearUsuario = () => {
  const location = useLocation();
  const { productos, empresa } = location.state || {}; // Recibir la información de los productos y empresa desde la navegación
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    username: '',
    password: '', // Mantener en blanco para que el usuario lo ingrese
    name: '',
    role: '', // Aquí se almacena el rol en formValues
    productsIdList: '',
    expirationDate: '', // Agregar expirationDate aquí
  });

  const [selectedProducts, setSelectedProducts] = useState([]); // Productos seleccionados

  // Función para manejar el cambio en los productos seleccionados
  const handleSelectProduct = (e) => {
    const selectedProductId = e.target.value;

    // Verifica si el producto ya está en la lista de productos seleccionados
    if (!selectedProducts.includes(selectedProductId)) {
      const updatedSelectedProducts = [...selectedProducts, selectedProductId];
      setSelectedProducts(updatedSelectedProducts); // Agrega el nuevo producto a la lista existente

      // Actualiza el campo productsIdList en el estado formValues sin la coma inicial
      setFormValues((prevState) => ({
        ...prevState,
        productsIdList: updatedSelectedProducts.join(','), // Asegurarse de que no haya una coma inicial
      }));
      console.log("Productos seleccionados actualizados:", updatedSelectedProducts);
    }
  };

  const handleRemoveProduct = (productIdToRemove) => {
    const updatedProducts = selectedProducts.filter(
      (productId) => productId !== productIdToRemove
    );

    setSelectedProducts(updatedProducts); // Actualiza la lista de productos sin el eliminado
    setFormValues((prevState) => ({
      ...prevState,
      productsIdList: updatedProducts.join(','), // Actualiza el campo de productos seleccionados
    }));
  };

  // Función para cambiar el rol directamente en formValues
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormValues((prevState) => ({
      ...prevState,
      role: newRole, // Actualiza el rol dentro de formValues
    }));
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Función para manejar cambios específicos de la fecha de expiración
  const handleExpirationDateChange = (e) => {
    const { value } = e.target;
    setFormValues((prevState) => ({
      ...prevState,
      expirationDate: value, // Asignar directamente la fecha seleccionada
    }));
  };

  // Función para crear un nuevo usuario y regresar a la vista anterior
  const handleSaveUser = async () => {
    try {
      const response = await fetch('http://localhost:6001/api/User/crearuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: empresa.companyId, // Incluir el ID de la empresa
          ...formValues, // Enviar todos los valores del formulario
        }),
      });

      console.log(response);

      if (!response.ok) {
        throw new Error('Error al crear el usuario');
      }

      const updatedUsers = await response.json(); // Obtener lista actualizada de usuarios

      // Mostrar un mensaje de éxito usando SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Usuario creado correctamente',
        showConfirmButton: false,
        timer: 1500,
      });

      // Redirigir a la vista anterior con la lista de usuarios actualizada
      navigate(`/empresa/${empresa.companyId}/usuarios`, { state: { empresa, usuarios: updatedUsers } });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Header />
      <div className="detalles-usuario-container">
        <h1>Crear Usuario</h1>
        <Form>
          <Form.Group controlId="username">
            <Form.Label>Nombre de Usuario</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formValues.username}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre de usuario"
              required
            />
          </Form.Group>

          <Form.Group controlId="password" className="mt-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleInputChange}
              placeholder="Ingresa la contraseña"
              required
            />
          </Form.Group>

          <Form.Group controlId="name" className="mt-3">
            <Form.Label>Nombre Completo</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre completo"
            />
          </Form.Group>

          {/* Lista desplegable para el rol */}
          <Form.Group controlId="role" className="mt-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select value={formValues.role} onChange={handleRoleChange}>
              <option value="">Selecciona un rol</option>
              <option value="1">Admin</option>
              <option value="2">Empleado</option>
              <option value="3">Cliente</option>
              <option value="4">Visitante</option>
            </Form.Select>
          </Form.Group>

          {/* Mostrar productos seleccionados */}
          <div className="selected-products mt-3">
            <h5>Productos Seleccionados:</h5>
            {selectedProducts.length > 0 ? (
              selectedProducts.map((productId) => {
                const product = productos.find((p) => p.productId === parseInt(productId));
                return (
                  <Badge key={productId} pill bg="primary" className="me-2">
                    {product?.name}
                    <span
                      className="remove-product ms-2"
                      onClick={() => handleRemoveProduct(productId)}
                      style={{ cursor: 'pointer', color: 'red' }}
                    >
                      x
                    </span>
                  </Badge>
                );
              })
            ) : (
              <p>No hay productos seleccionados</p>
            )}
          </div>

          {/* Lista desplegable para seleccionar productos */}
          <Form.Group controlId="productsIdList" className="mt-3">
            <Form.Label>Lista de Productos</Form.Label>
            <Form.Control
              as="select"
              onChange={handleSelectProduct}
              value="" // Siempre vacía para permitir seleccionar múltiples productos
            >
              <option value="">Selecciona un producto</option>
              {productos.map((producto) => (
                <option key={producto.productId} value={producto.productId}>
                  {producto.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="expirationDate" className="mt-3">
            <Form.Label>Fecha de Expiración</Form.Label>
            <Form.Control
              type="date"
              name="expirationDate"
              value={formValues.expirationDate} // Refleja el estado actual en el campo
              onChange={handleExpirationDateChange} // Actualizar el valor de expirationDate
            />
          </Form.Group>

          <Button variant="primary" onClick={handleSaveUser} className="mt-3">
            Crear Usuario
          </Button>
        </Form>
      </div>
      <br></br>
    </div>
  );
};

export default CrearUsuario;
