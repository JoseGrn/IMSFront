// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Empresas from './pages/Empresas';
import EmpresaDetalle from './pages/EmpresaDetalle';
import Usuario from './pages/Usuario';
import OrdenCompra from './pages/OrdenCompra';
import Envio from './pages/Envio';
import ProductosEmpresa from './pages/ProductosEmpresa';
import ProductosEmpresaUser from './pages/ProductosEmpresa';
import './styles.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/empresa/:companyId" element={<EmpresaDetalle />} />
        <Route path="/empresa/:companyId/productos" element={<ProductosEmpresa />} />
        <Route path="/usuario" element={<Usuario />} />
        <Route path="/usuario/:companyId/productos" element={<ProductosEmpresaUser />} />
        <Route path="/orden-compra" element={<OrdenCompra />} />
        <Route path="/envio" element={<Envio />} />
      </Routes>
    </Router>
  );
}

export default App;