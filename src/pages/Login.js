import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import logo from "../assets/IMS.png";

const Login = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isEmpresaMode, setIsEmpresaMode] = useState(true);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [modalMessage, setModalMessage] = useState("");
	const [showModal, setShowModal] = useState(false);
	const navigate = useNavigate();

	const handleCloseModal = () => setShowModal(false);

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const endpoint = isEmpresaMode
			? "http://localhost:6001/api/Owner/loginowner"
			: "http://localhost:6001/api/User/loginuser";

		const params = new URLSearchParams({
			user: username,
			password: password,
		});

		try {
			const response = await fetch(`${endpoint}?${params}`, {
				method: "GET",
			});

			if (!response.ok) {
				const message = await response.text();
				throw new Error(message || "Error en la autenticación");
			}

			const data = await response.json();
			console.log("Datos recibidos:", data);

			if (isEmpresaMode) {
				localStorage.setItem("ownerId", data.ownerId);
				localStorage.setItem("firstName", data.firstName);
				localStorage.setItem("lastName", data.lastName);
				navigate("/empresas");
			} else {
				localStorage.setItem("userId", data.userId);
				localStorage.setItem("companyId", data.companyId);
				localStorage.setItem("username", data.username);
				localStorage.setItem("name", data.name);
				localStorage.setItem("role", data.role);
				localStorage.setItem("productsIdList", data.productsIdList);
				navigate("/usuario");
			}
		} catch (error) {
			console.error("Error al hacer login:", error);
			setError("Credenciales incorrectas o error en el servidor.");
			setModalMessage(
				"Error: Credenciales incorrectas o error en el servidor."
			);
			setShowModal(true);
		} finally {
			setLoading(false);
		}
	};

	const toggleMode = () => {
		setIsEmpresaMode(!isEmpresaMode);
	};

	return (
		<div>
			<div className="container">
				<div className="logo-container">
					<img src={logo} alt="IMS" className="logo" />
				</div>

				<div className="toggle-button" onClick={toggleMode}>
					<div
						className={
							isEmpresaMode ? "toggle-button active" : "toggle-button"
						}></div>
				</div>
				<p>{isEmpresaMode ? "Modo Empresa" : "Modo Usuario"}</p>

				<form className="login-form" onSubmit={handleLogin}>
					<div>
						<label htmlFor="username">Usuario:</label>
						<input
							type="text"
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Ingresa tu usuario"
							required
						/>
					</div>
					<div>
						<label htmlFor="password">Contraseña:</label>
						<input
							type="password"
							id="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Ingresa tu contraseña"
							required
						/>
					</div>
					<button type="submit" disabled={loading}>
						{loading ? "Cargando..." : "Login"}
					</button>
					{error && <p style={{ color: "red" }}>{error}</p>}
				</form>
			</div>

			<Modal show={showModal} onHide={handleCloseModal}>
				<Modal.Header closeButton>
					<Modal.Title>Mensaje</Modal.Title>
				</Modal.Header>
				<Modal.Body>{modalMessage}</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleCloseModal}>
						Cerrar
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default Login;
