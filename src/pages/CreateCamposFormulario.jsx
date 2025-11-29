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
  SquarePen,
  Info, // 👈 nuevo
} from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import "./CreateCamposFormulario.css"; // <<--- IMPORTA EL CSS

// Formatea "2025-11-20" o "2025-11-20T00:00:00.000000Z" → "20 de noviembre de 2025"
// sin problemas de zona horaria
const MESES_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function formatearFechaLegible(fechaStr) {
  if (!fechaStr) return "";
  const solo = String(fechaStr).slice(0, 10); // "YYYY-MM-DD"
  const [y, m, d] = solo.split("-").map(Number);
  if (!y || !m || !d) return "";

  const dia = d.toString().padStart(2, "0");
  const mesNombre = MESES_ES[m - 1] ?? "";
  return `${dia} de ${mesNombre} de ${y}`;
}

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
  const [formulario, setFormulario] = useState(null);
  const [editandoMeta, setEditandoMeta] = useState(false);

  const [tituloForm, setTituloForm] = useState("");
  const [descripcionForm, setDescripcionForm] = useState("");
  const [fechaCierre, setFechaCierre] = useState(""); // formato yyyy-mm-dd

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
    const fetchDatos = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [resForm, resCampos] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/formularios/${id}`,
            { headers }
          ),
          axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/formularios/${id}/campos`,
            { headers }
          ),
        ]);

        // 👉 Datos del formulario
        const f = resForm.data;
        setFormulario(f);
        setTituloForm(f.titulo || ""); // ajusta si el campo se llama distinto
        setDescripcionForm(f.descripcion || "");
        setFechaCierre(
          f.fecha_cierre ? String(f.fecha_cierre).slice(0, 10) : ""
        ); // yyyy-mm-dd

        // 👉 Campos del formulario (lo que ya tenías)
        const payload = resCampos.data;
        const lista = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.campos)
          ? payload.campos
          : [];
        setCampos(lista);
      } catch (err) {
        console.error("Error al obtener datos del formulario", err);
        setCampos([]);
      }
    };

    fetchDatos();
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

      const dataCampo = {
        etiqueta,
        tipo,
        obligatorio,
        opciones: opcionesFinales,
      };

      if (editando && campoActual) {
        const response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/campos-formulario/${
            campoActual.id
          }`,
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

  const handleGuardarMetaFormulario = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        titulo: tituloForm,
        descripcion: descripcionForm,
        fecha_cierre: fechaCierre || null, // si está vacío, lo mandamos null
      };

      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/formularios/${id}`,
        payload,
        { headers }
      );

      // actualiza estado local
      setFormulario((prev) => ({ ...prev, ...res.data }));
      setEditandoMeta(false);
      alert("Datos del formulario actualizados ✅");
    } catch (err) {
      console.error("Error al actualizar formulario", err);
      alert("No se pudieron actualizar los datos del formulario ❌");
    }
  };

  const handleCancelarMeta = () => {
    if (!formulario) return;
    setTituloForm(formulario.titulo || "");
    setDescripcionForm(formulario.descripcion || "");
    setFechaCierre(
      formulario.fecha_cierre
        ? String(formulario.fecha_cierre).slice(0, 10)
        : ""
    );
    setEditandoMeta(false);
  };

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
    <div className="nexo-page">
      {/* Panel principal */}
      <div className="nexo-main">
        {/* META DEL FORMULARIO: nombre, descripción y fecha de cierre */}
        {formulario && (
          <div
            style={{
              background: "var(--color-bg)", // antes #eef2ff
              border: "1px solid var(--color-gray-light)", // antes #c4b5fd
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "18px",
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            {!editandoMeta ? (
              <>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: "var(--color-dark)",
                      marginBottom: 4,
                    }}
                  >
                    {formulario.titulo || "Formulario sin título"}
                  </div>
                  <div
                    style={{ color: "var(--color-gray)", fontSize: "0.9rem" }}
                  >
                    {formulario.descripcion || "Sin descripción"}
                  </div>
                  {formulario.fecha_cierre && (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: "0.85rem",
                        color: "var(--color-primary-dark)",
                      }}
                    >
                      Cierra el:{" "}
                      <strong>
                        {formatearFechaLegible(formulario.fecha_cierre)}
                      </strong>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="nexo-btn nexo-btn-secondary nexo-btn-icon"
                  onClick={() => setEditandoMeta(true)}
                  title="Editar datos del formulario"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    gap: 0,
                  }}
                >
                  <SquarePen size={18} />
                </button>
              </>
            ) : (
              <div style={{ width: "100%" }}>
                <div className="nexo-field">
                  <label className="nexo-label">Nombre del formulario</label>
                  <input
                    type="text"
                    className="nexo-input"
                    value={tituloForm}
                    onChange={(e) => setTituloForm(e.target.value)}
                  />
                </div>

                <div className="nexo-field">
                  <label className="nexo-label">Descripción</label>
                  <textarea
                    className="nexo-input"
                    rows={3}
                    value={descripcionForm}
                    onChange={(e) => setDescripcionForm(e.target.value)}
                  />
                </div>

                <div className="nexo-field">
                  <label className="nexo-label">Fecha de cierre</label>
                  <input
                    type="date"
                    className="nexo-input"
                    value={fechaCierre || ""}
                    onChange={(e) => setFechaCierre(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  <button
                    type="button"
                    className="nexo-btn nexo-btn-secondary"
                    onClick={handleGuardarMetaFormulario}
                  >
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    className="nexo-btn"
                    onClick={handleCancelarMeta}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <h2 className="nexo-title">
          Campos del Formulario
          <Link
            to={`/formularios/${id}/preview`}
            className="nexo-btn nexo-btn-primary"
          >
            Vista previa
          </Link>
        </h2>

        {/* 👇 AGREGAR ESTA NOTA INFORMATIVA */}
        <div
          style={{
            background: "var(--color-bg)",
            border: "1px dashed var(--color-gray-light)",
            borderRadius: "8px",
            padding: "8px 12px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.85rem",
            color: "var(--color-gray)",
          }}
        >
          <Info size={18} className="nexo-info-icon" />
          <span>
            El correo electrónico del postulante se registra de forma automática
            al completar el formulario.
          </span>
        </div>

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
                  className={`nexo-type-chip ${
                    tipo === campo.value ? "is-active" : ""
                  }`}
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
                <button
                  onClick={agregarOpcion}
                  className="nexo-btn nexo-btn-primary"
                >
                  + Agregar
                </button>
              </div>

              <ul className="nexo-opciones">
                {opciones.map((op, i) => (
                  <li key={i} className="nexo-opcion">
                    <span>{op}</span>
                    <button
                      onClick={() => eliminarOpcion(i)}
                      className="nexo-opcion-remove"
                    >
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
                <option value="todos">
                  Todos (PDF, Word, imágenes, videos)
                </option>
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

          <button
            type="submit"
            onClick={handleGuardarCampo}
            className="nexo-btn nexo-btn-secondary"
          >
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
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="nexo-list"
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
                          className={`nexo-item ${
                            snapshot.isDragging ? "dragging" : ""
                          }`}
                          style={provided.draggableProps.style} // mantener estilos de posición del DnD
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
                            {
                              tiposDeCampo.find((t) => t.value === campo.tipo)
                                ?.icon
                            }
                            <span>{campo.etiqueta}</span>
                            <span className="nexo-item-type">
                              —{" "}
                              {
                                tiposDeCampo.find((t) => t.value === campo.tipo)
                                  ?.label
                              }
                            </span>
                          </div>

                          <button
                            onClick={() => handleEliminarCampo(campo.id)}
                            className="nexo-item-remove"
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
