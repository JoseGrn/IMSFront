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
import OrdenCompraExam from './pages/OrdenCompraExam';
import OrdenCompraEdit from './pages/OrdenCompraEdit';
import OrdenCompraCreate from './pages/OrdenCompraCreate';
import OrdenCompraCliente from './pages/OrdenCompraCliente';
import OrdenCompraCreateCliente from './pages/OrdenCompraCreateCliente';
import OrdenCompraEditCliente from './pages/OrdenCompraEditCliente';
import OrdenCompraExamCliente from './pages/OrdenCompraExamCliente';
import Envio from './pages/Envio';
import EnvioCreate from './pages/EnvioCreate';
import EnvioEdit from './pages/EnvioEditar';
import ProductosEmpresa from './pages/ProductosEmpresa';
import ProductosEmpresaUser from './pages/ProductosEmpresa';
import UsuariosEmpresa from './pages/UsuariosEmpresa';
import UsuariosEmpresaUser from './pages/UsuariosEmpresaUser';
import DetallesUsuario from './pages/DetallesUsuario';
import CrearUsuario from './pages/CrearUsuario';
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
        <Route path="/empresa/:companyId/usuarios" element={<UsuariosEmpresa />} />
        <Route path="/empresa/:companyId/usuarios/:userId" element={<DetallesUsuario />} />
        <Route path="/empresa/:companyId/usuarios/crear" element={<CrearUsuario  />} />
        <Route path="/usuario" element={<Usuario />} />
        <Route path="/usuario/:companyId/productos" element={<ProductosEmpresaUser />} />
        <Route path="/usuario/:companyId/usuarios" element={<UsuariosEmpresaUser />} />
        <Route path="/orden-compra" element={<OrdenCompra />} />
        <Route path="/orden-compra-exam" element={<OrdenCompraExam />} />
        <Route path="/orden-compra-edit" element={<OrdenCompraEdit />} />
        <Route path="/orden-compra-create" element={<OrdenCompraCreate />} />
        <Route path="/orden-compra-cliente" element={<OrdenCompraCliente />} />
        <Route path="/orden-compra-cliente-create" element={<OrdenCompraCreateCliente />} />
        <Route path="/orden-compra-cliente-edit" element={<OrdenCompraEditCliente />} />
        <Route path="/orden-compra-cliente-exam" element={<OrdenCompraExamCliente />} />
        <Route path="/envio" element={<Envio />} />
        <Route path="/envio-create" element={<EnvioCreate />} />
        <Route path="/envio-editar" element={<EnvioEdit />} />
      </Routes>
    </Router>
  );
}

export default App;