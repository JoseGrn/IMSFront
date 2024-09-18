import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header'; // Importar el Header
import { Modal, Button, Form } from 'react-bootstrap'; // Importar los componentes de modal y form
import '../styles/Usuario.css'; // Importar el CSS

const Usuario = () => {
  const [productos, setProductos] = useState([]); // Estado para almacenar la lista de productos
  const [error, setError] = useState(''); // Estado para manejar errores
  const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal
  const [selectedProduct, setSelectedProduct] = useState(null); // Producto seleccionado para editar
  const [newQuantity, setNewQuantity] = useState(''); // Nueva cantidad editable
  const [role, setRole] = useState(0); // Estado para almacenar el rol del usuario

  // Obtener el productsIdList, companyId y role desde localStorage
  const productsIdList = localStorage.getItem('productsIdList');
  const companyId = localStorage.getItem('companyId');
  const userRole = localStorage.getItem('role'); // Obtener el rol del usuario

  // Función para obtener la lista de productos
  const obtenerProductos = async () => {
    try {
      const response = await fetch(`http://localhost:6001/api/Product/obtenerlistaproductos?productos=${productsIdList}&companyId=${companyId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener la lista de productos');
      }

      const data = await response.json();
      setProductos(data); // Guardar los productos obtenidos en el estado
    } catch (error) {
      setError(error.message);
    }
  };

  // useEffect para hacer la llamada al API cuando se carga la página
  useEffect(() => {
    obtenerProductos();
    setRole(parseInt(userRole)); // Guardar el rol del usuario desde localStorage
  }, [userRole]);

  // Función para abrir el modal y seleccionar un producto
  const handleOpenModal = (producto) => {
    setSelectedProduct({ ...producto, productId: producto.productId || producto.id }); // Verificar si el producto tiene 'productId' o 'id'
    setNewQuantity(producto.quantity); // Inicializar la cantidad con el valor actual
    setShowModal(true); // Mostrar el modal
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false); // Cerrar el modal
    setSelectedProduct(null); // Limpiar el producto seleccionado
  };

  // Función para guardar la cantidad modificada
  const handleSaveQuantity = async () => {
    if (!selectedProduct || !newQuantity) {
      setError("Debe seleccionar un producto y asignar una cantidad");
      return;
    }

    try {
      const url = `http://localhost:6001/api/Product/modificarcantidad?cantidad=${newQuantity}&productId=${selectedProduct.productId}&companyId=${companyId}&listaProductos=${productsIdList}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Especificar el tipo de contenido
        }
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Error al modificar la cantidad del producto');
      }

      const updatedProducts = await response.json(); // Obtener la lista actualizada de productos
      setProductos(updatedProducts); // Actualizar el estado con la nueva lista de productos
      setShowModal(false); // Cerrar el modal
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <Header />
      <div className="usuario-container">
        <h1>Productos Asignados</h1>
        
        {error && <p style={{ color: 'red' }}>Error: {error}</p>} {/* Mostrar error si ocurre */}

        {productos.length > 0 ? (
          <div className="productos-list-horizontal">
            {productos.map((producto, index) => (
              <div key={index} className="producto-item-horizontal" onClick={() => handleOpenModal(producto)}>
                <h3>{producto.name}</h3>
                <p><strong>Cantidad disponible:</strong> {producto.quantity}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No tienes productos asignados.</p>
        )}

        {/* Modal para editar la cantidad del producto */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Modificar Cantidad</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct && (
              <>
                <h3>{selectedProduct.name}</h3>
                <p>{selectedProduct.description}</p>
                <Form>
                  <Form.Group controlId="cantidad">
                    <Form.Label>Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      min="0"
                      disabled={role !== 1 && role !== 2} // Desactivar el campo si el rol no es 1 o 2
                    />
                  </Form.Group>
                </Form>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            {role === 1 || role === 2 ? (
              <Button variant="primary" onClick={handleSaveQuantity}>
                Guardar Cambios
              </Button>
            ) : (
              <p>No tienes permiso para modificar este producto.</p> // Mostrar mensaje si el rol no es 1 o 2
            )}
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Usuario;
