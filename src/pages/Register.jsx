import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");

  const [imagenFile, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden ❌");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombres", nombres);
      formData.append("apellidos", apellidos);
      formData.append("email", email);
      formData.append("password", password);

      if (imagenFile) {
        formData.append("imagen", imagenFile);
      }

      console.log("=== DEBUG FormData ===");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
        if (value instanceof File) {
          console.log(
            `  → Es un File: ${value.name}, ${value.type}, ${value.size} bytes`
          );
        }
      }

      const response = await axios({
        method: "POST",
        url: `${import.meta.env.VITE_API_BASE_URL}/api/users`,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: [(data) => data],
      });

      console.log("Usuario registrado:", response.data);

      const loginResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/login`,
        { email, password }
      );

      localStorage.setItem("token", loginResponse.data.token);
      localStorage.setItem("user", JSON.stringify(loginResponse.data.user));

      alert("Registro exitoso ✅ Bienvenido a Nexo");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error completo:", err);
      console.error("Response data:", err.response?.data);

      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        if (errors?.email) {
          setError("El correo ya está registrado ❌");
        } else if (errors?.imagen) {
          setError("El archivo seleccionado no es una imagen válida ❌");
        } else {
          setError(JSON.stringify(errors));
        }
      } else {
        setError("Error al registrar el usuario ❌");
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="register-page">
     {/*  <header className="register-header">
        <h2 className="logo">
          ne<span>x</span>o
        </h2>
      </header> */}

      <div className="register-container">
        <div className="register-card">
          <h3 className="register-title">Registro</h3>
          <hr className="title-divider" />

          <form onSubmit={handleSubmit} className="register-form">
            {/* Foto de Perfil */}
            <div className="profile-section">
              <div className="image-preview-circle">
                {preview ? (
                  <img src={preview} alt="Vista previa" />
                ) : (
                  <div className="placeholder-circle">
                    <svg
                      width="40"
                      height="40"
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
                )}
              </div>
              <label className="upload-btn">
                Seleccionar foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Información Personal */}
            <h4 className="section-title">Información Personal</h4>

            <div className="form-row">
              <div className="form-group">
                <label>Nombres: *</label>
                <input
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Apellidos: *</label>
                <input
                  type="text"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Email: *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contraseña: *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña: *</label>
                <input
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="btn-register">
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}