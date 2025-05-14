import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../components/Header/Header';
import '../styles/Envio.css';

const Envio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { companyId } = location.state || {};
  const [shipments, setShipments] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const productsIdList = localStorage.getItem('productsIdList');

  useEffect(() => {
    if (companyId) {
      fetchShipments();
      fetchProductos();
      fetchClientes();
    }
  }, [companyId]);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.maderasdelatlantico.com/api/Shipment/obtenerenvioslist?companyId=${companyId}`);
      if (!response.ok) {
        throw new Error('Error al obtener los envíos');
      }
      const data = await response.json();
      setShipments(data);
    } catch (error) {
      setError(error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
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

  const fetchClientes = async () => {
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

  const handleGoBack = () => {
    navigate('/usuario');
  };

  const handleCreateShipment = () => {
    navigate('/envio-create', { state: { companyId, productos, clientes } });
  };

  const handleEditShipment = (shipmentId) => {
    navigate('/envio-editar', { state: { shipmentId, productos, clientes, companyId } });
  };

  return (
    <div>
      <Header />
      <div className="shipment-buttons">
        <button className="shipment-back-button" onClick={handleGoBack}>
          &larr; Regresar
        </button>
        <h1>Envíos</h1>
        <button className="shipment-create-button" onClick={handleCreateShipment}>
          Crear Envío
        </button>
      </div>
      <div className="envio-container">
        {loading && <p>Cargando envíos...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {shipments.length > 0 ? (
          <div className="shipments-list">
            {shipments.map((shipment) => (
              <div 
                key={shipment.shipmentId} 
                className="shipment-card"
                onClick={() => handleEditShipment(shipment.shipmentId)}
              >
                <h4>Número: {shipment.number}</h4>
                <p><strong>Cliente:</strong> {shipment.clientName}</p>
                <p><strong>Fecha de Salida:</strong> {new Date(shipment.departureDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay envíos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default Envio;
