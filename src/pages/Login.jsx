import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import loginIllustration from "../assets/login.png"; // Coloca tu imagen aquí
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/login`,
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert("Inicio de sesión correcto ✅");
      navigate("/dashboard");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Credenciales incorrectas ❌");
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-box">
          <div className="login-left">
          </div>

          <div className="login-right">
            <h2>Iniciar Sesión</h2>

            <div className="user-icon">
              <svg
                width="50"
                height="50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email:</label>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Contraseña:</label>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="error">{error}</p>}

              <button type="submit" className="btn-login">
                Iniciar Sesión
              </button>
            </form>
            <p
              className="create-account"
              onClick={() => navigate("/forgot-password")}
              style={{ marginTop: "8px" }}
            >
              ¿Olvidaste tu contraseña?
            </p>

            <div className="divider">ó</div>

            <p className="create-account" onClick={() => navigate("/register")}>
              Crear nueva cuenta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
