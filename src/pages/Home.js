import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button/Button";
import image1 from "../assets/image1.jpg";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image3.png";

const Home = () => {
	const navigate = useNavigate();

	const handleLoginClick = () => {
		navigate("/login");
	};

	return (
		<div>
			<div className="carousel">
				<div className="carousel-images">
					<img src={image1} alt="Image1" />
					<img src={image2} alt="Image2" />
					<img src={image3} alt="Image3" />
				</div>
				<div className="carousel-images">
					<img src={image1} alt="Image1" />
					<img src={image2} alt="Image2" />
					<img src={image3} alt="Image3" />
				</div>
			</div>
			<div className="home-container">
				<h1>Bienvenido</h1>
				<Button text="Iniciar sesión" onClick={handleLoginClick} />
			</div>
		</div>
	);
};

export default Home;
