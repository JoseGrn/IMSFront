import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Form, Badge } from 'react-bootstrap'; // Importar Bootstrap para los formularios, botones y badges
import Header from '../components/Header/Header';
import Swal from 'sweetalert2'; // Importar SweetAlert2 para los mensajes de confirmación
import '../styles/DetallesUsuario.css'; // Archivo CSS para los estilos

const DetallesUsuario = () => {
  const location = useLocation();
  const { user, productos, empresa } = location.state || {}; // Recibir la información del usuario, productos y empresa desde la navegación
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    username: user?.username || '',
    password: '', // Mantener en blanco para que el usuario lo ingrese
    name: user?.name || '',
    role: user?.role || '', // Aquí se almacena el rol en formValues
    productsIdList: user?.productsIdList || '',
    expirationDate: user?.expirationDate || '',
  });

  const [selectedProducts, setSelectedProducts] = useState([]); // Productos seleccionados
  const [expirationDate, setExpirationDate] = useState(user?.expirationDate || '');

  // Función para manejar el cambio en los productos seleccionados
  const handleSelectProduct = (e) => {
    const selectedProductId = e.target.value;

    // Verifica si el producto ya está en la lista de productos seleccionados
    if (!selectedProducts.includes(selectedProductId)) {
      const updatedSelectedProducts = [...selectedProducts, selectedProductId];
      setSelectedProducts((prevSelected) => [...prevSelected, selectedProductId]); // Agrega el nuevo producto a la lista existente
      setFormValues((prevState) => ({
        ...prevState,
        productsIdList: [...prevState.productsIdList.split(','), selectedProductId].join(','),
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

  // Formatear la fecha de expiración
  const formatExpirationDate = (date) => {
    const formattedDate = new Date(date);
    return formattedDate.toISOString().split('T')[0];
  };

  // Inicializa los productos seleccionados cuando el componente carga
  useEffect(() => {
    if (user) {
      setSelectedProducts(user.productsIdList?.split(',') || []); // Inicializa los productos que ya tenía el usuario
      setExpirationDate(formatExpirationDate(user.expirationDate)); // Formatear la fecha de expiración
    }
  }, [user]);

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Función para guardar cambios del usuario y regresar a la vista anterior
  const handleSaveUser = async () => {
    try {
      const response = await fetch('http://localhost:6001/api/User/editarusuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId, // Incluir el ID del usuario
          companyId: user.companyId, // Incluir el ID de la empresa
          ...formValues, // Enviar todos los valores del formulario
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar los cambios del usuario');
      }

      const updatedUsers = await response.json(); // Obtener lista actualizada de usuarios

      // Mostrar un mensaje de éxito usando SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado correctamente',
        showConfirmButton: false,
        timer: 1500,
      });

      // Redirigir a la vista anterior con la lista de usuarios actualizada
      navigate(`/empresa/${user.companyId}/usuarios`, { state: { empresa, usuarios: updatedUsers } });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Header />
      <div className="detalles-usuario-container">
        <h1>Editar Usuario</h1>
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
              placeholder="Ingresa la nueva contraseña"
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
              value={expirationDate}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Button variant="primary" onClick={handleSaveUser} className="mt-3">
            Guardar Cambios
          </Button>
        </Form>
      </div>
      <br></br>
    </div>
  );
};

export default DetallesUsuario;
