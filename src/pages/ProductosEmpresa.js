import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import Header from '../components/Header/Header';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import '../styles/ProductosEmpresa.css'; // Crear un nuevo archivo CSS para los estilos

const ProductosEmpresa = () => {
  const location = useLocation();
  const { empresa } = location.state || {}; // Recibir la información de la empresa
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // Controlar la visibilidad del modal para editar
  const [showAddModal, setShowAddModal] = useState(false); // Controlar la visibilidad del modal para agregar
  const [editProduct, setEditProduct] = useState(null); // Estado para el producto que se va a editar
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    minQuantity: 0,
    quantity: 0,
    specie: '',
    price: 0,
  }); // Estado para almacenar los datos del formulario

  // Función para obtener los productos de la empresa
  const obtenerProductos = async () => {
    try {
      const response = await fetch(`https://api.maderasdelatlantico.com/api/Product/obtenerproductosgeneral?companyId=${empresa.companyId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener los productos de la empresa');
      }

      const data = await response.json();
      setProductos(data); // Guardar los productos en el estado
    } catch (error) {
      setError(error.message);
    }
  };

  // useEffect para hacer la llamada al API cuando se carga la página
  useEffect(() => {
    obtenerProductos();
  }, []);

  // Función para abrir el modal y cargar los valores del producto seleccionado
  const handleOpenModal = (producto) => {
    setEditProduct(producto); // Guardar el producto que se va a editar
    setFormValues({
      name: producto.name,
      description: producto.description,
      minQuantity: producto.minQuantity,
      quantity: producto.quantity,
      specie: producto.specie,
      price: producto.price,
    });
    setShowModal(true); // Mostrar el modal
  };

  // Función para abrir el modal de agregar producto
  const handleOpenAddModal = () => {
    setFormValues({
      name: '',
      description: '',
      minQuantity: 0,
      quantity: 0,
      specie: '',
      price: 0,
    });
    setShowAddModal(true); // Mostrar el modal de agregar producto
  };

  // Función para cerrar los modales
  const handleCloseModal = () => {
    setShowModal(false);
    setShowAddModal(false); // Cerrar también el modal de agregar
    setEditProduct(null); // Limpiar el producto seleccionado
  };

  // Función para manejar los cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Función para guardar los cambios en el producto
  const handleSaveProduct = async () => {
    try {
      const response = await fetch('https://api.maderasdelatlantico.com/api/Product/editarproducto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: empresa.companyId,
          productId: editProduct.productId,
          ...formValues, // Incluir todos los valores editados en el cuerpo del JSON
        }),
      });

      if (!response.ok) {
        throw new Error('Error al editar el producto');
      }

      const updatedProducts = await response.json();
      setProductos(updatedProducts); // Actualizar la lista de productos con los nuevos datos

      // Mostrar SweetAlert de éxito
      Swal.fire({
        icon: 'success',
        title: 'Producto editado correctamente',
        showConfirmButton: false,
        timer: 1500
      });

      handleCloseModal(); // Cerrar el modal después de guardar
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para eliminar un producto
  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(`https://api.maderasdelatlantico.com/api/Product/eliminarproducto?productId=${editProduct.productId}&companyId=${empresa.companyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      const updatedProducts = await response.json();
      setProductos(updatedProducts); // Actualizar la lista de productos

      // Mostrar SweetAlert de éxito
      Swal.fire({
        icon: 'success',
        title: 'Producto eliminado correctamente',
        showConfirmButton: false,
        timer: 1500
      });

      handleCloseModal(); // Cerrar el modal después de eliminar
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para confirmar la eliminación de un producto
  const confirmDeleteProduct = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción eliminará el producto.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteProduct(); // Llamar a la función de eliminación si se confirma
      }
    });
  };

  // Función para agregar un nuevo producto
  const handleAddProduct = async () => {
    try {
      const response = await fetch('https://api.maderasdelatlantico.com/api/Product/crearproducto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: empresa.companyId,
          ...formValues, // Incluir los valores del nuevo producto
        }),
      });

      if (!response.ok) {
        throw new Error('Error al agregar el producto');
      }

      const updatedProducts = await response.json();
      setProductos(updatedProducts); // Actualizar la lista de productos con los nuevos datos

      // Mostrar SweetAlert de éxito
      Swal.fire({
        icon: 'success',
        title: 'Producto agregado correctamente',
        showConfirmButton: false,
        timer: 1500
      });

      handleCloseModal(); // Cerrar el modal después de guardar
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <Header />
      <div className="productos-empresa-container">
        {/* Botón "Regresar" */}
        <button onClick={() => window.history.back()} className="back-button">
          Regresar
        </button>
        
        <h1>Productos de {empresa.name}</h1>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {productos.length > 0 ? (
          <div className="productos-list-horizontal">
            {productos.map((producto) => (
              <div key={producto.productId} className="producto-item-horizontal" onClick={() => handleOpenModal(producto)}>
                <h3>{producto.name}</h3>
                <p><strong>Cantidad disponible:</strong> {producto.quantity}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay productos disponibles para esta empresa.</p>
        )}

        {/* Botón para agregar un nuevo producto */}
        <button className="add-product-button" onClick={handleOpenAddModal}>
          Agregar Producto
        </button>

        {/* Modal para editar un producto */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Producto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {/* Formulario de edición */}
              <Form.Group controlId="name">
                <Form.Label>Nombre del Producto</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  placeholder="Ingresa el nombre del producto"
                />
              </Form.Group>

              <Form.Group controlId="description" className="mt-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formValues.description}
                  onChange={handleInputChange}
                  placeholder="Ingresa la descripción"
                />
              </Form.Group>

              <Form.Group controlId="minQuantity" className="mt-3">
                <Form.Label>Cantidad Mínima</Form.Label>
                <Form.Control
                  type="number"
                  name="minQuantity"
                  value={formValues.minQuantity}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Cantidad mínima"
                />
              </Form.Group>

              <Form.Group controlId="quantity" className="mt-3">
                <Form.Label>Cantidad Disponible</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formValues.quantity}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Cantidad disponible"
                />
              </Form.Group>

              <Form.Group controlId="specie" className="mt-3">
                <Form.Label>Especie</Form.Label>
                <Form.Control
                  type="text"
                  name="specie"
                  value={formValues.specie}
                  onChange={handleInputChange}
                  placeholder="Ingresa la especie"
                />
              </Form.Group>

              <Form.Group controlId="price" className="mt-3">
                <Form.Label>Precio</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formValues.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Precio del producto"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={confirmDeleteProduct}>
              Eliminar Producto
            </Button>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveProduct}>
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para agregar un nuevo producto */}
        <Modal show={showAddModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Agregar Producto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {/* Formulario para agregar */}
              <Form.Group controlId="name">
                <Form.Label>Nombre del Producto</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  placeholder="Ingresa el nombre del producto"
                />
              </Form.Group>

              <Form.Group controlId="description" className="mt-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formValues.description}
                  onChange={handleInputChange}
                  placeholder="Ingresa la descripción"
                />
              </Form.Group>

              <Form.Group controlId="minQuantity" className="mt-3">
                <Form.Label>Cantidad Mínima</Form.Label>
                <Form.Control
                  type="number"
                  name="minQuantity"
                  value={formValues.minQuantity}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Cantidad mínima"
                />
              </Form.Group>

              <Form.Group controlId="quantity" className="mt-3">
                <Form.Label>Cantidad Disponible</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={formValues.quantity}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Cantidad disponible"
                />
              </Form.Group>

              <Form.Group controlId="specie" className="mt-3">
                <Form.Label>Especie</Form.Label>
                <Form.Control
                  type="text"
                  name="specie"
                  value={formValues.specie}
                  onChange={handleInputChange}
                  placeholder="Ingresa la especie"
                />
              </Form.Group>

              <Form.Group controlId="price" className="mt-3">
                <Form.Label>Precio</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formValues.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Precio del producto"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleAddProduct}>
              Guardar Producto
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ProductosEmpresa;
