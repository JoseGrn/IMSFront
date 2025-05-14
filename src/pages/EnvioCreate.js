import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../components/Header/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../styles/EnvioCreate.css';

const EnvioCreate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { companyId, clientes, productos } = location.state || { companyId: null, clientes: [], productos: [] };
  const NameUser = localStorage.getItem('name');

  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('it-IT').slice(0, 5);

  const [formData, setFormData] = useState({
    companyId: companyId,
    number: '',
    shippingNote: '',
    departureDate: currentDate,
    week: '',
    clientId: null,
    clientName: '',
    destination: '',
    cubicMeters: '',
    label: '',
    departureTime: currentTime,
    transportation: '',
    trailerPlate: '',
    containerPlate: '',
    pilot: '',
    responsible: NameUser || '',
    observation: '',
    products: []
  });

  const [filasProductos, setFilasProductos] = useState([{ id: Date.now(), productId: null, quantity: 1 }]);

  const [loading, setLoading] = useState(false);

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
    setFilasProductos(updatedFilas);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedFilas = [...filasProductos];
    updatedFilas[index].quantity = parseInt(quantity, 10);
    setFilasProductos(updatedFilas);
  };

  const agregarFilaProducto = () => {
    setFilasProductos([...filasProductos, { id: Date.now(), productId: null, quantity: 1 }]);
  };

  const eliminarFilaProducto = (index) => {
    const updatedFilas = filasProductos.filter((_, i) => i !== index);
    setFilasProductos(updatedFilas);
  };

  const handleGoBack = () => {
    navigate('/envio', { state: { companyId } });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const shipmentData = {
      ...formData,
      products: filasProductos.map((fila) => ({
        productId: fila.productId,
        quantity: fila.quantity
      }))
    };

    try {
      const response = await fetch('https://api.maderasdelatlantico.com/api/Shipment/crearenvio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shipmentData)
      });

      if (!response.ok) {
        throw new Error('Error al crear el envío');
      }

      Swal.fire({
        icon: 'success',
        title: 'Envío creado',
        text: 'El envío se creó exitosamente',
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/envio', { state: { companyId } });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al crear el envío',
        confirmButtonText: 'Aceptar'
      });
    } finally {
        setLoading(false); // Ocultar pantalla de carga
    }
  };

  return (
    <div className="envio-create-container">
      <Header />
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Creando orden de compra...</p>
        </div>
      )}
      <button onClick={handleGoBack} className="envio-create-back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Regresar
        </button>
      <div className="envio-create-header">
        <h1 className="envio-create-title">Crear Envío</h1>
      </div>
      <form>
        <div className="envio-create-form-group">
          <div className="envio-create-form-row">
            <div className="envio-create-form-col">
              <label>Número</label>
              <input type="text" name="number" value={formData.number} onChange={handleInputChange} className="envio-create-input" />
            </div>
            <div className="envio-create-form-col">
              <label>Nota de Envío</label>
              <input type="text" name="shippingNote" value={formData.shippingNote} onChange={handleInputChange} className="envio-create-input" />
            </div>
          </div>
          <div className="envio-create-form-row">
            <div className="envio-create-form-col">
              <label>Fecha de Salida</label>
              <input type="date" name="departureDate" value={formData.departureDate} onChange={handleInputChange} className="envio-create-input" />
            </div>
            <div className="envio-create-form-col">
              <label>Hora de Salida</label>
              <input type="time" name="departureTime" value={formData.departureTime} onChange={handleInputChange} className="envio-create-input" />
            </div>
          </div>
          <div className="envio-create-form-row">
            <div className="envio-create-form-col">
              <label>Semana</label>
              <input type="number" name="week" value={formData.week} onChange={handleInputChange} className="envio-create-input" />
            </div>
            <div className="envio-create-form-col">
              <label>Metros Cúbicos</label>
              <input type="number" name="cubicMeters" value={formData.cubicMeters} onChange={handleInputChange} className="envio-create-input" />
            </div>
          </div>
          <div className="envio-create-form-row">
            <div className="envio-create-form-col">
              <label>Cliente</label>
              <select onChange={handleClientChange} defaultValue="" className="orden-compra-crear-select">
                <option value="" disabled>Seleccione un cliente</option>
                {clientes.map((client) => (
                  <option key={client.userId} value={client.userId}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="envio-create-form-col">
              <label>Destino</label>
              <input type="text" name="destination" value={formData.destination} onChange={handleInputChange} className="envio-create-input" />
            </div>
          </div>
          <div className="envio-create-form-row">
            <div className="envio-create-form-col">
              <label>Marchamo</label>
              <input type="text" name="label" value={formData.label} onChange={handleInputChange} className="envio-create-input" />
            </div>
            <div className="envio-create-form-col">
              <label>Transporte</label>
              <input type="text" name="transportation" value={formData.transportation} onChange={handleInputChange} className="envio-create-input" />
            </div>
          </div>
          <div className="envio-create-form-row">
            <div className="envio-create-form-col">
              <label>Placa de Remolque</label>
              <input type="text" name="trailerPlate" value={formData.trailerPlate} onChange={handleInputChange} className="envio-create-input" />
            </div>
            <div className="envio-create-form-col">
              <label>Placa del Contenedor</label>
              <input type="text" name="containerPlate" value={formData.containerPlate} onChange={handleInputChange} className="envio-create-input" />
            </div>
          </div>
          <div className="envio-create-form-row">
            <div className="envio-create-form-col">
              <label>Piloto</label>
              <input type="text" name="pilot" value={formData.pilot} onChange={handleInputChange} className="envio-create-input" />
            </div>
            <div className="envio-create-form-col">
              <label>Responsable</label>
              <input type="text" name="responsible" value={NameUser} readOnly className="envio-create-input" />
            </div>
          </div>
          <div className="envio-create-form-row">
            <div className="envio-create-form-col">
              <label>Observación</label>
              <textarea name="observation" value={formData.observation} onChange={handleInputChange} className="envio-create-textarea" />
            </div>
          </div>
        </div>

        <h3>Lista de Productos</h3>
        <table className="envio-create-products-table">
          <thead>
            <tr>
              <th>Acción</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>+</th>
            </tr>
          </thead>
          <tbody>
            {filasProductos.map((fila, index) => (
              <tr key={fila.id}>
                <td>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => eliminarFilaProducto(index)}
                      className="envio-create-remove-button"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </td>
                <td>
                  <select
                    value={fila.productId || ""}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="envio-create-select"
                  >
                    <option value="" disabled>Seleccione un producto</option>
                    {productos.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={fila.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    className="envio-create-input"
                  />
                </td>
                <td>
                  {index === filasProductos.length - 1 && (
                    <button type="button" onClick={agregarFilaProducto} className="envio-create-add-button">
                      +
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" onClick={handleSubmit} className="envio-create-submit-button">
          Crear Envío
        </button>
      </form>
    </div>
  );
};

export default EnvioCreate;
