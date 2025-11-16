import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Perfil.css";

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${storedUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (nombres = "", apellidos = "") =>
    `${nombres?.[0] || ""}${apellidos?.[0] || ""}`.toUpperCase() || "U";

  const imageUrl = user?.imagen_url || user?.imagen;
  const fullImageUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${import.meta.env.VITE_API_BASE_URL}/storage/${imageUrl}`
    : null;

  if (loading)
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
      </div>

      <div className="perfil-card">
        <div className="perfil-content">
          <div className="avatar-section">
            {fullImageUrl ? (
              <img src={fullImageUrl} alt="Perfil" className="avatar" />
            ) : (
              <div className="avatar">{getInitials(user?.nombres, user?.apellidos)}</div>
            )}

            <div className="name-section">
              <h2 className="user-name">
                {user?.nombres} {user?.apellidos}
              </h2>
              <span className="user-role">{user?.rol || "Usuario"}</span>
            </div>
          </div>

          <div className="info-list">
            <div className="info-item">
              <div className="info-icon">📧</div>
              <div className="info-text">
                <span className="info-label">Correo Electrónico</span>
                <span className="info-value">{user?.email}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">👤</div>
              <div className="info-text">
                <span className="info-label">Nombre Completo</span>
                <span className="info-value">
                  {user?.nombres} {user?.apellidos}
                </span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">🎭</div>
              <div className="info-text">
                <span className="info-label">Rol</span>
                <span className="info-value">{user?.rol || "Usuario"}</span>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">📅</div>
              <div className="info-text">
                <span className="info-label">Miembro desde</span>
                <span className="info-value">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "No disponible"}
                </span>
              </div>
            </div>
          </div>

          <div className="actions-container">
            <button
              onClick={() => navigate("/dashboard/editar-perfil")}
              className="btn-edit"
            >
              ✏️ Editar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
