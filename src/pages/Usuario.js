import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirigir
import Header from '../components/Header/Header'; // Importar el Header
import { Modal, Button, Form } from 'react-bootstrap'; // Importar los componentes de modal y form
import Swal from 'sweetalert2'; // Importar SweetAlert2
import '../styles/Usuario.css'; // Importar el CSS

const Usuario = () => {
  const [productos, setProductos] = useState([]); // Estado para almacenar la lista de productos
  const [productosname, setProductosName] = useState([]); // Estado para almacenar la lista de productos
  const [addition, setAddition] = useState(''); // Para manejar la adición
  const [subtraction, setSubtraction] = useState(''); // Para manejar la sustracción
  const [error, setError] = useState(''); // Estado para manejar errores
  const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal
  const [selectedProduct, setSelectedProduct] = useState(null); // Producto seleccionado para editar
  const [newQuantity, setNewQuantity] = useState(''); // Nueva cantidad editable
  const [role, setRole] = useState(0); // Estado para almacenar el rol del usuario
  const [empresa, setEmpresa] = useState(null); // Estado para almacenar la información de la empresa

  const navigate = useNavigate(); // Para redirigir a otras páginas

  // Obtener el productsIdList, companyId y role desde localStorage
  const productsIdList = localStorage.getItem('productsIdList');
  const companyId = localStorage.getItem('companyId');
  const userRole = localStorage.getItem('role'); // Obtener el rol del usuario

  // Función para obtener la lista de productos
  const obtenerProductos = async () => {
    try {
      const response = await fetch(`http://ec2-18-117-218-240.us-east-2.compute.amazonaws.com:6001/api/Product/obtenerlistaproductos?productos=${productsIdList}&companyId=${companyId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener la lista de productos');
      }

      const data = await response.json();
      setProductos(data); // Guardar los productos obtenidos en el estado
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para obtener la información de la empresa si el usuario tiene Role 1
  const obtenerEmpresa = async () => {
    try {
      const response = await fetch(`http://ec2-18-117-218-240.us-east-2.compute.amazonaws.com:6001/api/Company/obtenerempresasbyid?companyId=${companyId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener la información de la empresa');
      }

      const data = await response.json();
      setEmpresa(data); // Guardar la información de la empresa
    } catch (error) {
      setError(error.message);
    }
  };

  const obtenerProductosNombres = async () => {
    try {
      console.log(empresa.companyId)
      const response = await fetch(`http://ec2-18-117-218-240.us-east-2.compute.amazonaws.com:6001/api/Product/obtenerproductosnombres?companyId=${empresa.companyId}`);

      if (!response.ok) {
        throw new Error('Error al obtener los nombres de productos');
      }
      console.log(response)

      const data = await response.json();
      setProductosName(data); // Guardar los nombres de productos en el estado
    } catch (error) {
      setError(error.message);
    }
  };

  // useEffect para hacer las llamadas al API cuando se carga la página
  useEffect(() => {
    obtenerProductos();
    setRole(parseInt(userRole)); // Guardar el rol del usuario desde localStorage

    // Si el usuario tiene Role 1, obtener la información de la empresa
    if (parseInt(userRole) === 1) {
      obtenerEmpresa();
    }
  }, [userRole]);

  useEffect(() => {
    // Verificar si empresa está disponible antes de llamar a obtenerProductosNombres
    if (empresa) {
      obtenerProductosNombres();
    }
  }, [empresa]);

  // Función para abrir el modal y seleccionar un producto
  const handleOpenModal = (producto) => {
    setSelectedProduct({ ...producto, productId: producto.productId || producto.id }); // Verificar si el producto tiene 'productId' o 'id'
    setNewQuantity(producto.quantity); // Inicializar la cantidad con el valor actual
    setShowModal(true); // Mostrar el modal
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false); // Cierra el modal
    setSelectedProduct(null); // Limpia el producto seleccionado
    setNewQuantity(''); // Reinicia la cantidad
    setAddition(''); // Reinicia el valor de adición
    setSubtraction(''); // Reinicia el valor de sustracción
  };  

  // Función para guardar la cantidad modificada
  const handleSaveQuantity = async () => {
    if (!selectedProduct || (!addition && !subtraction)) {
      setError("Debe ingresar una adición o sustracción para modificar la cantidad");
      return;
    }
  
    // Calcula la nueva cantidad aplicando la adición y la sustracción
    let updatedQuantity = parseInt(newQuantity, 10) || 0;
  
    if (addition) {
      updatedQuantity += parseInt(addition, 10); // Sumar la cantidad ingresada
    }
  
    if (subtraction) {
      updatedQuantity -= parseInt(subtraction, 10); // Restar la cantidad ingresada
    }
  
    if (updatedQuantity < 0) {
      setError("La cantidad resultante no puede ser negativa.");
      return;
    }

    console.log(updatedQuantity)

    try {
      const url = `http://ec2-18-117-218-240.us-east-2.compute.amazonaws.com:6001/api/Product/modificarcantidad?cantidad=${updatedQuantity}&productId=${selectedProduct.productId}&companyId=${companyId}&listaProductos=${productsIdList}`;

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
      handleCloseModal()
      setShowModal(false); // Cerrar el modal

      Swal.fire({
        icon: 'success',
        title: 'Producto actualizado correctamente',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para redirigir a la vista de orden de compra
  const handleCreateOrder = () => {
    navigate('/orden-compra');
  };

  // Función para redirigir a la vista de envio
  const handleCreateShipment = () => {
    navigate('/envio');
  };

  const handleUsuariosClick = () => {
    navigate(`/usuario/${empresa.companyId}/usuarios`, { state: { empresa } });
  };

  const handleProductosClick = () => {
    // Redirigir a la vista de productos, pasando la información de la empresa
    navigate(`/empresa/${companyId}/productos`, { state: { empresa } });
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
                <p><strong>Cantidad actual:</strong> {newQuantity}</p>
                <Form>
                  <Form.Group controlId="cantidad">
                    <div className="quantity-controls">
                      {/* Campo para adición */}
                      <Form.Group controlId="addition" className="mt-2">
                        <Form.Label>Agregar:</Form.Label>
                        <Form.Control
                          type="number"
                          value={addition}
                          onChange={(e) => setAddition(e.target.value)}
                          min="0"
                        />
                      </Form.Group>

                      {/* Campo para sustracción */}
                      <Form.Group controlId="subtraction" className="mt-2">
                        <Form.Label>Eliminar:</Form.Label>
                        <Form.Control
                          type="number"
                          value={subtraction}
                          onChange={(e) => setSubtraction(e.target.value)}
                          min="0"
                        />
                      </Form.Group>
                    </div>
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
              <p>No tienes permiso para modificar este producto.</p>
            )}
          </Modal.Footer>
        </Modal>

        {/* Botones en la parte inferior derecha */}
        <div className="buttons-container">
          {role === 1 ?(
            <Button variant="success" onClick={handleUsuariosClick} className="create-shipment-button">
                Modificar Usuarios
            </Button>
          ) : null}
          {role === 1 ?(
            <Button variant="success" onClick={handleProductosClick} className="create-shipment-button">
                Modificar Productos
            </Button>
          ) : null}
          {role === 1 || role === 2 || role === 3 ? (
            <Button variant="success" onClick={handleCreateOrder} className="create-shipment-button">
              Crear Orden de Compra
            </Button>
          ) : null}
          {role === 1 || role === 2 ? (
            <Button variant="success" onClick={handleCreateShipment} className="create-shipment-button">
              Crear Envío
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Usuario;
