import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from "jspdf";
import Header from '../components/Header/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowLeft, faPrint } from '@fortawesome/free-solid-svg-icons';
import '../styles/EnvioEditar.css';

const EnvioEditar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { shipmentId, productos, clientes, companyId } = location.state || {};
  const NameUser = localStorage.getItem('name');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyId: '',
    number: '',
    shippingNote: '',
    departureDate: '',
    week: '',
    clientId: null,
    clientName: '',
    destination: '',
    cubicMeters: '',
    label: '',
    departureTime: '',
    transportation: '',
    trailerPlate: '',
    containerPlate: '',
    pilot: '',
    responsible: NameUser || '',
    observation: '',
    products: []
  });

  const [filasProductos, setFilasProductos] = useState([{ id: Date.now(), productId: null, quantity: 1 }]);

  useEffect(() => {
    if (shipmentId) {
      fetchShipmentDetails();
    }
  }, [shipmentId]);

  const fetchShipmentDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.maderasdelatlantico.com/api/Shipment/obtenerenviobyid?shipmentId=${shipmentId}`);
      if (!response.ok) {
        throw new Error('Error al obtener los detalles del envío');
      }
      const data = await response.json();
      setFormData({
        ...data,
        departureDate: data.departureDate ? data.departureDate.split('T')[0] : '', // Formato YYYY-MM-DD
      });
      setFilasProductos(data.products.map((product) => ({
        id: Date.now() + Math.random(),
        productId: product.productId,
        quantity: product.quantity
      })));
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los detalles del envío',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };

const generatePDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(10);
  doc.text(`${formData.shippingNote}`, 165, 44);
  doc.text(`${formData.departureDate}`, 70, 46);
  doc.text(`${formData.week}`, 130, 46);
  console.log(formData.shippingNote);

  // Cliente y destino
  doc.text(`${formData.clientName}`, 58, 54);
  doc.text(`${formData.destination}`, 35, 61);

  // Tabla de productos
  let startY = 64;

  filasProductos.forEach((fila, index) => {
    const product = productos.find(p => p.productId === fila.productId);
    doc.text(product?.name || "Producto desconocido", 20, startY + 10 + index * 5);
    doc.text(product?.specie, 63, startY + 10 + index * 5); // Suponiendo que siempre es "Pino"
    doc.text(`${fila.quantity}`, 90, startY + 10 + index * 5);
  });

  // Datos finales
  const totalCubicMeters = formData.cubicMeters;
  doc.text(`${totalCubicMeters}`, 90, startY + 30);
  doc.text(`${formData.label}`, 90, startY + 35);
  doc.text(`${formData.departureTime}`, 90, startY + 40);

  doc.text(`${formData.transportation}`, 160, 71);
  doc.text(`${formData.trailerPlate}`, 130, 80);
  doc.text(`EQUIPO: ${formData.containerPlate}`, 150, 80);

  doc.text(`${formData.pilot}`, 150, 90);
  doc.text(`${NameUser}`, 130, 105);

  // Observaciones
  doc.text(`${formData.observation}`, 45, 110);

  // Guardar el PDF
  doc.save(`Envio_${formData.number || "sin_numero"}.pdf`);
};


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
      shipmentId: shipmentId,  // Usamos el shipmentId del envío que estamos editando
      number: formData.number,
      shippingNote: formData.shippingNote,
      departureDate: formData.departureDate,
      week: formData.week,
      clientName: formData.clientName,
      destination: formData.destination,
      cubicMeters: formData.cubicMeters,
      label: formData.label,
      departureTime: formData.departureTime,
      transportation: formData.transportation,
      trailerPlate: formData.trailerPlate,
      containerPlate: formData.containerPlate,
      pilot: formData.pilot,
      observation: formData.observation,
      clientId: formData.clientId,
      products: filasProductos.map((fila) => ({
        productId: fila.productId,
        quantity: fila.quantity
      }))
    };
  
    try {
      const response = await fetch('https://api.maderasdelatlantico.com/api/Shipment/editarenvio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shipmentData)
      });
  
      if (!response.ok) {
        throw new Error('Error al actualizar el envío');
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Envío actualizado',
        text: 'El envío se actualizó exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
  
      navigate('/envio', { state: { companyId } });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar el envío',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="envio-create-container">
      <Header />
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Cargando datos del envío...</p>
        </div>
      )}
      <div className="envio-create-header-buttons">
          <div className="envio-create-header-left">
              <button onClick={handleGoBack} className="envio-create-back-button">
                  <FontAwesomeIcon icon={faArrowLeft} /> Regresar
              </button>
          </div>
          <div className="envio-create-header-right">
              <button onClick={generatePDF} className="envio-create-print-button">
                  <FontAwesomeIcon icon={faPrint} /> Imprimir
              </button>
          </div>
      </div>
      <div className="envio-create-header">
        <h1 className="envio-create-title">Editar Envío</h1>
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
            <select
                onChange={handleClientChange}
                value={formData.clientId || ""} // Aquí establecemos el valor del cliente
                className="orden-compra-crear-select"
            >
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
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default EnvioEditar;
