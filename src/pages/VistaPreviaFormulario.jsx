import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import "./VistaPreviaFormulario.css";

export default function VistaPreviaFormulario() {
  const { id } = useParams();
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formulario, setFormulario] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFormulario = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/formularios/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFormulario(res.data);
      } catch (e) {
        console.error("Error al cargar formulario", e);
      }
    };
    const fetchCampos = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/formularios/${id}/campos`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const payload = res.data;
        const lista = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.campos)
          ? payload.campos
          : [];
        const normalizados = lista.map((c) => ({
          ...c,
          opciones: c.opciones
            ? Array.isArray(c.opciones)
              ? c.opciones
              : JSON.parse(c.opciones)
            : [],
        }));
        setCampos(normalizados);
      } catch (e) {
        console.error("Error al cargar campos", e);
        setCampos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFormulario();
    fetchCampos();
  }, [id, token]);

  const renderCampo = (campo) => {
    const label = (
      <label className="vp-label">
        {campo.etiqueta}{" "}
        {campo.obligatorio ? <span className="vp-required">*</span> : null}
      </label>
    );

    const getAcceptTypes = (campo) => {
      const tipoArchivo = campo.opciones?.[0] || "todos";
      switch (tipoArchivo) {
        case "documentos": return ".pdf,.doc,.docx";
        case "imagenes":   return ".jpg,.jpeg,.png";
        case "videos":     return ".mp4,.mov";
        default:           return ".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov";
      }
    };

    switch (campo.tipo) {
      case "texto_corto":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <input type="text" className="vp-input" placeholder="Escribe aquí..." required={campo.obligatorio} />
          </div>
        );
      case "texto_largo":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <textarea className="vp-textarea" placeholder="Escribe aquí..." rows={4} required={campo.obligatorio} />
          </div>
        );
      case "numero":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <input type="number" className="vp-input" required={campo.obligatorio} />
          </div>
        );
      case "fecha":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <input type="date" className="vp-input" required={campo.obligatorio} />
          </div>
        );
      case "email":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <input type="email" className="vp-input" placeholder="correo@ejemplo.com" required={campo.obligatorio} />
          </div>
        );
      case "telefono":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <input type="tel" className="vp-input" placeholder="+591 ..." required={campo.obligatorio} />
          </div>
        );
      case "direccion":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <input type="text" className="vp-input" placeholder="Calle, número, zona..." required={campo.obligatorio} />
          </div>
        );
      case "enlace":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <input type="url" className="vp-input" placeholder="https://..." required={campo.obligatorio} />
          </div>
        );
      case "archivo":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <input type="file" className="vp-file" accept={getAcceptTypes(campo)} required={campo.obligatorio} />
            <small className="vp-help">
              Archivos permitidos: {getAcceptTypes(campo).replaceAll(".", "").replaceAll(",", ", ")}
            </small>
          </div>
        );
      case "checkbox":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <div className="vp-options">
              {campo.opciones.map((op, i) => (
                <label key={i} className="vp-option">
                  <input type="checkbox" /> {op}
                </label>
              ))}
            </div>
          </div>
        );
      case "radio":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <div className="vp-options">
              {campo.opciones.map((op, i) => (
                <label key={i} className="vp-option">
                  <input type="radio" name={`radio-${campo.id}`} /> {op}
                </label>
              ))}
            </div>
          </div>
        );
      case "select":
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <select className="vp-select" required={campo.obligatorio}>
              <option value="">Selecciona una opción</option>
              {campo.opciones.map((op, i) => (
                <option key={i} value={op}>{op}</option>
              ))}
            </select>
          </div>
        );
      default:
        return (
          <div key={campo.id} className="vp-field">
            {label}
            <input type="text" className="vp-input" />
          </div>
        );
    }
  };

  if (loading) {
    return <div className="vp-loading">Cargando vista previa...</div>;
  }

  return (
    <div className="vp-container">
      <div className="vp-header">
        <div>
          <h2 className="vp-title">{formulario?.titulo || "Formulario sin título"}</h2>
          {formulario?.descripcion && <p className="vp-desc">{formulario.descripcion}</p>}
        </div>

        <Link to={`/dashboard/formulario/${id}/campos`} className="vp-link">
          ← Volver al constructor
        </Link>
      </div>

      <div className="vp-card">
        {campos.length === 0 ? (
          <p className="vp-empty">Aún no hay campos.</p>
        ) : (
          campos.map((c) => renderCampo(c))
        )}
      </div>

      <div className="vp-actions">
        <button type="button" disabled className="vp-btn vp-btn-primary">Enviar (demo)</button>
        <button type="button" disabled className="vp-btn vp-btn-ghost">Guardar borrador (demo)</button>
      </div>
    </div>
  );
}
