import React from "react";
import { NavLink, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Home,
  Search,
  ClipboardList,
  Users,
  LogOut,
  Plus,
  Eye,
  Edit3,
  Settings,
  Share2,
} from "lucide-react";
import "../styles/variables.css";
import "../styles/global.css";
import "../styles/components.css";
import "./Sidebar.css";
import logo from "../assets/nexologo.png";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Detecta si estamos dentro de un formulario
  const dentroDeFormulario = location.pathname.includes("/dashboard/formulario/");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Sesión cerrada ✅");
    navigate("/");
    window.location.reload();
  };

  const Item = ({ to, label, Icon }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
    >
      <Icon className="sidebar-icon" size={18} strokeWidth={2.2} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        {/* Logo más compacto */}
        <div className="sidebar-logo">
          <img src={logo} alt="logo nexo" />
        </div>

        {/* Botón Crear Formulario con menos margen */}
        <button
          className="sidebar-create-btn"
          onClick={() => navigate("/dashboard/crear-formulario")}
        >
          <Plus size={16} strokeWidth={2.3} /> Crear Formulario
        </button>

        {/* Navegación principal */}
        <nav className="sidebar-nav">
          <Item to="/dashboard/buscar" label="Buscar" Icon={Search} />
          <Item to="/dashboard" label="My workspace" Icon={Home} />
        </nav>

        {/* Bloque contextual solo cuando hay un formulario */}
        {dentroDeFormulario && (
          <div className="sidebar-context">
            <hr className="sidebar-separator" />
            <h4 className="sidebar-context-title">Formulario actual</h4>
            {/* <Item to={`/dashboard/formulario/${id}/ver`} label="Ver formulario" Icon={Eye} />
            <Item to={`/dashboard/formulario/${id}/campos`} label="Editar campos" Icon={Edit3} />
            <Item to={`/dashboard/formularios/${id}/campos`} label="Condiciones" Icon={Settings} />
            <Item to={`/dashboard/formularios/${id}/campos`} label="Registros" Icon={ClipboardList} />
            <Item to={`/dashboard/formularios/${id}/campos`} label="Entrevistas" Icon={Users} />
            <Item to={`/dashboard/formularios/${id}/campos`} label="Compartir URL" Icon={Share2} /> */}
            
            <Item to={`/dashboard/formulario/${id}/ver`} label="Ver formulario" Icon={Eye} />
            <Item to={`/dashboard/formulario/${id}/campos`} label="Editar campos" Icon={Edit3} />
            <Item to={`/dashboard/formulario/${id}/condiciones`} label="Condiciones" Icon={Settings} />
            <Item to={`/dashboard/formulario/${id}/respuestas`} label="Registros" Icon={ClipboardList} />
            <Item to={`/dashboard/formulario/${id}/entrevistas`} label="Entrevistas" Icon={Users} />
            <Item to={`/dashboard/formularios/${id}/url`} label="Compartir URL" Icon={Share2} />
          </div> 
        )}
      </div>

      {/* Botón Cerrar sesión fijo al fondo */}
      <div className="sidebar-bottom">
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut className="sidebar-icon" size={18} strokeWidth={2.2} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
