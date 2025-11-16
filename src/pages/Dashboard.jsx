import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [formularios, setFormularios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuActivo, setMenuActivo] = useState(null); // id del menú abierto

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const menuRef = useRef(null); // 👈 NECESITA EL IMPORT

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Token actual:", token);
        console.log("URL API:", import.meta.env.VITE_API_BASE_URL);
        if (!user || !token) return setFormularios([]);
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/formularios`,
          { headers: { Authorization: `Bearer ${token}` }, Accept: "application/json" }
        );
        setFormularios(data);
      } catch (error) {
        console.error("Error al obtener formularios:", error);
        setFormularios([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cerrar menú con clic fuera
  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuActivo(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Cerrar menú con ESC
  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") setMenuActivo(null);
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este formulario?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/formularios/${id}`,
        { headers: { Authorization: `Bearer ${token}` }, Accept: "application/json" }
      );
      setFormularios((prev) => prev.filter((f) => f.id !== id));
      alert("Formulario eliminado correctamente ✅");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar formulario ❌");
    }
  };

  const handleCompartir = (id) => {
    const url = `${window.location.origin}/formularios/${id}/preview`; // ajusta si tu ruta pública es otra
    navigator.clipboard.writeText(url);
    alert("URL copiada al portapapeles 📋");
  };

  // Helper: navegar, guardar último formulario y cerrar menú
  const go = (path, formId) => {
    localStorage.setItem("lastFormId", String(formId));
    setMenuActivo(null);
    navigate(path);
  };

  if (loading) return <p>Cargando…</p>;

  if (!formularios || formularios.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h3>Comienza a crear formularios</h3>
        <a
          href="/dashboard/crear-formulario"
          style={{
            display: "inline-block",
            background: "var(--color-primary)",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: 12,
            textDecoration: "none",
            fontWeight: 600,
            marginTop: 12,
          }}
        >
          + Crear formulario
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {formularios.map((f) => (
        <div
          key={f.id}
          style={{
            position: "relative",
            background: "#fff",
            border: "1px solid #e9d5ff",
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 500, color: "#333" }}>{f.titulo}</span>

          {/* Botón de 3 puntos */}
          <button
            aria-haspopup="menu"
            aria-expanded={menuActivo === f.id}
            aria-controls={`menu-form-${f.id}`}
            onClick={() => setMenuActivo(menuActivo === f.id ? null : f.id)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <MoreVertical size={20} color="#6b21a8" />
          </button>

          {/* Menú desplegable */}
          {menuActivo === f.id && (
            <div
              ref={menuRef}
              id={`menu-form-${f.id}`}
              role="menu"
              style={{
                position: "absolute",
                top: "45px",
                right: "10px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                zIndex: 10,
                width: "200px",
                overflow: "hidden",
                animation: "fadeIn 0.2s ease",
              }}
            >
              <button
                role="menuitem"
                onClick={() => go(`/dashboard/formulario/${f.id}/ver`, f.id)}
                style={estiloOpcion}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f0ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                Ver formulario
              </button>

              <button
                role="menuitem"
                onClick={() => go(`/dashboard/formulario/${f.id}/campos`, f.id)}
                style={estiloOpcion}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f0ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                Editar formulario
              </button>

              <button
                role="menuitem"
                onClick={() => handleEliminar(f.id)}
                style={estiloOpcion}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f0ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                Borrar formulario
              </button>

              <button
                role="menuitem"
                onClick={() => go(`/dashboard/formulario/${f.id}/respuestas`, f.id)}
                style={estiloOpcion}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f0ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                Ver postulaciones
              </button>

              <button
                role="menuitem"
                onClick={() => handleCompartir(f.id)}
                style={estiloOpcion}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f6f0ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                Compartir URL
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const estiloOpcion = {
  display: "block",
  width: "100%",
  padding: "10px 14px",
  textAlign: "left",
  background: "white",
  border: "none",
  cursor: "pointer",
  color: "#444",
  fontSize: "14px",
};
