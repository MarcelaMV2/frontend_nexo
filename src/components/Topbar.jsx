import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import "./Topbar.css";

export default function Topbar({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const menuRef = useRef(null);

  // 🧠 Cargar usuario del localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // 🧩 Detectar ruta y cargar título dinámico
  useEffect(() => {
    const fetchFormTitle = async () => {
      if (location.pathname.includes("/dashboard/formulario/") && id) {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/formularios/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setFormTitle(res.data.titulo || "Formulario sin título");
        } catch (err) {
          console.error("Error al obtener el formulario:", err);
          setFormTitle("Formulario");
        }
      } else {
        setFormTitle("");
      }
    };

    fetchFormTitle();
  }, [id, location.pathname]);

  // 📍 Determinar título visible según la ruta
  const getDynamicTitle = () => {
    if (location.pathname === "/dashboard") return "My workspace";
    if (location.pathname.includes("/dashboard/crear-formulario"))
      return "Nuevo formulario";
    if (location.pathname.includes("/dashboard/formulario/") && formTitle) {
      if (location.pathname.includes("/editar"))
        return `Editar formulario — ${formTitle}`;
      if (location.pathname.includes("/condiciones"))
        return `Condiciones — ${formTitle}`;
      if (location.pathname.includes("/registros"))
        return `Registros — ${formTitle}`;
      if (location.pathname.includes("/entrevistas"))
        return `Entrevistas — ${formTitle}`;
      return formTitle;
    }
    return title || "Dashboard";
  };

  // 🔽 Cerrar menú al hacer clic fuera
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // 🧠 Refrescar datos del backend
      axios
        .get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/${parsedUser.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        })
        .catch((err) => console.error("Error actualizando usuario:", err));
    }
  }, []);

  const imageUrl = user?.imagen_url || user?.imagen;

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getColor = (name = "") => {
    const colors = ["#2b6cb0", "#3182ce", "#4299e1", "#63b3ed", "#1a365d"];
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="topbar">
      <h2 className="topbar-title">{getDynamicTitle()}</h2>

      <div className="topbar-user" ref={menuRef}>
        <div
          className={`user-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="user-info">
            <p className="user-name">
              {user
                ? user.nombres
                  ? `${user.nombres} ${user.apellidos || ""}`
                  : user.name
                : "Usuario"}
            </p>
            <p className="user-role">{user?.rol || "usuario"}</p>
          </div>

          {imageUrl ? (
            <img src={imageUrl} alt="Perfil" className="user-avatar" />
          ) : (
            <div
              className="user-avatar-placeholder"
              style={{
                backgroundColor: getColor(user?.nombres),
              }}
            >
              {getInitials(user?.nombres || "U")}
            </div>
          )}

          <svg
            className={`arrow ${isMenuOpen ? "rotate" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {isMenuOpen && (
          <div className="dropdown-menu">
            <MenuItem
              label="Ver Perfil"
              onClick={() => {
                navigate("/dashboard/perfil");
                setIsMenuOpen(false);
              }}
            />
            <MenuItem
              label="Editar Perfil"
              onClick={() => {
                navigate("/dashboard/editar-perfil");
                setIsMenuOpen(false);
              }}
            />
            <MenuItem
              label="Configuración"
              onClick={() => {
                navigate("/configuracion");
                setIsMenuOpen(false);
              }}
            />
            <div className="menu-divider" />
            <MenuItem
              label="Cerrar Sesión"
              isDanger
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
}

function MenuItem({ icon, label, onClick, isDanger = false }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className={`menu-item ${isDanger ? "danger" : ""} ${
        hover ? "hover" : ""
      }`}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span className="menu-icon">{icon}</span>
      <span className="menu-label">{label}</span>
    </div>
  );
}
