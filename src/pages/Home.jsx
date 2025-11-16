import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import inicio from "../assets/imgPanel.png";
//import portada from '../assets/portada.png'; // agrega tu imagen en /src/assets

export default function Home() {
  const navigate = useNavigate(); // Hook para navegar
  return (
    <div className="home-container">
      {/* NAVBAR SOLO PARA ESTA PÁGINA */}
      <header className="navbar">
        <div className="navbar-logo">nexo</div>
        <div className="navbar-buttons">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Iniciar Sesión
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate("/register")}
          >
            Registrarse
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="home-content">
        <div className="home-text">
          <h2>Bienvenido a Nexo</h2>
          <p>
            Donde la automatización y el talento se encuentran. <br />
            Centraliza tus procesos de selección con estilo, rapidez y
            tecnología. <br />
            Tu sistema de RRHH más moderno que nunca. ¡Comienza hoy! <br />
            Crea, gestiona y analiza formularios como nunca antes.
          </p>
        </div>
        <img src={inicio} alt="inicio" width="300px" />
        {/* <div className="home-image">
          {/* <img src={portada} alt="ilustración nexo" /> 
        </div> */}
      </div>
    </div>
  );
}
