import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  Type,
  FileText,
  Calendar,
  CheckSquare,
  ChevronDown,
  File,
  Hash,
  Mail,
  Phone,
  MapPin,
  CircleDot,
  Link2,
} from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

export default function CreateCamposFormulario() {
  const { id } = useParams(); // ID del formulario
  const [campos, setCampos] = useState([]);
  const [etiqueta, setEtiqueta] = useState("");
  const [tipo, setTipo] = useState("texto_corto");
  const [obligatorio, setObligatorio] = useState(false);
  // Opciones múltiples (para checkbox, select, radio, etc.)
  const [opciones, setOpciones] = useState([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  const [editando, setEditando] = useState(false);
  const [campoActual, setCampoActual] = useState(null);
  const [tipoArchivo, setTipoArchivo] = useState("todos");

  const token = localStorage.getItem("token");

  // Agregar y eliminar opciones
  const agregarOpcion = (e) => {
    e.preventDefault();
    if (!nuevaOpcion.trim()) return;
    setOpciones([...opciones, nuevaOpcion.trim()]);
    setNuevaOpcion("");
  };

  const eliminarOpcion = (index) => {
    setOpciones(opciones.filter((_, i) => i !== index));
  };

  // Obtener los campos existentes
  useEffect(() => {
    const fetchCampos = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/formularios/${id}/campos`,
          //`http://127.0.0.1:8000/api/formularios/${id}/campos`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const payload = res.data;

        // Normaliza la respuesta a un array
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
        setCampos([]); // evita que quede undefined y falle el map
      }
    };

    fetchCampos();
  }, [id, token]);

  // Crear nuevo campo
  const handleGuardarCampo = async (e) => {
    e.preventDefault();

    // 🧩 Validación nativa del formulario
    const form = e.target.closest("form");
    if (!form.checkValidity()) {
      form.reportValidity(); // Muestra los mensajes nativos del navegador
      return;
    }

    try {
      let opcionesFinales = null;

      // 🟣 Tipos que tienen lista de opciones
      if (["checkbox", "select", "radio"].includes(tipo)) {
        if (opciones.length === 0) {
          alert("Agrega al menos una opción para este tipo de campo.");
          return;
        }
        opcionesFinales = opciones;

        // 🟢 Tipo archivo: guardamos el tipo de archivo elegido (documentos, imágenes, etc.)
      } else if (tipo === "archivo") {
        opcionesFinales = [tipoArchivo];
      }

      const dataCampo = {
        etiqueta,
        tipo,
        obligatorio,
        opciones: opcionesFinales,
      };

      if (editando && campoActual) {
        // 🟣 Modo edición → actualiza campo existente
        const response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/campos-formulario/${campoActual.id}`,
          //`http://127.0.0.1:8000/api/campos-formulario/${campoActual.id}`,
          dataCampo,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Actualiza el array local de campos sin recargar
        setCampos(
          campos.map((c) =>
            c.id === campoActual.id ? { ...c, ...response.data.data } : c
          )
        );

        alert("Campo actualizado ✅");
      } else {
        // 🟢 Modo creación → agrega nuevo campo
        const nuevoCampo = {
          id_formulario: id,
          ...dataCampo,
        };

        const response = await axios.post(
          //"http://127.0.0.1:8000/api/campos-formulario",
          `${import.meta.env.VITE_API_BASE_URL}/api/campos-formulario`,
          nuevoCampo,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCampos([...campos, response.data.data]);
        alert("Campo agregado ✅");
      }

      // Limpieza general después de guardar o actualizar
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
        //`http://127.0.0.1:8000/api/campos-formulario/${idCampo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCampos(campos.filter((c) => c.id !== idCampo));
    } catch (err) {
      console.error("Error al eliminar campo", err);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return; // si lo sueltan fuera de la lista

    const items = Array.from(campos);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);

    setCampos(items);
  };

  // Diccionario de tipos con sus íconos
  const tiposDeCampo = [
    { value: "texto_corto", label: "Texto corto", icon: <Type size={18} /> },
    {
      value: "texto_largo",
      label: "Texto largo",
      icon: <FileText size={18} />,
    },
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
    <div style={{ display: "flex", gap: "40px", padding: "20px" }}>
      {/* Panel principal */}
      <div style={{ flex: 2 }}>
        <h2
          style={{
            color: "#9333ea",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Campos del Formulario
          <Link
            to={`/formularios/${id}/preview`}
            style={{
              background: "#6d28d9",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Vista previa
          </Link>
        </h2>

        <form onSubmit={handleGuardarCampo}>
          <div style={{ marginBottom: "10px" }}>
            <label>Etiqueta:</label>
            <input
              type="text"
              placeholder="Ej: Fecha de nacimiento"
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                border: "2px solid #c084fc",
                borderRadius: "8px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "6px" }}>
              Tipo de campo:
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "8px",
                marginTop: "5px",
              }}
            >
              {tiposDeCampo.map((campo) => (
                <button
                  key={campo.value}
                  type="button"
                  onClick={() => setTipo(campo.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: tipo === campo.value ? "#d8b4fe" : "#f3e8ff", // resalta seleccionado
                    border:
                      tipo === campo.value
                        ? "2px solid #9333ea"
                        : "2px solid transparent",
                    color: "#3b0764",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  {campo.icon}
                  {campo.label}
                </button>
              ))}
            </div>
          </div>

          {["checkbox", "select", "radio"].includes(tipo) && (
            <div style={{ marginBottom: "10px" }}>
              <label>Opciones:</label>
              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <input
                  type="text"
                  placeholder="Escribe una opción..."
                  value={nuevaOpcion}
                  onChange={(e) => setNuevaOpcion(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "2px solid #c084fc",
                    borderRadius: "8px",
                  }}
                />
                <button
                  onClick={agregarOpcion}
                  style={{
                    background: "#a855f7",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    cursor: "pointer",
                  }}
                >
                  + Agregar
                </button>
              </div>

              <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
                {opciones.map((op, i) => (
                  <li
                    key={i}
                    style={{
                      background: "#f3e8ff",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      marginBottom: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{op}</span>
                    <button
                      onClick={() => eliminarOpcion(i)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#9333ea",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tipo === "archivo" && (
            <div style={{ marginBottom: "10px" }}>
              <label>Tipo de archivo permitido:</label>
              <select
                value={tipoArchivo}
                onChange={(e) => setTipoArchivo(e.target.value)}
                style={{
                  padding: "8px",
                  border: "2px solid #c084fc",
                  borderRadius: "8px",
                  marginLeft: "10px",
                }}
              >
                <option value="todos">
                  Todos (PDF, Word, imágenes, videos)
                </option>
                <option value="documentos">Solo documentos (PDF, Word)</option>
                <option value="imagenes">Solo imágenes (JPG, PNG)</option>
                <option value="videos">Solo videos (MP4, MOV)</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: "10px" }}>
            <label>Obligatorio:</label>
            <input
              type="checkbox"
              checked={obligatorio}
              onChange={(e) => setObligatorio(e.target.checked)}
              style={{ marginLeft: "10px" }}
            />
          </div>

          <button
            type="submit"
            onClick={handleGuardarCampo}
            style={{
              background: editando ? "#9333ea" : "#a855f7",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {editando ? "Actualizar campo" : "Agregar campo"}
          </button>
        </form>
      </div>

      {/* Panel lateral */}
      <div
        style={{
          flex: 1,
          background: "#f3e8ff",
          borderRadius: "12px",
          padding: "15px",
        }}
      >
        <h3 style={{ color: "#6b21a8" }}>Campos agregados</h3>
        {campos.length === 0 ? (
          <p style={{ color: "#a855f7" }}>Aún no hay campos registrados.</p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="campos">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ listStyle: "none", padding: 0 }}
                >
                  {campos.map((campo, index) => (
                    <Draggable
                      key={campo.id.toString()}
                      draggableId={campo.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            background: snapshot.isDragging
                              ? "#d8b4fe"
                              : "#e9d5ff",
                            borderRadius: "8px",
                            padding: "8px 10px",
                            marginBottom: "6px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            boxShadow: snapshot.isDragging
                              ? "0 4px 8px rgba(0,0,0,0.2)"
                              : "none",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div
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
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              flex: 1,
                              cursor: "pointer",
                            }}
                          >
                            {/* 🔹 Ícono */}
                            {
                              tiposDeCampo.find((t) => t.value === campo.tipo)
                                ?.icon
                            }

                            {/* 🔹 Etiqueta */}
                            <span>{campo.etiqueta}</span>

                            {/* 🔹 Tipo de campo */}
                            <span
                              style={{ fontWeight: "500", color: "#6b21a8" }}
                            >
                              —{" "}
                              {
                                tiposDeCampo.find((t) => t.value === campo.tipo)
                                  ?.label
                              }
                            </span>
                          </div>

                          <button
                            onClick={() => handleEliminarCampo(campo.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#7e22ce",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                          >
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
