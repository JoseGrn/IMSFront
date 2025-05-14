import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../components/Header/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../styles/OrdenCompraEdit.css';

const OrdenCompraEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const NameUser = localStorage.getItem('name');
  const companyId = localStorage.getItem('companyId');
  const { productos, clientes, purchaseOrderId } = location.state || {};

  const [formData, setFormData] = useState({
    amount: 0,
    clientName: '',
    quantity: 0,
    number: '',
    creationDate: '',
    direction: '',
    nit: '',
    lastDate: '',
    lastTime: '12:00',
    supplier: 'Maderas del Atlantico S.A.',
    seller: NameUser || '',
    description: '',
    subTotal1: 0,
    subTotal2: 0,
    weekend: 0,
    state: 1,
    messageState: 'Pendiente',
    reason: 'No issues',
    companyId: parseInt(companyId, 10),
    clientId: null,
    listaProductos: []
  });

  const [filasProductos, setFilasProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.maderasdelatlantico.com/api/PurchaseOrder/purchaseorderbyid?purchaseOrderId=${purchaseOrderId}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener la orden de compra');
        }

        const data = await response.json();
        setFormData({
          ...formData,
          number: data.number,
          direction: data.direction,
          nit: data.nit,
          lastDate: data.lastDate.split('T')[0],
          lastTime: data.lastDate.split('T')[1]?.slice(0, 5) || '12:00',
          description: data.description,
          subTotal1: data.subTotal1,
          subTotal2: data.subTotal2,
          weekend: data.weekend,
          clientId: data.clientId,
          clientName: clientes.find(client => client.userId === data.clientId)?.name || '',
          listaProductos: data.listaProductos
        });

        setFilasProductos(data.listaProductos.map(item => ({
          id: Date.now() + item.productId,
          productId: item.productId,
          productQuantity: item.productQuantity
        })));
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al cargar la orden de compra',
          confirmButtonText: 'Aceptar'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [purchaseOrderId, clientes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClientChange = (e) => {
    const selectedClientId = parseInt(e.target.value, 10);
    const selectedClient = clientes.find((client) => client.userId === selectedClientId);
    setFormData({ ...formData, clientId: selectedClientId, clientName: selectedClient?.name });
  };

  const handleProductChange = (index, productId) => {
    const updatedFilas = [...filasProductos];
    updatedFilas[index].productId = parseInt(productId, 10);
    updatedFilas[index].productQuantity = 1;
    setFilasProductos(updatedFilas);

    calcularTotales(updatedFilas);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedFilas = [...filasProductos];
    updatedFilas[index].productQuantity = quantity;
    setFilasProductos(updatedFilas);

    calcularTotales(updatedFilas);
  };

  const calcularTotales = (filas) => {
    let subTotal1 = 0;
    let totalQuantity = 0;

    filas.forEach((fila) => {
      const selectedProduct = productos.find((product) => product.productId === fila.productId);
      const price = selectedProduct ? selectedProduct.price : 0;
      const subtotal = price * fila.productQuantity;

      subTotal1 += subtotal;
      totalQuantity += fila.productQuantity;
    });

    setFormData({ ...formData, subTotal1, subTotal2: subTotal1, amount: subTotal1, quantity: totalQuantity });
  };

  const agregarFilaProducto = () => {
    setFilasProductos([
      ...filasProductos,
      { id: Date.now(), productId: null, productQuantity: 1 }
    ]);
  };

  const eliminarFilaProducto = (index) => {
    const updatedFilas = filasProductos.filter((_, i) => i !== index);
    setFilasProductos(updatedFilas);

    calcularTotales(updatedFilas);
  };

  const handleGoBack = () => {
    navigate('/orden-compra');
  };

  const handleSubmit = async () => {
    setLoading(true);
    const purchaseOrderUpdate = {
        purchaseOrderId: purchaseOrderId, // ID de la orden de compra que estamos editando
        amount: formData.amount,
        clientName: formData.clientName,
        quantity: formData.quantity,
        direction: formData.direction,
        nit: formData.nit,
        lastDate: `${formData.lastDate}T${formData.lastTime}:00`,
        supplier: formData.supplier,
        seller: formData.seller,
        description: formData.description,
        subTotal1: formData.subTotal1,
        subTotal2: formData.subTotal2,
        weekend: parseInt(formData.weekend, 10),
        clientId: formData.clientId,
        companyId: formData.companyId,
        listaProductos: filasProductos.map((fila) => {
            const selectedProduct = productos.find((product) => product.productId === fila.productId);
            return {
                productId: fila.productId,
                productName: selectedProduct ? selectedProduct.name : '',
                unitPrice: selectedProduct ? selectedProduct.price : 0,
                productQuantity: fila.productQuantity
            };
        })
    };

    try {
        const response = await fetch('https://api.maderasdelatlantico.com/api/PurchaseOrder/editarpurchaseorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(purchaseOrderUpdate)
        });
        console.log(response)
        if (!response.ok) {
            throw new Error('Error al actualizar la orden de compra');
        }

        const result = await response.json();
        console.log('Orden de compra actualizada:', result);

        // Mostrar SweetAlert de éxito
        Swal.fire({
            icon: 'success',
            title: 'Orden actualizada',
            text: 'La orden de compra se actualizó exitosamente',
            timer: 2000,
            showConfirmButton: false
        });

        navigate('/orden-compra');
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al actualizar la orden de compra',
            confirmButtonText: 'Aceptar'
        });
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="orden-compra-crear-container">
      <Header />
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Cargando orden de compra...</p>
        </div>
      )}
      <div className="orden-compra-crear-header">
        <button onClick={handleGoBack} className="orden-compra-crear-back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Regresar
        </button>
        <h1 className="orden-compra-crear-title">Editar Orden de Compra</h1>
      </div>
      <form>
        <div className="orden-compra-crear-form-group">
          <div className="orden-compra-crear-form-row">
            <div className="orden-compra-crear-form-col">
              <label>Número de Orden de Compra</label>
              <input type="text" value={formData.number} readOnly className="orden-compra-crear-input" />
            </div>
            <div className="orden-compra-crear-form-col">
              <label>Fecha y Hora Límite</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="date"
                  name="lastDate"
                  value={formData.lastDate}
                  onChange={handleInputChange}
                  className="orden-compra-crear-input"
                />
                <input
                  type="time"
                  name="lastTime"
                  value={formData.lastTime}
                  onChange={handleInputChange}
                  className="orden-compra-crear-input"
                />
              </div>
            </div>
          </div>
          <div className="orden-compra-crear-form-row">
            <div className="orden-compra-crear-form-col">
              <label>Cliente</label>
              <select value={formData.clientId || ''} onChange={handleClientChange} className="orden-compra-crear-select">
                <option value="" disabled>Seleccione un cliente</option>
                {clientes.map((client) => (
                  <option key={client.userId} value={client.userId}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="orden-compra-crear-form-col">
              <label>Dirección</label>
              <input type="text" name="direction" value={formData.direction} onChange={handleInputChange} className="orden-compra-crear-input" />
            </div>
          </div>
          <div className="orden-compra-crear-form-row">
            <div className="orden-compra-crear-form-col">
              <label>NIT</label>
              <input type="text" name="nit" value={formData.nit} onChange={handleInputChange} className="orden-compra-crear-input" />
            </div>
            <div className="orden-compra-crear-form-col">
              <label>Proveedor</label>
              <input type="text" value="Maderas del Atlantico S.A." readOnly className="orden-compra-crear-input" />
            </div>
          </div>
          <div className="orden-compra-crear-form-row">
            <div className="orden-compra-crear-form-col">
              <label>Vendedor</label>
              <input type="text" value={NameUser} readOnly className="orden-compra-crear-input" />
            </div>
            <div className="orden-compra-crear-form-col">
              <label>Semana</label>
              <input
                type="number"
                name="weekend"
                value={formData.weekend}
                onChange={handleInputChange}
                className="orden-compra-crear-input"
              />
            </div>
          </div>
          <div className="orden-compra-crear-form-row">
            <div className="orden-compra-crear-form-col">
              <label>Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="orden-compra-crear-textarea" />
            </div>
          </div>
        </div>

        <h3>Lista de Productos</h3>
        <table className="orden-compra-crear-products-table">
          <thead>
            <tr>
              <th>Acción</th>
              <th>Producto</th>
              <th>Especie</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
              <th>+</th>
            </tr>
          </thead>
          <tbody>
            {filasProductos.map((fila, index) => {
              const selectedProduct = productos.find((product) => product.productId === fila.productId);
              const price = selectedProduct ? selectedProduct.price : 0;
              const species = selectedProduct ? selectedProduct.specie : '';
              const subtotal = price * fila.productQuantity;

              return (
                <tr key={fila.id}>
                  <td>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => eliminarFilaProducto(index)}
                        className="orden-compra-crear-remove-button"
                        style={{
                          backgroundColor: "red",
                          border: "none",
                          color: "white",
                          padding: "5px",
                          borderRadius: "5px",
                          cursor: "pointer"
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </td>
                  <td>
                    <select
                      value={fila.productId || ""}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="orden-compra-crear-select"
                    >
                      <option value="" disabled>Seleccione un producto</option>
                      {productos.map((product) => (
                        <option key={product.productId} value={product.productId}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{species}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={fila.productQuantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                      className="orden-compra-crear-input"
                    />
                  </td>
                  <td>{price}</td>
                  <td>{subtotal.toFixed(2)}</td>
                  <td>
                    {index === filasProductos.length - 1 && (
                      <button
                        type="button"
                        onClick={agregarFilaProducto}
                        className="orden-compra-crear-add-button"
                      >
                        +
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="orden-compra-crear-total-section">
          <p>Subtotal 1: {formData.subTotal1.toFixed(2)}</p>
          <p>Subtotal 2: {formData.subTotal2.toFixed(2)}</p>
          <p>Total: {formData.amount.toFixed(2)}</p>
        </div>

        <button type="button" onClick={handleSubmit} className="orden-compra-crear-submit-button">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default OrdenCompraEdit;
