import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditarPerfil.css"; // 🔹 Nuevo archivo con los estilos azul-acero

export default function EditarPerfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    confirmarPassword: "",
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

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

      const userData = response.data;
      setFormData({
        nombres: userData.nombres || "",
        apellidos: userData.apellidos || "",
        email: userData.email || "",
        password: "",
        confirmarPassword: "",
      });

      const imageUrl = userData.imagen_url || userData.imagen;
      if (imageUrl) {
        const fullImageUrl = imageUrl.startsWith("http")
          ? imageUrl
          : `${import.meta.env.VITE_API_BASE_URL}/storage/${imageUrl}`;
        setCurrentImage(fullImageUrl);
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      setError("No se pudo cargar la información del perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("La imagen no debe superar 4MB");
      return;
    }

    setImagenFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.nombres || !formData.apellidos || !formData.email) {
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.password && formData.password !== formData.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSaving(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      const updateData = new FormData();
      updateData.append("nombres", formData.nombres);
      updateData.append("apellidos", formData.apellidos);
      updateData.append("email", formData.email);

      if (formData.password) {
        updateData.append("password", formData.password);
      }

      if (imagenFile) {
        updateData.append("imagen", imagenFile);
      }

      updateData.append("_method", "PUT");

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${storedUser.id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("user", JSON.stringify(response.data));
      setSuccess("✅ Perfil actualizado correctamente");
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmarPassword: "",
      }));

      setTimeout(() => navigate("/dashboard/perfil"), 2000);
    } catch (err) {
      console.error("Error al actualizar perfil:", err);

      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        if (errors?.email) {
          setError("El correo ya está registrado por otro usuario");
        } else if (errors?.imagen) {
          setError("Error con la imagen seleccionada");
        } else {
          setError("Error de validación. Verifica los datos ingresados");
        }
      } else {
        setError("Error al actualizar el perfil. Intenta nuevamente");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="editar-container">
      <div className="editar-card">
        <div className="editar-header">
          <button
            onClick={() => navigate("/dashboard/perfil")}
            className="back-btn"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al Perfil
          </button>
          <h2>Editar Perfil</h2>
          <p>Actualiza tu información personal</p>
        </div>

        <form onSubmit={handleSubmit} className="editar-form">
          {/* ======== FOTO DE PERFIL ======== */}
          <label className="section-label">Foto de Perfil</label>
          <div className="image-container">
            <div className="image-preview">
              {preview || currentImage ? (
                <img src={preview || currentImage} alt="Preview" />
              ) : (
                <div className="placeholder-image">
                  <svg
                    width="48"
                    height="48"
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

            <div>
              <label className="upload-btn">
                📸 Cambiar Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
              <p className="image-hint">JPG, PNG o GIF (máx. 4MB)</p>
            </div>
          </div>

          <hr className="divider" />

          {/* ======== INFORMACIÓN PERSONAL ======== */}
          <label className="section-label">Información Personal</label>
          <div className="grid">
            <div className="input-group">
              <label className="label">
                Nombres <span className="required">*</span>
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>

            <div className="input-group">
              <label className="label">
                Apellidos <span className="required">*</span>
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="label">
              Correo Electrónico <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input"
              required
            />
          </div>

          <hr className="divider" />

          {/* ======== CONTRASEÑA ======== */}
          <label className="section-label">Cambiar Contraseña (Opcional)</label>
          <p className="section-hint">
            Deja estos campos vacíos si no deseas cambiar tu contraseña
          </p>

          <div className="grid">
            <div className="input-group">
              <label className="label">Nueva Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>

            <div className="input-group">
              <label className="label">Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleInputChange}
                className="input"
                placeholder="Repite la contraseña"
                minLength={6}
              />
            </div>
          </div>

          {/* ======== MENSAJES ======== */}
          {error && <div className="error-msg">❌ {error}</div>}
          {success && <div className="success-msg">{success}</div>}

          {/* ======== BOTONES ======== */}
          <div className="actions">
            <button
              type="button"
              onClick={() => navigate("/dashboard/perfil")}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-save"
              style={{
                opacity: saving ? 0.7 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Guardando..." : "💾 Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
