import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../components/Header/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../styles/OrdenCompraExam.css';

const OrdenCompraExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const NameUser = localStorage.getItem('name');
  const companyId = localStorage.getItem('companyId');
  const { productos, clientes, purchaseOrderId, orderState } = location.state || {};

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
        
        console.log(response)
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

  const handleGoBack = () => {
    navigate('/orden-compra');
  };

  const handleAutorizar = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Quieres autorizar esta orden de compra?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, autorizar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch(`https://api.maderasdelatlantico.com/api/PurchaseOrder/aceptarordencompra?purchaseOrderId=${purchaseOrderId}`, {
          method: 'POST'
        });

        console.log(purchaseOrderId)
  
        if (!response.ok) {
          throw new Error('Error al autorizar la orden de compra');
        }
  
        await Swal.fire({
          icon: 'success',
          title: 'Orden Autorizada',
          text: 'La orden de compra ha sido autorizada exitosamente.',
          confirmButtonText: 'Aceptar'
        });
  
        navigate('/orden-compra');
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al autorizar la orden de compra.',
          confirmButtonText: 'Aceptar'
        });
      }
    }
  };  

  const handleRechazar = async () => {
    const { value: reason } = await Swal.fire({
      title: '¿Estás seguro de rechazar esta orden?',
      input: 'text',
      inputPlaceholder: 'Ingresa la razón del rechazo...',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      preConfirm: (reason) => {
        if (!reason) {
          Swal.showValidationMessage('Por favor, ingresa una razón para el rechazo');
        }
        return reason;
      }
    });
  
    if (reason) {
      try {
        const response = await fetch(`https://api.maderasdelatlantico.com/api/PurchaseOrder/rechazarordencompra?purchaseOrderId=${purchaseOrderId}&reason=${encodeURIComponent(reason)}`, {
          method: 'POST'
        });
  
        console.log(purchaseOrderId, reason);
  
        if (!response.ok) {
          throw new Error('Error al rechazar la orden de compra');
        }
  
        await Swal.fire({
          icon: 'success',
          title: 'Orden Rechazada',
          text: 'La orden de compra ha sido rechazada exitosamente.',
          confirmButtonText: 'Aceptar'
        });
  
        navigate('/orden-compra');
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al rechazar la orden de compra.',
          confirmButtonText: 'Aceptar'
        });
      }
    }
  };  

  const handleEliminar = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Quieres eliminar esta orden de compra?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch(`https://api.maderasdelatlantico.com/api/PurchaseOrder/eliminarordencompra?purchaseOrderId=${purchaseOrderId}`, {
          method: 'DELETE'
        });

        console.log(purchaseOrderId)
  
        if (!response.ok) {
          throw new Error('Error al autorizar la orden de compra');
        }
  
        await Swal.fire({
          icon: 'success',
          title: 'Orden Eliminada',
          text: 'La orden de compra ha sido eliminada exitosamente.',
          confirmButtonText: 'Aceptar'
        });
  
        navigate('/orden-compra');
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al eliminar la orden de compra.',
          confirmButtonText: 'Aceptar'
        });
      }
    }
  };

  return (
    <div className="orden-compra-exam-container">
      <Header />
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Cargando orden de compra...</p>
        </div>
      )}
      <div className="orden-compra-exam-header">
        <button onClick={handleGoBack} className="orden-compra-exam-back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Regresar
        </button>
        <h1 className="orden-compra-exam-title">Examinar Orden de Compra</h1>
        {orderState === 1 ? (
            <button className="orden-compra-exam-delete-button" onClick={handleEliminar}>
              <FontAwesomeIcon icon={faTrash} /> Eliminar
            </button>
        ) : null}
      </div>
      <form>
        <div className="orden-compra-exam-form-group">
          <div className="orden-compra-exam-form-row">
            <div className="orden-compra-exam-form-col">
              <label>Número de Orden de Compra</label>
              <input type="text" value={formData.number} readOnly className="orden-compra-exam-input" />
            </div>
            <div className="orden-compra-exam-form-col">
              <label>Fecha y Hora Límite</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="date"
                  name="lastDate"
                  value={formData.lastDate}
                  readOnly
                  className="orden-compra-exam-input"
                />
                <input
                  type="time"
                  name="lastTime"
                  value={formData.lastTime}
                  readOnly
                  className="orden-compra-exam-input"
                />
              </div>
            </div>
          </div>
          <div className="orden-compra-exam-form-row">
            <div className="orden-compra-exam-form-col">
              <label>Cliente</label>
              <input type="text" value={formData.clientName} readOnly className="orden-compra-exam-input" />
            </div>
            <div className="orden-compra-exam-form-col">
              <label>Dirección</label>
              <input type="text" name="direction" value={formData.direction} readOnly className="orden-compra-exam-input" />
            </div>
          </div>
          <div className="orden-compra-exam-form-row">
            <div className="orden-compra-exam-form-col">
              <label>NIT</label>
              <input type="text" name="nit" value={formData.nit} readOnly className="orden-compra-exam-input" />
            </div>
            <div className="orden-compra-exam-form-col">
              <label>Proveedor</label>
              <input type="text" value="Maderas del Atlantico S.A." readOnly className="orden-compra-exam-input" />
            </div>
          </div>
          <div className="orden-compra-exam-form-row">
            <div className="orden-compra-exam-form-col">
              <label>Vendedor</label>
              <input type="text" value={NameUser} readOnly className="orden-compra-exam-input" />
            </div>
            <div className="orden-compra-exam-form-col">
              <label>Semana</label>
              <input
                type="number"
                name="weekend"
                value={formData.weekend}
                readOnly
                className="orden-compra-exam-input"
              />
            </div>
          </div>
          <div className="orden-compra-exam-form-row">
            <div className="orden-compra-exam-form-col">
              <label>Descripción</label>
              <textarea name="description" value={formData.description} readOnly className="orden-compra-exam-textarea" />
            </div>
          </div>
        </div>

        <h3>Lista de Productos</h3>
        <table className="orden-compra-exam-products-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Especie</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
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
                  <td>{selectedProduct?.name || ''}</td>
                  <td>{species}</td>
                  <td>{fila.productQuantity}</td>
                  <td>{price}</td>
                  <td>{subtotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="orden-compra-exam-total-section">
          <p>Subtotal 1: {formData.subTotal1.toFixed(2)}</p>
          <p>Subtotal 2: {formData.subTotal2.toFixed(2)}</p>
          <p>Total: {formData.amount.toFixed(2)}</p>
        </div>

        <div className="orden-compra-exam-button-group">
          {orderState === 1 ? (
              <button type="button" onClick={handleAutorizar} className="orden-compra-exam-authorize-button">Autorizar</button>
          ) : null}
          {orderState === 1 ? (
              <button type="button" onClick={handleRechazar} className="orden-compra-exam-reject-button">Rechazar</button>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default OrdenCompraExam;
