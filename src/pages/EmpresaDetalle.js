import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap'; // Importar componentes de Bootstrap
import Header from '../components/Header/Header';
import '../styles/EmpresaDetalle.css'; // Importar los estilos personalizados

const EmpresaDetalle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Recibir la información de la empresa desde la vista anterior
  const { empresa } = location.state;

  const handleUsuariosClick = () => {
    navigate(`/empresa/${empresa.companyId}/usuarios`, { state: { empresa } });
  };

  const handleProductosClick = () => {
    // Redirigir a la vista de productos con la información de la empresa
    navigate(`/empresa/${empresa.companyId}/productos`, { state: { empresa } });
  };

  const handleBackClick = () => {
    navigate('/empresas'); // Redirigir a la vista de empresas
  };

  return (
    <div>
      <Header />
      <div className="empresa-detalle-container">
        <Button variant="secondary" onClick={handleBackClick} className="back-button">
          Regresar
        </Button>
        
        <h1>{empresa.name}</h1>
        <p>{empresa.description}</p>
        
        <div className="buttons-container">
          <Button variant="primary" onClick={handleUsuariosClick} className="me-3">
            Usuarios
          </Button>
          <Button variant="secondary" onClick={handleProductosClick}>
            Productos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmpresaDetalle;
