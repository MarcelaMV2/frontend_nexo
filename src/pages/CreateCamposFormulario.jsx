import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  Type, FileText, Calendar, CheckSquare, ChevronDown,
  File, Hash, Mail, Phone, MapPin, CircleDot, Link2,
} from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import "./CreateCamposFormulario.css"; // <<--- IMPORTA EL CSS

export default function CreateCamposFormulario() {
  const { id } = useParams();
  const [campos, setCampos] = useState([]);
  const [etiqueta, setEtiqueta] = useState("");
  const [tipo, setTipo] = useState("texto_corto");
  const [obligatorio, setObligatorio] = useState(false);
  const [opciones, setOpciones] = useState([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [editando, setEditando] = useState(false);
  const [campoActual, setCampoActual] = useState(null);
  const [tipoArchivo, setTipoArchivo] = useState("todos");

  const token = localStorage.getItem("token");

  const agregarOpcion = (e) => {
    e.preventDefault();
    if (!nuevaOpcion.trim()) return;
    setOpciones([...opciones, nuevaOpcion.trim()]);
    setNuevaOpcion("");
  };

  const eliminarOpcion = (index) => {
    setOpciones(opciones.filter((_, i) => i !== index));
  };

  useEffect(() => {
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
        setCampos(lista);
      } catch (err) {
        console.error("Error al obtener los campos", err);
        setCampos([]);
      }
    };
    fetchCampos();
  }, [id, token]);

  const handleGuardarCampo = async (e) => {
    e.preventDefault();

    const form = e.target.closest("form");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      let opcionesFinales = null;

      if (["checkbox", "select", "radio"].includes(tipo)) {
        if (opciones.length === 0) {
          alert("Agrega al menos una opción para este tipo de campo.");
          return;
        }
        opcionesFinales = opciones;
      } else if (tipo === "archivo") {
        opcionesFinales = [tipoArchivo];
      }

      const dataCampo = { etiqueta, tipo, obligatorio, opciones: opcionesFinales };

      if (editando && campoActual) {
        const response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/campos-formulario/${campoActual.id}`,
          dataCampo,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCampos(
          campos.map((c) =>
            c.id === campoActual.id ? { ...c, ...response.data.data } : c
          )
        );
        alert("Campo actualizado ✅");
      } else {
        const nuevoCampo = { id_formulario: id, ...dataCampo };
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/campos-formulario`,
          nuevoCampo,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCampos([...campos, response.data.data]);
        alert("Campo agregado ✅");
      }

      setEtiqueta("");
      setTipo("texto_corto");
      setOpciones([]);
      setObligatorio(false);
      setEditando(false);
      setCampoActual(null);
    } catch (error) {
      console.error("Error al guardar campo:", error);
      alert("Error al guardar el campo ❌");
    }
  };

  const handleEliminarCampo = async (idCampo) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/campos-formulario/${idCampo}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCampos(campos.filter((c) => c.id !== idCampo));
    } catch (err) {
      console.error("Error al eliminar campo", err);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(campos);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);
    setCampos(items);
  };

  const tiposDeCampo = [
    { value: "texto_corto", label: "Texto corto", icon: <Type size={18} /> },
    { value: "texto_largo", label: "Texto largo", icon: <FileText size={18} /> },
    { value: "fecha", label: "Fecha", icon: <Calendar size={18} /> },
    { value: "checkbox", label: "CheckBox", icon: <CheckSquare size={18} /> },
    { value: "radio", label: "Selección única", icon: <CircleDot size={18} /> },
    { value: "select", label: "Select", icon: <ChevronDown size={18} /> },
    { value: "archivo", label: "Archivo (PDF)", icon: <File size={18} /> },
    { value: "numero", label: "Número", icon: <Hash size={18} /> },
    { value: "email", label: "Email", icon: <Mail size={18} /> },
    { value: "telefono", label: "Teléfono", icon: <Phone size={18} /> },
    { value: "direccion", label: "Dirección", icon: <MapPin size={18} /> },
    { value: "enlace", label: "Enlace (URL)", icon: <Link2 size={18} /> },
  ];

  return (
    <div className="nexo-page">
      {/* Panel principal */}
      <div className="nexo-main">
        <h2 className="nexo-title">
          Campos del Formulario
          <Link to={`/formularios/${id}/preview`} className="nexo-btn nexo-btn-primary">
            Vista previa
          </Link>
        </h2>

        <form onSubmit={handleGuardarCampo}>
          <div className="nexo-field">
            <label className="nexo-label">Etiqueta:</label>
            <input
              type="text"
              className="nexo-input"
              placeholder="Ej: Fecha de nacimiento"
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              required
            />
          </div>

          <div className="nexo-field">
            <label className="nexo-label">Tipo de campo:</label>
            <div className="nexo-type-grid">
              {tiposDeCampo.map((campo) => (
                <button
                  key={campo.value}
                  type="button"
                  onClick={() => setTipo(campo.value)}
                  className={`nexo-type-chip ${tipo === campo.value ? "is-active" : ""}`}
                >
                  {campo.icon}
                  {campo.label}
                </button>
              ))}
            </div>
          </div>

          {["checkbox", "select", "radio"].includes(tipo) && (
            <div className="nexo-field">
              <label className="nexo-label">Opciones:</label>
              <div className="nexo-row">
                <input
                  type="text"
                  className="nexo-input nexo-grow"
                  placeholder="Escribe una opción..."
                  value={nuevaOpcion}
                  onChange={(e) => setNuevaOpcion(e.target.value)}
                />
                <button onClick={agregarOpcion} className="nexo-btn nexo-btn-primary">
                  + Agregar
                </button>
              </div>

              <ul className="nexo-opciones">
                {opciones.map((op, i) => (
                  <li key={i} className="nexo-opcion">
                    <span>{op}</span>
                    <button onClick={() => eliminarOpcion(i)} className="nexo-opcion-remove">
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tipo === "archivo" && (
            <div className="nexo-field">
              <label className="nexo-label">Tipo de archivo permitido:</label>
              <select
                value={tipoArchivo}
                onChange={(e) => setTipoArchivo(e.target.value)}
                className="nexo-select"
              >
                <option value="todos">Todos (PDF, Word, imágenes, videos)</option>
                <option value="documentos">Solo documentos (PDF, Word)</option>
                <option value="imagenes">Solo imágenes (JPG, PNG)</option>
                <option value="videos">Solo videos (MP4, MOV)</option>
              </select>
            </div>
          )}

          <div className="nexo-field">
            <label className="nexo-check">
              <input
                type="checkbox"
                checked={obligatorio}
                onChange={(e) => setObligatorio(e.target.checked)}
              />
              Obligatorio
            </label>
          </div>

          <button type="submit" onClick={handleGuardarCampo} className="nexo-btn nexo-btn-secondary">
            {editando ? "Actualizar campo" : "Agregar campo"}
          </button>
        </form>
      </div>

      {/* Panel lateral */}
      <div className="nexo-aside">
        <h3 className="nexo-aside-title">Campos agregados</h3>
        {campos.length === 0 ? (
          <p className="nexo-aside-empty">Aún no hay campos registrados.</p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="campos">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} className="nexo-list">
                  {campos.map((campo, index) => (
                    <Draggable key={campo.id.toString()} draggableId={campo.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`nexo-item ${snapshot.isDragging ? "dragging" : ""}`}
                          style={provided.draggableProps.style}  // mantener estilos de posición del DnD
                          onClick={() => {
                            setCampoActual(campo);
                            setEtiqueta(campo.etiqueta);
                            setTipo(campo.tipo);
                            setObligatorio(campo.obligatorio);
                            setOpciones(
                              campo.opciones
                                ? Array.isArray(campo.opciones)
                                  ? campo.opciones
                                  : JSON.parse(campo.opciones)
                                : []
                            );
                            setEditando(true);
                          }}
                        >
                          <div className="nexo-item-main">
                            {tiposDeCampo.find((t) => t.value === campo.tipo)?.icon}
                            <span>{campo.etiqueta}</span>
                            <span className="nexo-item-type">
                              — {tiposDeCampo.find((t) => t.value === campo.tipo)?.label}
                            </span>
                          </div>

                          <button onClick={() => handleEliminarCampo(campo.id)} className="nexo-item-remove">
                            ✕
                          </button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
