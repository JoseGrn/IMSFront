import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import '../styles/OrdenCompra.css';
import Swal from 'sweetalert2';

const OrdenCompra = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ultimaOrdenCompra, setUltimaOrdenCompra] = useState(''); // Estado para la última orden de compra
  const [error, setError] = useState('');
  
  const companyId = localStorage.getItem('companyId');
  const productsIdList = localStorage.getItem('productsIdList');
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const obtenerProductos = async () => {
    try {
      const response = await fetch(`https://api.maderasdelatlantico.com/api/Product/obtenerlistaproductos?productos=${productsIdList}&companyId=${companyId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener la lista de productos');
      }

      const data = await response.json();
      setProductos(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const obtenerClientes = async () => {
    try {
      const response = await fetch(`https://api.maderasdelatlantico.com/api/User/getclientes?companyId=${companyId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener la lista de clientes');
      }

      const data = await response.json();
      setClientes(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch(`https://api.maderasdelatlantico.com/api/PurchaseOrder/obtenerallpurchaseorder?companyId=${companyId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener las órdenes de compra');
      }

      const data = await response.json();
      setPurchaseOrders(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      });
    }
  };

  const obtenerUltimaOrdenCompra = async () => {
    try {
      const response = await fetch(`https://api.maderasdelatlantico.com/api/PurchaseOrder/getlastpurchaseorder?companyId=${companyId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener el último número de orden de compra');
      }

      const data = await response.text();
      setUltimaOrdenCompra(data); // Guardar el número de la última orden de compra
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
    obtenerProductos();
    obtenerClientes();
    obtenerUltimaOrdenCompra(); // Llamada al endpoint para obtener la última orden de compra
    
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSelectedOrderId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOrderSelection = (orderId) => {
    setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
  };

  const handleExamine = (orderId, orderState) => {
    navigate('/orden-compra-exam', { state: { productos, clientes, purchaseOrderId: orderId, orderState } });
  };

  const handleEdit = (orderId) => {
    navigate('/orden-compra-edit', { state: { productos, clientes, purchaseOrderId: orderId } });
  };   

  const handleGoBack = () => {
    navigate('/usuario');
  };

  const handleCreateOrder = () => {
    navigate('/orden-compra-create', { state: { productos, clientes, ultimaOrdenCompra } });
  };

  const getOrderStateText = (state) => {
    switch (state) {
      case 1:
        return 'Pendiente';
      case 2:
        return 'Aceptado';
      case 3:
        return 'Rechazado';
      default:
        return 'Desconocido';
    }
  };

  const getOrderStateClass = (state) => {
    switch (state) {
      case 1:
        return 'purchase-order-card-pending';
      case 2:
        return 'purchase-order-card-accepted';
      case 3:
        return 'purchase-order-card-rejected';
      default:
        return '';
    }
  };

  return (
    <div>
      <Header />
      <div className="purchase-order-buttons">
        <button className="purchase-order-back-button" onClick={handleGoBack}>
          &larr; Regresar
        </button>
        <button className="purchase-order-create-button" onClick={handleCreateOrder}>
          Crear Orden de Compra
        </button>
      </div>
      <div className="purchase-order-container" ref={containerRef}>
        {purchaseOrders.map((order) => (
          <div 
            key={order.purchaseOrderId} 
            className={`purchase-order-card ${getOrderStateClass(order.state)}`} 
            onClick={() => toggleOrderSelection(order.purchaseOrderId)}
          >
            <h2 className="purchase-order-title">{order.number}</h2>
            <div className="purchase-order-details">
              <p><strong>Cliente:</strong> {order.clientName}</p>
              <p><strong>Fecha Límite:</strong> {new Date(order.lastDate).toLocaleDateString()}</p>
              <p><strong>Estado:</strong> {getOrderStateText(order.state)}</p>
            </div>
            {selectedOrderId === order.purchaseOrderId && (
              <div className="purchase-order-button-group">
                <button className="purchase-order-btn" onClick={() => handleExamine(order.purchaseOrderId, order.state)}>
                  <i className="fas fa-search"></i> Examinar
                </button>
                {order.state === 1 && (
                  <button className="purchase-order-btn" onClick={() => handleEdit(order.purchaseOrderId)}>
                    <i className="fas fa-edit"></i> Editar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdenCompra;
